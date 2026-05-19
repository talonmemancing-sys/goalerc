// GOAL — On-chain reader (Ethereum mainnet, real data, no demo)
// Pulls live state from the deployed GOAL/countryFactory/countryCurves once on
// load and every 60s thereafter. Exposes a tiny subscribe() API so React views
// re-render when fresh data lands. countryState() in data/countries.js reads
// from this cache.

(function () {
  const cfg = window.GOAL_CONFIG;
  const CAP = 960_000;
  const PACKS = window.PACKS_PER_COUNTRY || 18000;
  const ASYMPTOTE = window.COUNTRY_ASYMPTOTE || 20000;
  const VIRTUAL = window.VIRTUAL_PITCH || 20000;
  const PACK_PRICE = window.PACK_PRICE || 6.9;

  // Public mainnet RPCs that send permissive CORS for browsers.
  // User can override via localStorage.setItem("goal_rpc", "https://...").
  // Tried in order; first one that responds wins.
  const userOverride = (() => { try { return localStorage.getItem("goal_rpc"); } catch { return null; } })();
  const RPCS = (userOverride ? [userOverride] : []).concat([
    "https://cloudflare-eth.com",
    "https://eth.merkle.io",
    "https://ethereum-rpc.publicnode.com",
    "https://eth-mainnet.public.blastapi.io",
    "https://ethereum.blockpi.network/v1/rpc/public",
    "https://eth.drpc.org",
    "https://rpc.ankr.com/eth",
    "https://eth.llamarpc.com",
  ]);

  const ERC20_ABI = [
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function symbol() view returns (string)",
  ];
  const COUNTRY_FACTORY_ABI = [
    "function tokens(uint256) view returns (address)",
    "function curves(uint256) view returns (address)",
  ];
  const COUNTRY_CURVE_ABI = [
    "function phase2Active() view returns (bool)",
    "function reservePITCH() view returns (uint256)",
  ];
  const COUNTRY_PACK_OPENER_ABI = [
    "function windowClosesAt() view returns (uint64)",
    "function openedAt() view returns (uint64)",
  ];
  const PLAYER_FACTORY_ABI = [
    "function tokens(uint256) view returns (address)",
    "function curves(uint256) view returns (address)",
  ];
  const PLAYER_ROLE_MAX = { CPT: 1500, BST: 500, RKE: 2500 };
  const PLAYER_ROLE_ORDER = ["CPT", "BST", "RKE"]; // playerIndex = countryId*3 + role

  // The COUNTRIES array uses FIFA three-letter codes (POR, CRO, NED, KSA…),
  // while many contracts use ISO 3166-1 alpha-3 (PRT, HRV, NLD, SAU…). We
  // accept either, with this normalization table running in both directions.
  const ISO_ALIAS = {
    // ISO3 → FIFA
    PRT: "POR", HRV: "CRO", NLD: "NED", SAU: "KSA", ZAF: "RSA",
    CHE: "SUI", DNK: "DEN", DEU: "GER", URY: "URU",
    // FIFA → ISO3 (reverse, so we can match in either direction)
    POR: "PRT", CRO: "HRV", NED: "NLD", KSA: "SAU", RSA: "ZAF",
    SUI: "CHE", DEN: "DNK", GER: "DEU", URU: "URY",
  };
  function normalizeIso(raw) {
    if (!raw) return "";
    const up = raw.toUpperCase();
    // Direct hit on COUNTRIES?
    if (window.COUNTRIES?.find?.((c) => c.id === up)) return up;
    // Try alias
    const aliased = ISO_ALIAS[up];
    if (aliased && window.COUNTRIES?.find?.((c) => c.id === aliased)) return aliased;
    return up; // unmatched — keep raw so we can log a warning later
  }

  const listeners = new Set();
  const state = {
    loading: true,
    error: null,
    rpcUrl: null,
    blockNumber: 0,
    totalSupply: CAP,
    burned: 0,
    circulating: CAP,
    countries: {},       // id -> { tokenAddr, curveAddr, packsSold, sealed, curveOpen, supply, reserve, price, burnedFromCurve }
    countryAddrs: {},    // id -> { tokenAddr, curveAddr }
    players: {},         // "ISO-ROLE" -> { tokenAddr, curveAddr, supply, reserve, curveOpen, price, max }
    pool: {              // V4 GOAL/ETH pool
      active: false,
      poolId: null,
      sqrtPriceX96: null,
      initBlock: null,
    },
    packWindow: {        // Global pack window (from countryPackOpener)
      openedAt: 0,
      closesAt: 0,
    },
    lastUpdate: 0,
  };

  // Precompute the V4 poolId from the configured PoolKey.
  // PoolId = keccak256(abi.encode(currency0, currency1, fee, tickSpacing, hooks))
  function computePoolId() {
    if (!cfg.pool || !window.ethers) return null;
    try {
      const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "address", "uint24", "int24", "address"],
        [cfg.pool.currency0, cfg.pool.currency1, cfg.pool.fee, cfg.pool.tickSpacing, cfg.pool.hooks]
      );
      return ethers.keccak256(encoded);
    } catch { return null; }
  }

  function notify() {
    listeners.forEach((fn) => { try { fn(state); } catch (e) { console.error(e); } });
  }

  async function pickProvider() {
    if (!window.ethers) return null;
    // Race all RPCs in parallel — fastest responder wins. Previously this was
    // sequential, so we'd wait for slow RPCs to time out before trying the
    // next one. Now total selection time = the fastest reachable RPC.
    const candidates = RPCS.map((url) => {
      try {
        const p = new ethers.JsonRpcProvider(url, 1, { staticNetwork: true });
        return p.getBlockNumber().then(() => ({ p, url }));
      } catch (e) {
        return Promise.reject(e);
      }
    });
    try {
      const winner = await Promise.any(candidates);
      state.rpcUrl = winner.url;
      return winner.p;
    } catch (e) {
      return null;
    }
  }

  let provider = null;
  let loading = false;
  // Pool of additional providers tried for log calls when the primary one
  // 503s / hangs / rejects.
  const fallbackProviders = [];
  function ensureFallbackProviders() {
    if (fallbackProviders.length) return fallbackProviders;
    for (const url of RPCS) {
      if (provider && provider._getConnection?.()?.url === url) continue;
      try {
        fallbackProviders.push(new ethers.JsonRpcProvider(url, 1, { staticNetwork: true }));
      } catch {}
    }
    return fallbackProviders;
  }

  // Try a read fn across providers until one succeeds. Used for log calls
  // (getLogs) which fail intermittently on public RPCs.
  async function tryAcrossRpcs(fn) {
    const tryList = [provider, ...ensureFallbackProviders()].filter(Boolean);
    let lastErr = null;
    for (const p of tryList) {
      try {
        const result = await Promise.race([
          fn(p),
          new Promise((_, rej) => setTimeout(() => rej(new Error("RPC timeout 12s")), 12_000)),
        ]);
        return result;
      } catch (e) {
        lastErr = e;
        // Continue to next RPC
      }
    }
    throw lastErr || new Error("All RPCs failed");
  }

  async function loadAll() {
    if (loading) return;
    loading = true;
    try {
      if (!provider) {
        provider = await pickProvider();
        if (!provider) {
          state.error = "No mainnet RPC reachable";
          state.loading = false;
          notify();
          return;
        }
      }

      const goal = new ethers.Contract(cfg.goal, ERC20_ABI, provider);
      const factory = new ethers.Contract(cfg.countryFactory, COUNTRY_FACTORY_ABI, provider);
      const playerFactory = new ethers.Contract(cfg.playerFactory, PLAYER_FACTORY_ABI, provider);

      const packOpener = new ethers.Contract(cfg.countryPackOpener, COUNTRY_PACK_OPENER_ABI, provider);

      // Phases 1 + 2 are independent, fire them in parallel — saves one RTT.
      //   1) GOAL.totalSupply + block number + pack-window timestamps (4 calls)
      //   2) factory.tokens(i) + factory.curves(i) for all 48 countries (96 calls)
      // ethers v6 batches all these into ~1 HTTP round trip total.
      const [phase1, addrPairs] = await Promise.all([
        Promise.all([
          goal.totalSupply(),
          provider.getBlockNumber(),
          packOpener.openedAt().catch(() => 0n),
          packOpener.windowClosesAt().catch(() => 0n),
        ]),
        Promise.all(window.COUNTRIES.map((_, i) =>
          Promise.all([factory.tokens(i), factory.curves(i)])
            .catch(() => [ethers.ZeroAddress, ethers.ZeroAddress])
        )),
      ]);
      const [totalSupplyWei, blockNumber, openedAtBn, closesAtBn] = phase1;
      state.packWindow.openedAt = Number(openedAtBn);
      state.packWindow.closesAt = Number(closesAtBn);
      const totalSupply = Number(ethers.formatEther(totalSupplyWei));
      state.totalSupply = totalSupply;
      state.circulating = totalSupply;
      state.burned = Math.max(0, CAP - totalSupply);
      state.blockNumber = blockNumber;

      // 3) For each country, read symbol/supply/phase2/reserve in parallel.
      //    Symbol like "ARGC" → ISO3 = "ARG". Maps the contract's ordering to
      //    our COUNTRIES array regardless of how the contract sequenced them.
      const details = await Promise.all(
        addrPairs.map(async ([tokenAddr, curveAddr], idx) => {
          if (!tokenAddr || tokenAddr === ethers.ZeroAddress) return null;
          const token = new ethers.Contract(tokenAddr, ERC20_ABI, provider);
          const curve = new ethers.Contract(curveAddr, COUNTRY_CURVE_ABI, provider);
          try {
            const [symbol, supplyWei, phase2, reserveWei] = await Promise.all([
              token.symbol().catch(() => ""),
              token.totalSupply(),
              curve.phase2Active().catch(() => false),
              curve.reservePITCH().catch(() => 0n),
            ]);
            const rawIso = (symbol || "").slice(0, 3).toUpperCase();
            const iso = normalizeIso(rawIso);
            return {
              contractIdx: idx,
              symbol: symbol || "",
              rawIso,
              iso,
              tokenAddr,
              curveAddr,
              supply: Number(ethers.formatEther(supplyWei)),
              phase2: Boolean(phase2),
              reserve: Number(ethers.formatEther(reserveWei)),
            };
          } catch (e) {
            return { contractIdx: idx, symbol: "", rawIso: "", iso: "", tokenAddr, curveAddr, supply: 0, phase2: false, reserve: 0 };
          }
        })
      );

      // Build iso → contractIdx map so callers can compute the correct uint8
      // for buyPack / openPlayerPacks regardless of UI ordering.
      const isoToContractIdx = {};
      details.forEach((d) => { if (d && d.iso) isoToContractIdx[d.iso] = d.contractIdx; });
      state.isoToContractIdx = isoToContractIdx;

      // Index details by the iso pulled from the on-chain symbol.
      const byIso = {};
      details.forEach((d) => { if (d && d.iso) byIso[d.iso] = d; });

      // Surface any unmapped countries so we can fix the alias table if a
      // new code shows up. Only log once per loadAll.
      const knownIds = new Set(window.COUNTRIES.map((c) => c.id));
      const unmapped = details.filter((d) => d && d.rawIso && !knownIds.has(d.iso));
      if (unmapped.length) {
        console.warn(
          "[CHAIN] Unmapped country symbols (add to ISO_ALIAS in data/chain.js):",
          unmapped.map((d) => `idx=${d.contractIdx} symbol=${d.symbol} rawIso=${d.rawIso}`)
        );
      }

      window.COUNTRIES.forEach((c) => {
        const d = byIso[c.id];
        if (!d) {
          state.countries[c.id] = {
            tokenAddr: null, curveAddr: null, contractIdx: null,
            packsSold: 0, sealed: false, curveOpen: false,
            supply: 0, reserve: 0, price: PACK_PRICE, burnedFromCurve: 0,
            unavailable: true,
          };
          return;
        }
        const supply = d.supply;
        const reserve = d.reserve;
        const curveOpen = d.phase2;
        const sealed = curveOpen || supply >= PACKS - 1;
        const packsSold = Math.min(PACKS, Math.floor(supply));
        const price = curveOpen && supply < ASYMPTOTE
          ? (VIRTUAL + reserve) / (ASYMPTOTE - supply)
          : PACK_PRICE;
        state.countries[c.id] = {
          tokenAddr: d.tokenAddr,
          curveAddr: d.curveAddr,
          contractIdx: d.contractIdx,
          packsSold,
          sealed,
          curveOpen,
          supply,
          reserve,
          price: Number(price.toFixed(3)),
          burnedFromCurve: 0,
        };
        state.countryAddrs[c.id] = { tokenAddr: d.tokenAddr, curveAddr: d.curveAddr, contractIdx: d.contractIdx };
      });

      // ── PROGRESSIVE NOTIFY #1 ──
      // Country data is enough for: home grid, pack pages, country market.
      // Player data + pool detection continue in the background — UI can already
      // render and accept buy clicks for any country.
      state.loading = false;
      state.error = null;
      state.lastUpdate = Date.now();
      notify();

      // 4) Player factory — 144 tokens. Player index = contractCountryId * 3 + role
      //    (role 0=CPT, 1=BST, 2=RKE per the contract spec). We iterate by the
      //    contractIdx we discovered above so the iso-mapping stays correct.
      const playerJobs = [];
      const playerJobKeys = [];
      window.COUNTRIES.forEach((c) => {
        const ci = isoToContractIdx[c.id];
        if (ci === undefined) return;
        PLAYER_ROLE_ORDER.forEach((role, ri) => {
          const onchainIdx = ci * 3 + ri;
          playerJobKeys.push({ key: `${c.id}-${role}`, role, onchainIdx });
          playerJobs.push(
            Promise.all([playerFactory.tokens(onchainIdx), playerFactory.curves(onchainIdx)])
              .catch(() => [ethers.ZeroAddress, ethers.ZeroAddress])
          );
        });
      });
      const playerAddrPairs = await Promise.all(playerJobs);
      const playerDetails = await Promise.all(
        playerAddrPairs.map(async ([tokenAddr, curveAddr]) => {
          if (!tokenAddr || tokenAddr === ethers.ZeroAddress) return null;
          const token = new ethers.Contract(tokenAddr, ERC20_ABI, provider);
          const curve = new ethers.Contract(curveAddr, COUNTRY_CURVE_ABI, provider);
          try {
            const [supplyWei, phase2, reserveWei] = await Promise.all([
              token.totalSupply(),
              curve.phase2Active().catch(() => false),
              curve.reservePITCH().catch(() => 0n),
            ]);
            return {
              tokenAddr, curveAddr,
              supply: Number(ethers.formatEther(supplyWei)),
              phase2: Boolean(phase2),
              reserve: Number(ethers.formatEther(reserveWei)),
            };
          } catch {
            return { tokenAddr, curveAddr, supply: 0, phase2: false, reserve: 0 };
          }
        })
      );
      playerJobKeys.forEach(({ key, role, onchainIdx }, idx) => {
        const d = playerDetails[idx];
        const max = PLAYER_ROLE_MAX[role];
        if (!d) {
          state.players[key] = { tokenAddr: null, curveAddr: null, onchainIdx, supply: 0, reserve: 0, curveOpen: false, price: PACK_PRICE, max, unavailable: true };
          return;
        }
        const curveOpen = d.phase2;
        const price = curveOpen && d.supply < max
          ? (VIRTUAL + d.reserve) / (max - d.supply)
          : PACK_PRICE;
        state.players[key] = {
          tokenAddr: d.tokenAddr,
          curveAddr: d.curveAddr,
          onchainIdx,
          supply: d.supply,
          reserve: d.reserve,
          curveOpen,
          price: Number(price.toFixed(3)),
          max,
        };
      });

      // 5) V4 GOAL/ETH pool detection — public RPCs cap eth_getLogs to ~10k
      //    blocks, so we sticky-scan: each refresh, scan from where we left
      //    off up to head. First-ever scan covers latest-10k → head (enough
      //    to catch the pool init when it happens going forward).
      if (!state.pool.active) {
        if (!state.pool.poolId) state.pool.poolId = computePoolId();
        if (state.pool.poolId) {
          try {
            const INIT_TOPIC0 = ethers.id(
              "Initialize(bytes32,address,address,uint24,int24,address,uint160,int24)"
            );
            const head = blockNumber;
            const from = state.pool.lastScannedBlock != null
              ? state.pool.lastScannedBlock + 1
              : Math.max(0, head - 10_000);
            // Don't re-scan; only forward.
            if (from <= head) {
              const logs = await provider.send("eth_getLogs", [{
                address: cfg.v4PoolManager,
                fromBlock: "0x" + from.toString(16),
                toBlock:   "0x" + head.toString(16),
                topics:    [INIT_TOPIC0, state.pool.poolId],
              }]);
              if (logs && logs.length > 0) {
                const log = logs[0];
                // 4 indexed topics (sig, id, currency0, currency1); data has
                // [fee:uint24, tickSpacing:int24, hooks:address, sqrtPriceX96:uint160, tick:int24].
                try {
                  const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
                    ["uint24","int24","address","uint160","int24"],
                    log.data
                  );
                  state.pool.sqrtPriceX96 = decoded[3].toString();
                } catch {}
                state.pool.active = true;
                state.pool.initBlock = parseInt(log.blockNumber, 16);
              }
              state.pool.lastScannedBlock = head;
            }
          } catch (e) { /* RPC range error etc — retry next refresh */ }
        }
      }

      // ── PROGRESSIVE NOTIFY #2 ──
      // Player data and pool detection fully loaded.
      state.lastUpdate = Date.now();
      notify();
    } catch (e) {
      console.error("[CHAIN] loadAll failed", e);
      state.error = e?.shortMessage || e?.message || "Failed to read mainnet";
      state.loading = false;
      notify();
    } finally {
      loading = false;
    }
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  // ERC20 Transfer event topic — every pack open mints 1 country token, so
  // log{topic0=Transfer, topic1=0x0, address=tokenAddr} == 1 pack opened.
  const TRANSFER_TOPIC0 = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  const ZERO_TOPIC = "0x" + "0".repeat(64);
  const blockTimeCache = new Map();

  async function getBlockTimestamp(bn) {
    if (blockTimeCache.has(bn)) return blockTimeCache.get(bn);
    try {
      const block = await provider.getBlock(bn);
      const ts = block ? Number(block.timestamp) : null;
      blockTimeCache.set(bn, ts);
      return ts;
    } catch { return null; }
  }

  async function getRecentPackOpens(tokenAddr, limit = 8, lookbackBlocks = 10_000) {
    if (!provider || !tokenAddr) return [];
    const latest = await tryAcrossRpcs((p) => p.getBlockNumber());
    const fromBlock = Math.max(0, latest - lookbackBlocks);
    const logs = await tryAcrossRpcs((p) => p.send("eth_getLogs", [{
      address: tokenAddr,
      fromBlock: "0x" + fromBlock.toString(16),
      toBlock: "latest",
      topics: [TRANSFER_TOPIC0, ZERO_TOPIC],
    }]));
    // Group by tx — multi-pack opens emit N Transfers in one tx.
    const byTx = new Map();
    for (const log of logs) {
      const txHash = log.transactionHash;
      const buyer = "0x" + log.topics[2].slice(-40);
      const block = parseInt(log.blockNumber, 16);
      if (!byTx.has(txHash)) byTx.set(txHash, { txHash, buyer, block, count: 0 });
      byTx.get(txHash).count += 1;
    }
    const events = Array.from(byTx.values()).sort((a, b) => b.block - a.block).slice(0, limit);
    // Resolve timestamps in parallel.
    await Promise.all(events.map(async (e) => {
      e.timestamp = await getBlockTimestamp(e.block);
    }));
    return events;
  }

  // Fetch ERC20 Transfer logs in a token contract over the recent window.
  // Returns the raw logs (NOT grouped). Used by swap/trade feeds.
  async function getRecentTransfers(tokenAddr, limit = 8, lookbackBlocks = 10_000) {
    if (!provider || !tokenAddr) return [];
    const latest = await tryAcrossRpcs((p) => p.getBlockNumber());
    const fromBlock = Math.max(0, latest - lookbackBlocks);
    const logs = await tryAcrossRpcs((p) => p.send("eth_getLogs", [{
      address: tokenAddr,
      fromBlock: "0x" + fromBlock.toString(16),
      toBlock: "latest",
      topics: [TRANSFER_TOPIC0],
    }]));
    const events = logs.map((log) => ({
      txHash: log.transactionHash,
      from: "0x" + log.topics[1].slice(-40),
      to: "0x" + log.topics[2].slice(-40),
      value: BigInt(log.data || "0x0"),
      block: parseInt(log.blockNumber, 16),
      isMint: log.topics[1] === ZERO_TOPIC,
      isBurn: log.topics[2] === ZERO_TOPIC,
    })).sort((a, b) => b.block - a.block).slice(0, limit);
    await Promise.all(events.map(async (e) => { e.timestamp = await getBlockTimestamp(e.block); }));
    return events;
  }

  // GOAL token Burn events (Transfer to 0x0). Used by both the live feed
  // and the analytics computation below.
  async function _rawBurnLogs(lookbackBlocks) {
    if (!provider) return { logs: [], latest: 0, fromBlock: 0 };
    const latest = await tryAcrossRpcs((p) => p.getBlockNumber());
    const fromBlock = Math.max(0, latest - lookbackBlocks);
    const logs = await tryAcrossRpcs((p) => p.send("eth_getLogs", [{
      address: cfg.goal,
      fromBlock: "0x" + fromBlock.toString(16),
      toBlock: "latest",
      topics: [TRANSFER_TOPIC0, null, ZERO_TOPIC],
    }]));
    return { logs, latest, fromBlock };
  }

  async function getRecentBurns(limit = 12, lookbackBlocks = 10_000) {
    const { logs } = await _rawBurnLogs(lookbackBlocks);
    const events = logs.map((log) => ({
      txHash: log.transactionHash,
      from: "0x" + log.topics[1].slice(-40),
      value: Number(ethers.formatEther(BigInt(log.data || "0x0"))),
      block: parseInt(log.blockNumber, 16),
    })).sort((a, b) => b.block - a.block).slice(0, limit);
    await Promise.all(events.map(async (e) => { e.timestamp = await getBlockTimestamp(e.block); }));
    return events;
  }

  // 24h burn rate + per-curve leaderboard. Single getLogs call (~7200 blocks
  // ≈ 24h on mainnet at 12s/block, well within public-RPC range limits).
  // Each Transfer-to-zero event's `from` tells us which contract did the burn:
  //   - countryPackOpener  → pack-purchase fee
  //   - country curve addr → country-curve buy/sell fee
  //   - player curve addr  → player-curve buy/sell fee
  async function getBurnAnalytics(lookbackBlocks = 7200) {
    if (!provider) return null;
    const { logs, latest, fromBlock } = await _rawBurnLogs(lookbackBlocks);

    // Resolve fromBlock + latest timestamps to compute real hours-in-window.
    const [tFrom, tLatest] = await Promise.all([
      getBlockTimestamp(fromBlock),
      getBlockTimestamp(latest),
    ]);
    const hours = tFrom && tLatest ? Math.max(1/60, (tLatest - tFrom) / 3600) : (lookbackBlocks * 12 / 3600);

    // Bucket by `from` address (lower-cased for comparison).
    const byAddr = new Map();
    let total = 0n;
    for (const log of logs) {
      const from = ("0x" + log.topics[1].slice(-40)).toLowerCase();
      const value = BigInt(log.data || "0x0");
      total += value;
      byAddr.set(from, (byAddr.get(from) || 0n) + value);
    }

    // Map curve/contract address → label for the leaderboard.
    const labels = new Map();
    labels.set(cfg.countryPackOpener.toLowerCase(), { name: "Pack purchases", kind: "pack" });
    labels.set(cfg.playerPackOpener.toLowerCase(),  { name: "Player pack opens", kind: "pack" });
    for (const iso in state.countryAddrs) {
      const a = state.countryAddrs[iso];
      if (a?.curveAddr) labels.set(a.curveAddr.toLowerCase(), { name: iso + " curve", kind: "country", iso });
    }
    for (const key in state.players) {
      const a = state.players[key];
      if (a?.curveAddr) labels.set(a.curveAddr.toLowerCase(), { name: key + " curve", kind: "player", key });
    }

    const leaderboard = [];
    for (const [addr, amt] of byAddr) {
      const lbl = labels.get(addr);
      leaderboard.push({
        addr,
        label: lbl?.name || addr.slice(0, 10) + "…",
        kind: lbl?.kind || "unknown",
        iso: lbl?.iso || null,
        key: lbl?.key || null,
        amount: Number(ethers.formatEther(amt)),
      });
    }
    leaderboard.sort((a, b) => b.amount - a.amount);

    return {
      total: Number(ethers.formatEther(total)),
      hours,
      ratePerHour: Number(ethers.formatEther(total)) / hours,
      ratePer24h: (Number(ethers.formatEther(total)) / hours) * 24,
      leaderboard,
      fromBlock,
      latestBlock: latest,
      fromTimestamp: tFrom,
      latestTimestamp: tLatest,
    };
  }

  // Per-curve trade history — Bought + Sold events, with marginal price
  // computed directly from event args (no archive-node state replay needed).
  //   Bought.pitchIn      = GOAL paid by user (5% will burn, 95% to reserve)
  //   Bought.tokenOut     = curve tokens minted to user
  //   Bought.feeBurned    = 5% of pitchIn that went straight to burn
  //   marginal price (post-fee) = (pitchIn - feeBurned) / tokenOut
  //
  //   Sold.tokenIn        = curve tokens burned by user
  //   Sold.pitchOut       = GOAL paid to user (net of 5% fee)
  //   Sold.feeBurned      = 5% of gross GOAL out
  //   marginal price      = (pitchOut + feeBurned) / tokenIn
  const CURVE_TRADE_IFACE_ABI = [
    "event Bought(address indexed user, uint256 pitchIn, uint256 tokenOut, uint256 feeBurned)",
    "event Sold(address indexed user, uint256 tokenIn, uint256 pitchOut, uint256 feeBurned)",
  ];
  let _curveTradeIface = null;
  function getCurveTradeIface() {
    if (!_curveTradeIface) _curveTradeIface = new ethers.Interface(CURVE_TRADE_IFACE_ABI);
    return _curveTradeIface;
  }

  async function getCurveTradeHistory(curveAddr, lookbackBlocks = 50_000, limit = 500) {
    if (!provider || !curveAddr) return [];
    const latest = await tryAcrossRpcs((p) => p.getBlockNumber());
    const fromBlock = Math.max(0, latest - lookbackBlocks);
    const BOUGHT_TOPIC = ethers.id("Bought(address,uint256,uint256,uint256)");
    const SOLD_TOPIC   = ethers.id("Sold(address,uint256,uint256,uint256)");
    let logs = [];
    try {
      logs = await tryAcrossRpcs((p) => p.send("eth_getLogs", [{
        address: curveAddr,
        fromBlock: "0x" + fromBlock.toString(16),
        toBlock: "latest",
        topics: [[BOUGHT_TOPIC, SOLD_TOPIC]],
      }]));
    } catch (e) {
      // Some RPCs don't support topic-array OR. Fall back to two separate calls.
      try {
        const [a, b] = await Promise.all([
          tryAcrossRpcs((p) => p.send("eth_getLogs", [{ address: curveAddr,
            fromBlock: "0x" + fromBlock.toString(16), toBlock: "latest",
            topics: [BOUGHT_TOPIC] }])),
          tryAcrossRpcs((p) => p.send("eth_getLogs", [{ address: curveAddr,
            fromBlock: "0x" + fromBlock.toString(16), toBlock: "latest",
            topics: [SOLD_TOPIC] }])),
        ]);
        logs = [...a, ...b];
      } catch { return []; }
    }
    const iface = getCurveTradeIface();
    const events = [];
    for (const log of logs) {
      try {
        const parsed = iface.parseLog(log);
        if (!parsed) continue;
        const block = parseInt(log.blockNumber, 16);
        const logIndex = parseInt(log.logIndex, 16);
        if (parsed.name === "Bought") {
          const pitchIn   = parsed.args.pitchIn;
          const tokenOut  = parsed.args.tokenOut;
          const feeBurned = parsed.args.feeBurned;
          const netIn = pitchIn - feeBurned;
          // marginal price (GOAL per curve-token) = netIn / tokenOut
          const price = tokenOut > 0n
            ? Number(ethers.formatEther(netIn)) / Number(ethers.formatEther(tokenOut))
            : 0;
          events.push({
            kind: "buy", txHash: log.transactionHash, block, logIndex,
            user: "0x" + log.topics[1].slice(-40),
            pitchIn:  Number(ethers.formatEther(pitchIn)),
            tokenOut: Number(ethers.formatEther(tokenOut)),
            burned:   Number(ethers.formatEther(feeBurned)),
            price,
          });
        } else if (parsed.name === "Sold") {
          const tokenIn  = parsed.args.tokenIn;
          const pitchOut = parsed.args.pitchOut;
          const feeBurned = parsed.args.feeBurned;
          const grossOut = pitchOut + feeBurned;
          const price = tokenIn > 0n
            ? Number(ethers.formatEther(grossOut)) / Number(ethers.formatEther(tokenIn))
            : 0;
          events.push({
            kind: "sell", txHash: log.transactionHash, block, logIndex,
            user: "0x" + log.topics[1].slice(-40),
            tokenIn:  Number(ethers.formatEther(tokenIn)),
            pitchOut: Number(ethers.formatEther(pitchOut)),
            burned:   Number(ethers.formatEther(feeBurned)),
            price,
          });
        }
      } catch { /* skip malformed */ }
    }
    events.sort((a, b) => a.block - b.block || a.logIndex - b.logIndex);
    // Resolve timestamps (cached).
    await Promise.all(events.map(async (e) => { e.timestamp = await getBlockTimestamp(e.block); }));
    return events.slice(-limit);
  }

  window.CHAIN = {
    get state() { return state; },
    get _provider() { return provider; },
    subscribe,
    refresh: loadAll,
    isReady: () => !state.loading && !state.error,
    getRecentPackOpens,
    getRecentTransfers,
    getRecentBurns,
    getBurnAnalytics,
    getCurveTradeHistory,
  };

  function start() {
    loadAll();
    setInterval(loadAll, 60_000);
  }

  if (window.ethers) {
    start();
  } else {
    const t0 = Date.now();
    const wait = setInterval(() => {
      if (window.ethers) { clearInterval(wait); start(); }
      else if (Date.now() - t0 > 10_000) {
        clearInterval(wait);
        state.error = "ethers.js failed to load (check network/CSP)";
        state.loading = false;
        notify();
      }
    }, 100);
  }
})();
