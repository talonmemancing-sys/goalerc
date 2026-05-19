// GOAL — real on-chain transactions.
// Encodes & sends: buyCountryPack, openPlayerPack (VRF 2-step), curve buy/sell.
// Reads quotes from curve.quoteBuy / curve.quoteSell.

(function () {
  const cfg = window.GOAL_CONFIG;

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

  async function getSignerCtx() {
    if (!window.WALLET?.state?.connected) throw new Error("Wallet not connected");
    if (!window.WALLET.state.onMainnet) {
      await window.WALLET.switchToMainnet();
      if (!window.WALLET.state.onMainnet) throw new Error("Please switch to Ethereum mainnet");
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

  async function ensureAllowance(tokenAddr, spender, amount, signer, owner) {
    const token = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
    const current = await token.allowance(owner, spender);
    if (current >= amount) return null;
    const tx = await token.approve(spender, amount);
    await tx.wait();
    return tx.hash;
  }

  function isoToContractIdx(iso) {
    const i = window.CHAIN?.state?.isoToContractIdx?.[iso];
    if (i === undefined) throw new Error(`Country ${iso} not yet loaded from chain`);
    return i;
  }

  // ── BUY COUNTRY PACK ─────────────────────────────────────────────────
  async function buyCountryPack(iso, nPacks, onStep) {
    const { signer, address } = await getSignerCtx();
    const country = isoToContractIdx(iso);
    const pricePerPack = ethers.parseEther("6.9");
    const cost = pricePerPack * BigInt(nPacks);

    if (onStep) onStep("approving");
    await ensureAllowance(cfg.goal, cfg.countryPackOpener, cost, signer, address);

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

  // ── CURVE: BUY (pay GOAL, receive curve token) ──────────────────────
  async function curveBuy(curveAddr, pitchInWei, slippageBps = 100, onStep) {
    const { signer, address } = await getSignerCtx();
    const curveRead = new ethers.Contract(curveAddr, CURVE_ABI, window.CHAIN._provider);
    const expectedOut = await curveRead.quoteBuy(pitchInWei);
    const minOut = (expectedOut * (10000n - BigInt(slippageBps))) / 10000n;

    if (onStep) onStep("approving");
    await ensureAllowance(cfg.goal, curveAddr, pitchInWei, signer, address);

    if (onStep) onStep("sending");
    const curve = new ethers.Contract(curveAddr, CURVE_ABI, signer);
    const tx = await curve.buy(pitchInWei, minOut);
    if (onStep) onStep("mining", tx.hash);
    const receipt = await tx.wait();
    if (onStep) onStep("done", tx.hash);
    return { txHash: tx.hash, expectedOut, minOut, receipt };
  }

  // ── CURVE: SELL (burn curve token, receive GOAL) ────────────────────
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
      const q = await opener.quota(country);
      return {
        captainLeft: Number(q.captainLeft),
        bestLeft: Number(q.bestLeft),
        rookieLeft: Number(q.rookieLeft),
        sealedRoles: Boolean(q.sealedRoles),
        total: Number(q.captainLeft) + Number(q.bestLeft) + Number(q.rookieLeft),
      };
    } catch { return null; }
  }

  window.TX = {
    buyCountryPack,
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
