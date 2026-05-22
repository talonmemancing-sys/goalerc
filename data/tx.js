// FOOTBALL — real on-chain transactions (BSC mainnet).
// Encodes & sends: buyCountryPack, openPlayerPack (VRF 2-step), curve buy/sell.
// Reads quotes from curve.quoteBuy / curve.quoteSell.

(function () {
  const cfg = window.FOOTBALL_CONFIG;

  const ERC20_ABI = [
    "function approve(address,uint256) returns (bool)",
    "function allowance(address,address) view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
  ];

  const COUNTRY_PACK_OPENER_ABI = [
    "function buyPack(uint8 country, uint256 nPacks)",
    "function activateCountry(uint8 country)",
    "function phase2Activated(uint8 country) view returns (bool)",
    "function tokensLeft(uint8 country) view returns (uint256)",
    "function windowClosesAt() view returns (uint64)",
    "function openedAt() view returns (uint64)",
    "event PackPurchased(address indexed user, uint8 indexed country, uint256 packs, uint256 pitchSpent, uint256 pitchBurned, uint256 tokensMinted)",
    "event CountryActivated(uint8 indexed country, uint256 supply)",
  ];

  const PLAYER_PACK_OPENER_ABI = [
    "function openPlayerPacks(uint8 country, uint16 nPacks) returns (uint256 requestId)",
    "function claim(uint256 requestId)",
    "function recoverStuckRequest(uint256 requestId)",
    "function pendingOf(uint256 requestId) view returns (address user, uint8 country, uint16 packs, bool fulfilled, bool claimed)",
    "function packsLeftByRole(uint8 country) view returns (uint16 captain, uint16 best, uint16 rookie)",
    "function quota(uint8 country) view returns (uint16 captainLeft, uint16 bestLeft, uint16 rookieLeft, bool sealedRoles)",
    "function committed(uint8 country) view returns (uint16)",
    "event PackPurchased(address indexed user, uint8 indexed country, uint16 packs, uint256 indexed requestId)",
    "event RandomFulfilled(uint256 indexed requestId)",
    "event PackRevealed(address indexed user, uint8 indexed country, uint8 role, uint16 packs, uint256 tokensMinted)",
    "event CountryRolesSealed(uint8 indexed country)",
    "event StuckRequestRecovered(uint256 indexed requestId, address indexed user, uint256 refunded)",
  ];

  const CURVE_ABI = [
    "function buy(uint256 pitchIn, uint256 minOut) returns (uint256 tokenOut)",
    "function sell(uint256 tokenIn, uint256 minOut) returns (uint256 pitchOut)",
    "function quoteBuy(uint256 pitchIn) view returns (uint256 tokenOut)",
    "function quoteSell(uint256 tokenIn) view returns (uint256 pitchOut)",
    "function priceNow() view returns (uint256)",
    "function phase2Active() view returns (bool)",
    "function reservePITCH() view returns (uint256)",
    "function asymptote() view returns (uint256)",
    "function virtualPitch() view returns (uint256)",
    "event Bought(address indexed user, uint256 pitchIn, uint256 tokenOut, uint256 feeBurned)",
    "event Sold(address indexed user, uint256 tokenIn, uint256 pitchOut, uint256 feeBurned)",
  ];

  const TREASURY_ABI = [
    "function claimable(address) view returns (uint256)",
    "function packsBought(address) view returns (uint256)",
    "function totalPacks() view returns (uint256)",
    "function dividendPoolBnb() view returns (uint256)",
    "function championReserveBnb() view returns (uint256)",
    "function undistributed() view returns (uint256)",
    "function claim()",
    "function distribute()",
  ];

  async function getSignerCtx() {
    if (!window.WALLET?.state?.connected) throw new Error("Wallet not connected");
    if (!window.WALLET.state.onMainnet) {
      await window.WALLET.switchToMainnet();
      if (!window.WALLET.state.onMainnet) throw new Error("Please switch to BNB Smart Chain");
    }
    const eip1193 = window.WALLET._provider;
    if (!eip1193) throw new Error("Wallet provider unavailable");
    const browser = new ethers.BrowserProvider(eip1193);
    const signer = await browser.getSigner();
    return {
      signer,
      address: window.WALLET.state.address,
      readProvider: window.CHAIN?._provider, // public RPC for reads
    };
  }

  // 授权 —— 针对手机钱包做了容错：
  //  · 用公共 RPC 轮询 allowance 来确认，而不是只靠 tx.wait()
  //    （很多手机钱包内置 RPC 会卡死/超时，即使授权其实已经上链）
  //  · 有非零残留授权先清零再授权（兼容 USDT 式代币）
  async function ensureAllowance(tokenAddr, spender, amount, signer, owner) {
    const token = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
    const readToken = window.CHAIN?._provider
      ? new ethers.Contract(tokenAddr, ERC20_ABI, window.CHAIN._provider)
      : token;
    const readAllowance = async () => {
      try { return await readToken.allowance(owner, spender); }
      catch { try { return await token.allowance(owner, spender); } catch { return 0n; } }
    };

    const current = await readAllowance();
    if (current >= amount) return null;

    // 轮询公共 RPC 直到 allowance 达标 —— 抗手机钱包 tx.wait() 卡死。
    const confirm = async (target, tx) => {
      const deadline = Date.now() + 150_000;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 3000));
        if ((await readAllowance()) >= target) return;
      }
      try { await tx.wait(); } catch {}
      if ((await readAllowance()) < target) {
        throw new Error("授权未在链上确认 —— 钱包可能没广播交易，请重试或换个钱包/浏览器");
      }
    };

    // USDT 式代币不允许「非零 → 非零」授权：有残留就先清零。
    if (current > 0n) {
      try {
        const tx0 = await token.approve(spender, 0n);
        try { await tx0.wait(); } catch {}
      } catch {}
    }

    // 授权无限额度（MaxUint256）—— 一次授权永久有效,不再每笔重复弹授权。
    // 标准 ERC20 对无限额度不递减,下次 ensureAllowance 直接命中 current>=amount 跳过。
    const tx = await token.approve(spender, ethers.MaxUint256);
    await confirm(amount, tx);
    return tx.hash;
  }

  function isoToContractIdx(iso) {
    // Primary: symbol-derived iso → on-chain index map.
    const i = window.CHAIN?.state?.isoToContractIdx?.[iso];
    if (i !== undefined) return i;
    // Fallback: per-country state may have contractIdx if loadAll completed
    // but didn't populate isoToContractIdx (shouldn't normally happen, but
    // keeps us resilient if the map gets cleared between loads).
    const cs = window.CHAIN?.state?.countries?.[iso];
    if (cs && cs.contractIdx !== undefined && cs.contractIdx !== null) return cs.contractIdx;
    throw new Error(
      `Country ${iso} not yet loaded from chain — wait a moment for the ` +
      `on-chain data to finish loading, then retry.`
    );
  }

  // ── BUY COUNTRY PACK ─────────────────────────────────────────────────
  async function buyCountryPack(iso, nPacks, onStep) {
    const { signer, address } = await getSignerCtx();
    const country = isoToContractIdx(iso);
    // Pack price (FOOTBALL-denominated) comes from config — set on graduation.
    // Fallback = BscParams 参考值（BNB=$600 场景）；部署日务必回填 config.packPriceFootball。
    const pricePerPack = ethers.parseEther(String(cfg.packPriceFootball || "3850"));
    const cost = pricePerPack * BigInt(nPacks);

    if (onStep) onStep("approving");
    // FOOTBALL is fee-on-transfer (4% DEX tax), but a plain ERC20 transfer to
    // a protocol contract is tax-exempt — the pack opener receives the full cost.
    await ensureAllowance(cfg.football, cfg.countryPackOpener, cost, signer, address);

    if (onStep) onStep("sending");
    const opener = new ethers.Contract(cfg.countryPackOpener, COUNTRY_PACK_OPENER_ABI, signer);
    const tx = await opener.buyPack(country, nPacks);
    if (onStep) onStep("mining", tx.hash);
    const receipt = await tx.wait();
    if (onStep) onStep("done", tx.hash);

    let tokensMinted = 0n;
    for (const log of receipt.logs) {
      try {
        const parsed = opener.interface.parseLog(log);
        if (parsed?.name === "PackPurchased") tokensMinted = parsed.args.tokensMinted;
      } catch {}
    }
    return { txHash: tx.hash, tokensMinted, receipt };
  }

  // ── PLAYER PACK: STEP 1 (open + VRF request) ────────────────────────
  async function openPlayerPack(iso, nPacks, onStep) {
    const { signer, address } = await getSignerCtx();
    const country = isoToContractIdx(iso);
    const countryTokenAddr = window.CHAIN.state.countryAddrs[iso]?.tokenAddr;
    if (!countryTokenAddr) throw new Error("Country token not deployed yet");

    const amount = ethers.parseEther(String(nPacks));

    if (onStep) onStep("approving");
    await ensureAllowance(countryTokenAddr, cfg.playerPackOpener, amount, signer, address);

    if (onStep) onStep("sending");
    const opener = new ethers.Contract(cfg.playerPackOpener, PLAYER_PACK_OPENER_ABI, signer);
    const tx = await opener.openPlayerPacks(country, nPacks);
    if (onStep) onStep("mining", tx.hash);
    const receipt = await tx.wait();

    let requestId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = opener.interface.parseLog(log);
        if (parsed?.name === "PackPurchased") {
          requestId = parsed.args.requestId;
          break;
        }
      } catch {}
    }
    if (!requestId) throw new Error("PackPurchased event not found in receipt");
    if (onStep) onStep("requested", tx.hash);
    return { txHash: tx.hash, requestId };
  }

  // ── PLAYER PACK: WAIT FOR VRF ───────────────────────────────────────
  async function waitForVrfFulfillment(requestId, { intervalMs = 8_000, timeoutMs = 600_000, onTick } = {}) {
    const opener = new ethers.Contract(cfg.playerPackOpener, PLAYER_PACK_OPENER_ABI, window.CHAIN._provider);
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
      try {
        const p = await opener.pendingOf(requestId);
        if (p.fulfilled) return p;
        if (onTick) onTick(Math.floor((Date.now() - t0) / 1000));
      } catch (e) { /* ignore, retry */ }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error("VRF fulfillment timed out");
  }

  // ── PLAYER PACK: STEP 2 (claim & reveal) ────────────────────────────
  async function claimPlayerPack(requestId, onStep) {
    const { signer } = await getSignerCtx();
    if (onStep) onStep("sending");
    const opener = new ethers.Contract(cfg.playerPackOpener, PLAYER_PACK_OPENER_ABI, signer);
    const tx = await opener.claim(requestId);
    if (onStep) onStep("mining", tx.hash);
    const receipt = await tx.wait();

    const reveals = [];
    for (const log of receipt.logs) {
      try {
        const parsed = opener.interface.parseLog(log);
        if (parsed?.name === "PackRevealed") {
          reveals.push({
            country: Number(parsed.args.country),
            roleIdx: Number(parsed.args.role),
            role: ["CPT","BST","RKE"][Number(parsed.args.role)],
            packs: Number(parsed.args.packs),
            tokensMinted: parsed.args.tokensMinted,
          });
        }
      } catch {}
    }
    if (onStep) onStep("done", tx.hash);
    return { txHash: tx.hash, reveals };
  }

  async function recoverStuckPack(requestId) {
    const { signer } = await getSignerCtx();
    const opener = new ethers.Contract(cfg.playerPackOpener, PLAYER_PACK_OPENER_ABI, signer);
    const tx = await opener.recoverStuckRequest(requestId);
    await tx.wait();
    return tx.hash;
  }

  // ── CURVE: BUY (pay FOOTBALL, receive curve token) ──────────────────
  async function curveBuy(curveAddr, pitchInWei, slippageBps = 100, onStep) {
    const { signer, address } = await getSignerCtx();
    const curveRead = new ethers.Contract(curveAddr, CURVE_ABI, window.CHAIN._provider);
    const expectedOut = await curveRead.quoteBuy(pitchInWei);
    const minOut = (expectedOut * (10000n - BigInt(slippageBps))) / 10000n;

    if (onStep) onStep("approving");
    await ensureAllowance(cfg.football, curveAddr, pitchInWei, signer, address);

    if (onStep) onStep("sending");
    const curve = new ethers.Contract(curveAddr, CURVE_ABI, signer);
    const tx = await curve.buy(pitchInWei, minOut);
    if (onStep) onStep("mining", tx.hash);
    const receipt = await tx.wait();
    if (onStep) onStep("done", tx.hash);
    return { txHash: tx.hash, expectedOut, minOut, receipt };
  }

  // ── CURVE: SELL (burn curve token, receive FOOTBALL) ────────────────
  async function curveSell(curveAddr, curveTokenAddr, tokenInWei, slippageBps = 100, onStep) {
    const { signer, address } = await getSignerCtx();
    const curveRead = new ethers.Contract(curveAddr, CURVE_ABI, window.CHAIN._provider);
    const expectedOut = await curveRead.quoteSell(tokenInWei);
    const minOut = (expectedOut * (10000n - BigInt(slippageBps))) / 10000n;

    if (onStep) onStep("approving");
    await ensureAllowance(curveTokenAddr, curveAddr, tokenInWei, signer, address);

    if (onStep) onStep("sending");
    const curve = new ethers.Contract(curveAddr, CURVE_ABI, signer);
    const tx = await curve.sell(tokenInWei, minOut);
    if (onStep) onStep("mining", tx.hash);
    const receipt = await tx.wait();
    if (onStep) onStep("done", tx.hash);
    return { txHash: tx.hash, expectedOut, minOut, receipt };
  }

  // ── QUOTES (read-only, cheap) ───────────────────────────────────────
  async function quoteBuy(curveAddr, pitchInWei) {
    if (!window.CHAIN?._provider || !curveAddr) return null;
    try {
      const curve = new ethers.Contract(curveAddr, CURVE_ABI, window.CHAIN._provider);
      return await curve.quoteBuy(pitchInWei);
    } catch { return null; }
  }
  async function quoteSell(curveAddr, tokenInWei) {
    if (!window.CHAIN?._provider || !curveAddr) return null;
    try {
      const curve = new ethers.Contract(curveAddr, CURVE_ABI, window.CHAIN._provider);
      return await curve.quoteSell(tokenInWei);
    } catch { return null; }
  }

  // ── COUNTRY PACK WINDOW INFO ────────────────────────────────────────
  async function getCountryWindowInfo(iso) {
    if (!window.CHAIN?._provider) return null;
    const country = window.CHAIN.state.isoToContractIdx?.[iso];
    if (country === undefined) return null;
    try {
      const opener = new ethers.Contract(cfg.countryPackOpener, COUNTRY_PACK_OPENER_ABI, window.CHAIN._provider);
      const [phase2, tokensLeft, closesAt, openedAt] = await Promise.all([
        opener.phase2Activated(country),
        opener.tokensLeft(country),
        opener.windowClosesAt(),
        opener.openedAt(),
      ]);
      return {
        phase2: Boolean(phase2),
        tokensLeft: Number(ethers.formatEther(tokensLeft)),
        closesAt: Number(closesAt),
        openedAt: Number(openedAt),
      };
    } catch { return null; }
  }

  // ── ACTIVATE COUNTRY (anyone can call after cap or window expiry) ───
  async function activateCountry(iso) {
    const { signer } = await getSignerCtx();
    const country = isoToContractIdx(iso);
    const opener = new ethers.Contract(cfg.countryPackOpener, COUNTRY_PACK_OPENER_ABI, signer);
    const tx = await opener.buyPack ? await opener.activateCountry(country) : null;
    if (!tx) throw new Error("activateCountry not available");
    await tx.wait();
    return tx.hash;
  }

  // ── PLAYER PACK QUOTAS ──────────────────────────────────────────────
  async function getPlayerPackQuota(iso) {
    if (!window.CHAIN?._provider) return null;
    const country = window.CHAIN.state.isoToContractIdx?.[iso];
    if (country === undefined) return null;
    try {
      const opener = new ethers.Contract(cfg.playerPackOpener, PLAYER_PACK_OPENER_ABI, window.CHAIN._provider);
      // quota = 各角色「未领取」额度；committed = 已开包数（开包的真正闸门）。
      // 还能开 = 450 - committed —— 不能用 quota 之和（那含已开未领的包）。
      const [q, committed] = await Promise.all([
        opener.quota(country),
        opener.committed(country),
      ]);
      const PACKS = 450;
      return {
        captainLeft: Number(q.captainLeft),
        bestLeft: Number(q.bestLeft),
        rookieLeft: Number(q.rookieLeft),
        sealedRoles: Boolean(q.sealedRoles),
        total: Number(q.captainLeft) + Number(q.bestLeft) + Number(q.rookieLeft),
        committed: Number(committed),
        openable: Math.max(0, PACKS - Number(committed)),
      };
    } catch { return null; }
  }

  // ── TREASURY: 金库分红 ──────────────────────────────────────────────
  // 读取金库统计 + 某地址的可领分红（claimable 为 BNB wei）。
  async function getTreasuryStats(address) {
    if (!window.CHAIN?._provider || !cfg.treasury) return null;
    try {
      const t = new ethers.Contract(cfg.treasury, TREASURY_ABI, window.CHAIN._provider);
      const [claimable, packsBought, totalPacks, divPool, champ, undist] = await Promise.all([
        address ? t.claimable(address) : Promise.resolve(0n),
        address ? t.packsBought(address) : Promise.resolve(0n),
        t.totalPacks(),
        t.dividendPoolBnb(),
        t.championReserveBnb(),
        t.undistributed(),
      ]);
      return {
        claimable: Number(ethers.formatEther(claimable)),
        packsBought: Number(packsBought),
        totalPacks: Number(totalPacks),
        dividendPoolBnb: Number(ethers.formatEther(divPool)),
        championReserveBnb: Number(ethers.formatEther(champ)),
        undistributed: Number(ethers.formatEther(undist)),
      };
    } catch { return null; }
  }

  // 领取分红 —— 把 pendingDividend 的 BNB 转给调用者。
  async function claimDividend(onStep) {
    const { signer } = await getSignerCtx();
    if (onStep) onStep("sending");
    const t = new ethers.Contract(cfg.treasury, TREASURY_ABI, signer);
    const tx = await t.claim();
    if (onStep) onStep("mining", tx.hash);
    await tx.wait();
    if (onStep) onStep("done", tx.hash);
    return tx.hash;
  }

  // 结算金库 —— 把待分配的税收 BNB 拆进分红池/冠军储备。任何人可调用。
  async function distributeTreasury(onStep) {
    const { signer } = await getSignerCtx();
    if (onStep) onStep("sending");
    const t = new ethers.Contract(cfg.treasury, TREASURY_ABI, signer);
    const tx = await t.distribute();
    if (onStep) onStep("mining", tx.hash);
    await tx.wait();
    if (onStep) onStep("done", tx.hash);
    return tx.hash;
  }

  // ── 球员代币 1:1 兑换（旧卡死代币 → 新可交易代币）────────────────────
  const MIGRATOR_ABI = ["function swap(address oldToken, uint256 amount)"];

  /// 读取连接钱包持有的旧（卡死）球员代币余额。返回 balance>0 的项。
  async function getLegacyPlayerBalances(address) {
    if (!window.CHAIN?._provider || !address || !cfg.legacyPlayers) return [];
    const out = [];
    for (const lp of cfg.legacyPlayers) {
      try {
        const t = new ethers.Contract(lp.old, ERC20_ABI, window.CHAIN._provider);
        const bal = await t.balanceOf(address);
        if (bal > 0n) out.push({ id: lp.id, name: lp.name, nameEn: lp.nameEn, old: lp.old, balance: bal });
      } catch {}
    }
    return out;
  }

  /// 把旧球员代币 1:1 兑换成新的：授权 Migrator → swap（旧的销毁、新的铸出）。
  async function swapLegacyPlayer(oldToken, amountWei, onStep) {
    const { signer, address } = await getSignerCtx();
    if (onStep) onStep("approving");
    await ensureAllowance(oldToken, cfg.playerMigrator, amountWei, signer, address);
    if (onStep) onStep("sending");
    const mig = new ethers.Contract(cfg.playerMigrator, MIGRATOR_ABI, signer);
    const tx = await mig.swap(oldToken, amountWei);
    if (onStep) onStep("mining", tx.hash);
    await tx.wait();
    if (onStep) onStep("done", tx.hash);
    return tx.hash;
  }

  window.TX = {
    buyCountryPack,
    getTreasuryStats,
    claimDividend,
    distributeTreasury,
    getLegacyPlayerBalances,
    swapLegacyPlayer,
    openPlayerPack,
    waitForVrfFulfillment,
    claimPlayerPack,
    recoverStuckPack,
    curveBuy,
    curveSell,
    quoteBuy,
    quoteSell,
    getCountryWindowInfo,
    getPlayerPackQuota,
    activateCountry,
  };
})();
