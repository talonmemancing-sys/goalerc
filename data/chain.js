// FOOTBALL — On-chain reader (BSC mainnet, real data, no demo)
// Pulls live state from the deployed FOOTBALL/countryFactory/countryCurves once
// on load and every 60s thereafter. Exposes a tiny subscribe() API so React
// views re-render when fresh data lands. countryState() in data/countries.js
// reads from this cache.

(function () {
  const cfg = window.FOOTBALL_CONFIG;
  // FOOTBALL total supply — 1 billion (flap-fixed). Was GOAL's 960k cap.
  const CAP = 1_000_000_000;
  const PACKS = window.PACKS_PER_COUNTRY || 18000;
  const ASYMPTOTE = window.COUNTRY_ASYMPTOTE || 20000;
  const VIRTUAL = window.VIRTUAL_PITCH || 20000;
  const PACK_PRICE = window.PACK_PRICE || 6.9;

  // Public BSC mainnet RPCs. User can override via:
  //   localStorage.setItem("football_rpc", "https://your-key.example.com/...")
  // Tried in parallel via Promise.any for pickProvider; tryAcrossRpcs falls
  // through them sequentially for multicalls.
  const userOverride = (() => { try { return localStorage.getItem("football_rpc"); } catch { return null; } })();
  const RPCS = [];
  // Priority 1: user's localStorage override (for personal RPC keys)
  if (userOverride) RPCS.push(userOverride);
  // Priority 2: site's primary endpoint from config (the reliable one)
  if (cfg.primaryRpc) RPCS.push(cfg.primaryRpc);
  // Priority 3+: public BSC fallbacks if the primary is throttled or down
  RPCS.push(
    "https://bsc-dataseed.bnbchain.org",
    "https://bsc-dataseed1.defibit.io",
    "https://bsc-dataseed1.ninicoin.io",
    "https://rpc.ankr.com/bsc",
    "https://bsc.publicnode.com",
    "https://1rpc.io/bnb",
  );

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

  // Multicall3 — canonical deployment on every EVM chain, including BSC
  // mainnet (same address as Ethereum). Single eth_call returns all N
  // sub-call results, bypassing every RPC's JSON-RPC-batch limits.
  const MULTICALL3 = "0xcA11bde05977b3631167028862bE2a173976CA11";
  const MULTICALL3_ABI = [
    "function aggregate3((address target, bool allowFailure, bytes callData)[] calls) external payable returns ((bool success, bytes returnData)[] returnData)",
  ];
  let _multicall3Iface = null;
  function getMulticall3Iface() {
    if (!_multicall3Iface) _multicall3Iface = new ethers.Interface(MULTICALL3_ABI);
    return _multicall3Iface;
  }

  // Run an arbitrary list of {target, callData} read calls as one eth_call.
  // Returns parallel array of { success, returnData } in input order.
  async function multicall(p, calls) {
    if (!calls.length) return [];
    const mc = new ethers.Contract(MULTICALL3, MULTICALL3_ABI, p);
    const args = calls.map((c) => [c.target, true, c.callData]);
    // staticCall — never sends a tx, no gas, no nonce. Pure read.
    const results = await mc.aggregate3.staticCall(args);
    return results.map((r) => ({ success: r[0], returnData: r[1] }));
  }

  // Try a multicall across all known providers — needed because if the
  // primary RPC throws (rate-limit, CORS, etc.) we want to swap immediately.
  async function multicallAcross(calls) {
    return await tryAcrossRpcs((p) => multicall(p, calls));
  }

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
    pool: {              // FOOTBALL/WBNB market pool
      // TODO: BSC 改读 PancakeSwap V2 pair reserves —
      // 这里原本是 Uniswap V4 池子的状态（poolId / sqrtPriceX96）。
      // BSC 版应改为读 config.footballWbnbPair 的 getReserves()，
      // 用 reserve0 / reserve1 算 FOOTBALL/WBNB 价格。
      active: false,
      poolId: null,
      sqrtPriceX96: null,
      initBlock: null,
      // V2 字段（后续填充）：reserve0, reserve1, blockTimestampLast
    },
    packWindow: {        // Global pack window (from countryPackOpener)
      openedAt: 0,
      closesAt: 0,
    },
    lastUpdate: 0,
  };

  // TODO: BSC 改读 PancakeSwap V2 pair reserves —
  // 旧实现从 Uniswap V4 PoolKey 计算 poolId（keccak256(abi.encode(
  // currency0, currency1, fee, tickSpacing, hooks))）。BSC 上没有 V4 池子，
  // FOOTBALL 价格应改为读 config.footballWbnbPair 的 getReserves()
  // （returns uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast）。
  // 暂时保留桩函数返回 null，使下方池子检测整体跳过。
  function computePoolId() {
    return null;
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
        const p = new ethers.JsonRpcProvider(url, 56, { staticNetwork: true, batchMaxCount: 1 });
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
  // Pool of additional public-RPC providers tried when the primary one fails.
  const fallbackProviders = [];
  function ensureFallbackProviders() {
    if (fallbackProviders.length) return fallbackProviders;
    for (const url of RPCS) {
      if (provider && provider._getConnection?.()?.url === url) continue;
      try {
        fallbackProviders.push(new ethers.JsonRpcProvider(url, 56, { staticNetwork: true, batchMaxCount: 1 }));
      } catch {}
    }
    return fallbackProviders;
  }

  // When the user is connected via a wallet on mainnet, the wallet provider
  // (MetaMask, OKX, etc.) is an excellent fallback: the network request goes
  // through the extension, completely bypassing browser CORS. We rebuild it
  // each call to capture the latest wallet state.
  let _cachedWalletEthers = null;
  let _cachedWalletEip1193 = null;
  function getWalletProvider() {
    const ws = window.WALLET?.state;
    if (!ws?.connected || !ws.onMainnet) return null;
    const eip1193 = window.WALLET._provider;
    if (!eip1193) return null;
    if (_cachedWalletEip1193 !== eip1193) {
      try {
        _cachedWalletEthers = new ethers.BrowserProvider(eip1193);
        _cachedWalletEip1193 = eip1193;
      } catch { return null; }
    }
    return _cachedWalletEthers;
  }

  async function tryAcrossRpcs(fn) {
    const tryList = [provider, ...ensureFallbackProviders()].filter(Boolean);
    // Wallet provider as last resort — its network access can't be CORS-blocked.
    const walletProv = getWalletProvider();
    if (walletProv) tryList.push(walletProv);
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
          // All public RPCs failed — try the user's wallet as a last resort.
          const walletProv = getWalletProvider();
          if (walletProv) {
            provider = walletProv;
            state.rpcUrl = "wallet-fallback";
          } else {
            state.error = "All public RPCs unreachable. Connect a wallet to use its RPC, or set localStorage.football_rpc.";
            state.loading = false;
            notify();
            return;
          }
        }
      }

      // Encoders/decoders for multicall sub-calls.
      const ifaceErc20    = new ethers.Interface(ERC20_ABI);
      const ifaceFactory  = new ethers.Interface(COUNTRY_FACTORY_ABI);
      const ifaceCurve    = new ethers.Interface(COUNTRY_CURVE_ABI);
      const ifacePackOp   = new ethers.Interface(COUNTRY_PACK_OPENER_ABI);
      const ifacePFactory = new ethers.Interface(PLAYER_FACTORY_ABI);
      const decode = (iface, fn, res) => {
        if (!res?.success) return null;
        try { return iface.decodeFunctionResult(fn, res.returnData); } catch { return null; }
      };

      // ─── ROUND 1 (one eth_call): globals + 48 country (token, curve) addrs ───
      const r1Calls = [
        { target: cfg.football,          callData: ifaceErc20.encodeFunctionData("totalSupply") },
        { target: cfg.countryPackOpener, callData: ifacePackOp.encodeFunctionData("openedAt") },
        { target: cfg.countryPackOpener, callData: ifacePackOp.encodeFunctionData("windowClosesAt") },
      ];
      for (let i = 0; i < window.COUNTRIES.length; i++) {
        r1Calls.push({ target: cfg.countryFactory, callData: ifaceFactory.encodeFunctionData("tokens", [i]) });
        r1Calls.push({ target: cfg.countryFactory, callData: ifaceFactory.encodeFunctionData("curves", [i]) });
      }
      const [r1, blockNumber] = await Promise.all([
        multicallAcross(r1Calls),
        tryAcrossRpcs((p) => p.getBlockNumber()),
      ]);

      let ri = 0;
      const totalSupplyWei = decode(ifaceErc20,  "totalSupply",    r1[ri++])?.[0] ?? 0n;
      const openedAtBn     = decode(ifacePackOp, "openedAt",       r1[ri++])?.[0] ?? 0n;
      const closesAtBn     = decode(ifacePackOp, "windowClosesAt", r1[ri++])?.[0] ?? 0n;
      const addrPairs = [];
      for (let i = 0; i < window.COUNTRIES.length; i++) {
        const tokenAddr = decode(ifaceFactory, "tokens", r1[ri++])?.[0] ?? ethers.ZeroAddress;
        const curveAddr = decode(ifaceFactory, "curves", r1[ri++])?.[0] ?? ethers.ZeroAddress;
        addrPairs.push([tokenAddr, curveAddr]);
      }

      state.packWindow.openedAt = Number(openedAtBn);
      state.packWindow.closesAt = Number(closesAtBn);
      const totalSupply = Number(ethers.formatEther(totalSupplyWei));
      state.totalSupply = totalSupply;
      state.circulating = totalSupply;
      state.burned = Math.max(0, CAP - totalSupply);
      state.blockNumber = blockNumber;

      // ─── ROUND 2 (one eth_call): per-country symbol/supply/phase2/reserve ───
      const r2Calls = [];
      const r2Slots = []; // countryIdx for each block of 4 calls
      for (let i = 0; i < addrPairs.length; i++) {
        const [tokenAddr, curveAddr] = addrPairs[i];
        if (!tokenAddr || tokenAddr === ethers.ZeroAddress) continue;
        r2Slots.push(i);
        r2Calls.push({ target: tokenAddr, callData: ifaceErc20.encodeFunctionData("symbol") });
        r2Calls.push({ target: tokenAddr, callData: ifaceErc20.encodeFunctionData("totalSupply") });
        r2Calls.push({ target: curveAddr, callData: ifaceCurve.encodeFunctionData("phase2Active") });
        r2Calls.push({ target: curveAddr, callData: ifaceCurve.encodeFunctionData("reservePITCH") });
      }
      const r2 = r2Calls.length ? await multicallAcross(r2Calls) : [];

      const details = new Array(addrPairs.length).fill(null);
      for (let k = 0; k < r2Slots.length; k++) {
        const i = r2Slots[k];
        const o = k * 4;
        const symbol     = decode(ifaceErc20, "symbol",       r2[o + 0])?.[0] ?? "";
        const supplyWei  = decode(ifaceErc20, "totalSupply",  r2[o + 1])?.[0] ?? 0n;
        const phase2     = decode(ifaceCurve, "phase2Active", r2[o + 2])?.[0] ?? false;
        const reserveWei = decode(ifaceCurve, "reservePITCH", r2[o + 3])?.[0] ?? 0n;
        const rawIso = (symbol || "").slice(0, 3).toUpperCase();
        details[i] = {
          contractIdx: i,
          symbol: symbol || "",
          rawIso,
          iso: normalizeIso(rawIso),
          tokenAddr: addrPairs[i][0],
          curveAddr: addrPairs[i][1],
          supply: Number(ethers.formatEther(supplyWei)),
          phase2: Boolean(phase2),
          reserve: Number(ethers.formatEther(reserveWei)),
        };
      }

      // POSITION-BASED MAPPING: trust that COUNTRIES[i] in the UI matches
      // factory.tokens(i) on chain. The user has already confirmed buys at
      // position 0 (ARG) succeeded, so the ordering is correct.
      //
      // We still read symbol() to surface mismatches as warnings, but we
      // don't gate the UI on whether the parser picks "ARG" out of e.g.
      // "Goal-ARG" or "$ARG". That over-engineering was leaving real
      // countries permanently "unavailable" and locking their buy buttons.
      const isoToContractIdx = {};
      window.COUNTRIES.forEach((c, i) => { isoToContractIdx[c.id] = i; });
      state.isoToContractIdx = isoToContractIdx;

      // Sanity check: report any symbol that doesn't decode to the expected
      // iso. Doesn't block anything — just helps debug if rendering is off.
      const mismatches = [];
      details.forEach((d, i) => {
        if (!d) return;
        const expected = window.COUNTRIES[i]?.id;
        if (d.iso && expected && d.iso !== expected) {
          mismatches.push(`idx=${i} expected=${expected} got=${d.iso} symbol="${d.symbol}"`);
        }
      });
      if (mismatches.length) {
        console.warn("[CHAIN] Symbol mismatches (using position-based mapping):", mismatches);
      }

      window.COUNTRIES.forEach((c, i) => {
        const d = details[i];
        if (!d) {
          // Only "unavailable" if the contract actually returned 0x0 for this
          // slot — meaning the country token hasn't been deployed at this idx.
          state.countries[c.id] = {
            tokenAddr: null, curveAddr: null, contractIdx: i,
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
          contractIdx: i,
          packsSold,
          sealed,
          curveOpen,
          supply,
          reserve,
          price: Number(price.toFixed(3)),
          burnedFromCurve: 0,
        };
        state.countryAddrs[c.id] = { tokenAddr: d.tokenAddr, curveAddr: d.curveAddr, contractIdx: i };
      });

      // ── PROGRESSIVE NOTIFY #1 ──
      // Country data is enough for: home grid, pack pages, country market.
      // Player data + pool detection continue in the background — UI can already
      // render and accept buy clicks for any country.
      state.loading = false;
      state.error = null;
      state.lastUpdate = Date.now();
      notify();

      // ─── ROUND 3 (one eth_call): 144 player (token, curve) addresses ───
      const playerJobKeys = [];
      const r3Calls = [];
      window.COUNTRIES.forEach((c) => {
        const ci = isoToContractIdx[c.id];
        if (ci === undefined) return;
        PLAYER_ROLE_ORDER.forEach((role, ri) => {
          const onchainIdx = ci * 3 + ri;
          playerJobKeys.push({ key: `${c.id}-${role}`, role, onchainIdx });
          r3Calls.push({ target: cfg.playerFactory, callData: ifacePFactory.encodeFunctionData("tokens", [onchainIdx]) });
          r3Calls.push({ target: cfg.playerFactory, callData: ifacePFactory.encodeFunctionData("curves", [onchainIdx]) });
        });
      });
      const r3 = r3Calls.length ? await multicallAcross(r3Calls) : [];
      const playerAddrPairs = [];
      for (let k = 0; k < playerJobKeys.length; k++) {
        const o = k * 2;
        const tokenAddr = decode(ifacePFactory, "tokens", r3[o + 0])?.[0] ?? ethers.ZeroAddress;
        const curveAddr = decode(ifacePFactory, "curves", r3[o + 1])?.[0] ?? ethers.ZeroAddress;
        playerAddrPairs.push([tokenAddr, curveAddr]);
      }

      // ─── ROUND 4 (one eth_call): per-player supply/phase2/reserve ───
      const r4Calls = [];
      const r4Slots = [];
      for (let k = 0; k < playerAddrPairs.length; k++) {
        const [tokenAddr, curveAddr] = playerAddrPairs[k];
        if (!tokenAddr || tokenAddr === ethers.ZeroAddress) continue;
        r4Slots.push(k);
        r4Calls.push({ target: tokenAddr, callData: ifaceErc20.encodeFunctionData("totalSupply") });
        r4Calls.push({ target: curveAddr, callData: ifaceCurve.encodeFunctionData("phase2Active") });
        r4Calls.push({ target: curveAddr, callData: ifaceCurve.encodeFunctionData("reservePITCH") });
      }
      const r4 = r4Calls.length ? await multicallAcross(r4Calls) : [];
      const playerDetails = new Array(playerAddrPairs.length).fill(null);
      for (let kk = 0; kk < r4Slots.length; kk++) {
        const k = r4Slots[kk];
        const o = kk * 3;
        const supplyWei  = decode(ifaceErc20, "totalSupply",  r4[o + 0])?.[0] ?? 0n;
        const phase2     = decode(ifaceCurve, "phase2Active", r4[o + 1])?.[0] ?? false;
        const reserveWei = decode(ifaceCurve, "reservePITCH", r4[o + 2])?.[0] ?? 0n;
        playerDetails[k] = {
          tokenAddr: playerAddrPairs[k][0],
          curveAddr: playerAddrPairs[k][1],
          supply:  Number(ethers.formatEther(supplyWei)),
          phase2:  Boolean(phase2),
          reserve: Number(ethers.formatEther(reserveWei)),
        };
      }
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

      // 5) FOOTBALL/WBNB pool price.
      // TODO: BSC 改读 PancakeSwap V2 pair reserves —
      // 下面整段是旧的 Uniswap V4 池子检测：扫 v4PoolManager 的 Initialize
      // 事件、解码 sqrtPriceX96。BSC 上不适用，已整体注释掉。
      // 替代实现应该是一次 eth_call：
      //   const pair = new ethers.Contract(cfg.footballWbnbPair, PAIR_ABI, p);
      //   const [reserve0, reserve1] = await pair.getReserves();
      //   // 按 token0 < token1 的排序判断哪个 reserve 是 FOOTBALL / WBNB，
      //   // 价格 = reserveWBNB / reserveFOOTBALL（再乘 bnbPriceUsd 得 USD 价）。
      // PAIR_ABI: "function getReserves() view returns (uint112,uint112,uint32)",
      //           "function token0() view returns (address)"
      //
      // if (!state.pool.active) {
      //   if (!state.pool.poolId) state.pool.poolId = computePoolId();
      //   if (state.pool.poolId) {
      //     try {
      //       const INIT_TOPIC0 = ethers.id(
      //         "Initialize(bytes32,address,address,uint24,int24,address,uint160,int24)"
      //       );
      //       const head = blockNumber;
      //       const from = state.pool.lastScannedBlock != null
      //         ? state.pool.lastScannedBlock + 1
      //         : Math.max(0, head - SAFE_LOOKBACK);
      //       if (from <= head && head - from <= SAFE_LOOKBACK) {
      //         const logs = await safeGetLogs({
      //           address: cfg.v4PoolManager,
      //           fromBlock: "0x" + from.toString(16),
      //           toBlock:   "0x" + head.toString(16),
      //           topics:    [INIT_TOPIC0, state.pool.poolId],
      //         });
      //         if (logs && logs.length > 0) {
      //           const log = logs[0];
      //           try {
      //             const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
      //               ["uint24","int24","address","uint160","int24"],
      //               log.data
      //             );
      //             state.pool.sqrtPriceX96 = decoded[3].toString();
      //           } catch {}
      //           state.pool.active = true;
      //           state.pool.initBlock = Number(log.blockNumber);
      //         }
      //         state.pool.lastScannedBlock = head;
      //       }
      //     } catch (e) { /* RPC range error etc — retry next refresh */ }
      //   }
      // }

      // ── PROGRESSIVE NOTIFY #2 ──
      // Player data and pool detection fully loaded.
      state.lastUpdate = Date.now();
      notify();
    } catch (e) {
      console.error("[CHAIN] loadAll failed", e);
      state.error = e?.shortMessage || e?.message || "Failed to read BSC mainnet";
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

  async function getRecentPackOpens(tokenAddr, limit = 8, lookbackBlocks = SAFE_LOOKBACK) {
    if (!provider || !tokenAddr) return [];
    const latest = await tryAcrossRpcs((p) => p.getBlockNumber());
    if (typeof latest !== "number" || !Number.isFinite(latest) || latest <= 0) return [];
    const range = Math.min(SAFE_LOOKBACK, Math.max(1, lookbackBlocks));
    const fromBlock = Math.max(0, latest - range);
    const logs = await safeGetLogs({
      address: tokenAddr,
      fromBlock: "0x" + fromBlock.toString(16),
      toBlock:   "0x" + latest.toString(16),
      topics: [TRANSFER_TOPIC0, ZERO_TOPIC],
    });
    // Group by tx — multi-pack opens emit N Transfers in one tx.
    const byTx = new Map();
    for (const log of logs) {
      const txHash = log.transactionHash;
      const buyer = "0x" + log.topics[2].slice(-40);
      const block = Number(log.blockNumber);
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
  async function getRecentTransfers(tokenAddr, limit = 8, lookbackBlocks = SAFE_LOOKBACK) {
    if (!provider || !tokenAddr) return [];
    const latest = await tryAcrossRpcs((p) => p.getBlockNumber());
    if (typeof latest !== "number" || !Number.isFinite(latest) || latest <= 0) return [];
    const range = Math.min(SAFE_LOOKBACK, Math.max(1, lookbackBlocks));
    const fromBlock = Math.max(0, latest - range);
    const logs = await safeGetLogs({
      address: tokenAddr,
      fromBlock: "0x" + fromBlock.toString(16),
      toBlock:   "0x" + latest.toString(16),
      topics: [TRANSFER_TOPIC0],
    });
    const events = logs.map((log) => ({
      txHash: log.transactionHash,
      from: "0x" + log.topics[1].slice(-40),
      to: "0x" + log.topics[2].slice(-40),
      value: BigInt(log.data || "0x0"),
      block: Number(log.blockNumber),
      isMint: log.topics[1] === ZERO_TOPIC,
      isBurn: log.topics[2] === ZERO_TOPIC,
    })).sort((a, b) => b.block - a.block).slice(0, limit);
    await Promise.all(events.map(async (e) => { e.timestamp = await getBlockTimestamp(e.block); }));
    return events;
  }

  // FOOTBALL token Burn events (Transfer to 0x0). Used by both the live feed
  // and the analytics computation below.
  // Public BSC RPCs cap eth_getLogs to a limited block range. We use 9000
  // to stay well within range limits across the public node set.
  const SAFE_LOOKBACK = 9000;

  // Wrapped getLogs — uses ethers' high-level provider.getLogs() which encodes
  // params via the library (more compatible with strict RPC validators
  // than hand-rolled JSON-RPC). Normalizes the returned ethers Log objects to
  // a raw-RPC-like shape so downstream code keeps the same field access
  // (l.topics, l.data, l.transactionHash, l.blockNumber as number, l.logIndex).
  async function safeGetLogs(filter) {
    try {
      const logs = await tryAcrossRpcs((p) => p.getLogs(filter));
      // ethers v6 Log uses .index for log index; expose as .logIndex too.
      return (logs || []).map((l) => ({
        address: l.address,
        topics: l.topics,
        data: l.data,
        transactionHash: l.transactionHash,
        blockNumber: typeof l.blockNumber === "bigint" ? Number(l.blockNumber) : l.blockNumber,
        blockHash: l.blockHash,
        logIndex: l.index ?? l.logIndex,
      }));
    } catch (e) {
      console.error("[CHAIN] getLogs failed", { filter, error: e?.message || e });
      throw e;
    }
  }

  async function _rawBurnLogs(lookbackBlocks = SAFE_LOOKBACK) {
    if (!provider) return { logs: [], latest: 0, fromBlock: 0 };
    const latest = await tryAcrossRpcs((p) => p.getBlockNumber());
    if (typeof latest !== "number" || !Number.isFinite(latest) || latest <= 0) {
      throw new Error(`Invalid block number from RPC: ${latest}`);
    }
    const range = Math.min(SAFE_LOOKBACK, Math.max(1, lookbackBlocks));
    const fromBlock = Math.max(0, latest - range);
    // Filter by topic0 only on the server (some RPCs choke on `null` middle
    // topics); apply the "to == 0x0" burn check client-side.
    const allLogs = await safeGetLogs({
      address: cfg.football,
      fromBlock: "0x" + fromBlock.toString(16),
      toBlock:   "0x" + latest.toString(16),
      topics: [TRANSFER_TOPIC0],
    });
    const logs = (allLogs || []).filter((l) =>
      (l.topics?.[2] || "").toLowerCase() === ZERO_TOPIC
    );
    return { logs, latest, fromBlock };
  }

  async function getRecentBurns(limit = 12, lookbackBlocks = 10_000) {
    const { logs } = await _rawBurnLogs(lookbackBlocks);
    const events = logs.map((log) => ({
      txHash: log.transactionHash,
      from: "0x" + log.topics[1].slice(-40),
      value: Number(ethers.formatEther(BigInt(log.data || "0x0"))),
      block: Number(log.blockNumber),
    })).sort((a, b) => b.block - a.block).slice(0, limit);
    await Promise.all(events.map(async (e) => { e.timestamp = await getBlockTimestamp(e.block); }));
    return events;
  }

  // Burn rate + per-curve leaderboard. Single getLogs call. BSC blocks are
  // ~3s, so the SAFE_LOOKBACK window (9000 blocks) covers ~7.5h. The window's
  // real duration is derived from block timestamps below, so the rate maths
  // stays correct regardless of block time; ratePer24h extrapolates from it.
  // Each Transfer-to-zero event's `from` tells us which contract did the burn:
  //   - countryPackOpener  → pack-purchase fee
  //   - country curve addr → country-curve buy/sell fee
  //   - player curve addr  → player-curve buy/sell fee
  async function getBurnAnalytics(lookbackBlocks = SAFE_LOOKBACK) {
    if (!provider) return null;
    const { logs, latest, fromBlock } = await _rawBurnLogs(lookbackBlocks);

    // Resolve fromBlock + latest timestamps to compute real hours-in-window.
    const [tFrom, tLatest] = await Promise.all([
      getBlockTimestamp(fromBlock),
      getBlockTimestamp(latest),
    ]);
    // Fallback assumes BSC ~3s block time if timestamps are unavailable.
    const hours = tFrom && tLatest ? Math.max(1/60, (tLatest - tFrom) / 3600) : (lookbackBlocks * 3 / 3600);

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
  //   Bought.pitchIn      = FOOTBALL paid by user (5% will burn, 95% to reserve)
  //   Bought.tokenOut     = curve tokens minted to user
  //   Bought.feeBurned    = 5% of pitchIn that went straight to burn
  //   marginal price (post-fee) = (pitchIn - feeBurned) / tokenOut
  //
  //   Sold.tokenIn        = curve tokens burned by user
  //   Sold.pitchOut       = FOOTBALL paid to user (net of 5% fee)
  //   Sold.feeBurned      = 5% of gross FOOTBALL out
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

  async function getCurveTradeHistory(curveAddr, lookbackBlocks = SAFE_LOOKBACK, limit = 500) {
    if (!provider || !curveAddr) return [];
    const latest = await tryAcrossRpcs((p) => p.getBlockNumber());
    if (typeof latest !== "number" || !Number.isFinite(latest) || latest <= 0) return [];
    const range = Math.min(SAFE_LOOKBACK, Math.max(1, lookbackBlocks));
    const fromBlock = Math.max(0, latest - range);
    const toBlockHex = "0x" + latest.toString(16);
    const fromBlockHex = "0x" + fromBlock.toString(16);
    const BOUGHT_TOPIC = ethers.id("Bought(address,uint256,uint256,uint256)");
    const SOLD_TOPIC   = ethers.id("Sold(address,uint256,uint256,uint256)");
    let logs = [];
    try {
      logs = await safeGetLogs({
        address: curveAddr,
        fromBlock: fromBlockHex,
        toBlock: toBlockHex,
        topics: [[BOUGHT_TOPIC, SOLD_TOPIC]],
      });
    } catch (e) {
      // Some RPCs reject topic-array OR. Fall back to two separate calls.
      try {
        const [a, b] = await Promise.all([
          safeGetLogs({ address: curveAddr, fromBlock: fromBlockHex, toBlock: toBlockHex, topics: [BOUGHT_TOPIC] }),
          safeGetLogs({ address: curveAddr, fromBlock: fromBlockHex, toBlock: toBlockHex, topics: [SOLD_TOPIC]   }),
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
        const block = Number(log.blockNumber);
        const logIndex = Number(log.logIndex);
        if (parsed.name === "Bought") {
          const pitchIn   = parsed.args.pitchIn;
          const tokenOut  = parsed.args.tokenOut;
          const feeBurned = parsed.args.feeBurned;
          const netIn = pitchIn - feeBurned;
          // marginal price (FOOTBALL per curve-token) = netIn / tokenOut
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
