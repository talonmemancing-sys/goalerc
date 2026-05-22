// FOOTBALL — external price feeds (DexScreener + GeckoTerminal), BSC mainnet.
// DexScreener:    real-time price, 24h delta, volume, liquidity (any DEX-indexed pair)
// GeckoTerminal: historical OHLCV bars for K-line charts
// Both have permissive CORS, no API key needed.

(function () {
  const cfg = window.FOOTBALL_CONFIG;

  const state = {
    loading: true,
    error: null,
    goal: null,        // FOOTBALL price snapshot (key kept as `goal` for API compatibility): { priceUsd, priceNative, change24h, change1h, volume24h, liquidityUsd, pairAddress, pairUrl, dexId, lastUpdate }
    ohlcvCache: {},    // `${poolAddr}|${timeframe}` → { bars, fetchedAt }
  };

  const listeners = new Set();
  function notify() { listeners.forEach((fn) => { try { fn(state); } catch (e) { console.error(e); } }); }
  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  async function fetchDexScreener() {
    // FOOTBALL token CA is filled in config after graduation; until then there
    // is nothing to query.
    if (!cfg.football) {
      state.goal = null;
      state.loading = false;
      state.error = null;
      notify();
      return;
    }
    try {
      const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${cfg.football}`);
      if (!r.ok) throw new Error("DexScreener HTTP " + r.status);
      const data = await r.json();
      if (!data?.pairs || data.pairs.length === 0) {
        state.goal = null; // pair not yet indexed by DexScreener
        state.loading = false;
        state.error = null;
        notify();
        return;
      }
      // Pick the highest-liquidity pair on BSC.
      const pairs = data.pairs.filter((p) => p.chainId === "bsc");
      const best = (pairs.length ? pairs : data.pairs)
        .slice()
        .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
      state.goal = {
        priceUsd: parseFloat(best.priceUsd) || 0,
        priceNative: parseFloat(best.priceNative) || 0,
        change24h: best.priceChange?.h24 ?? 0,
        change1h: best.priceChange?.h1 ?? 0,
        volume24h: best.volume?.h24 ?? 0,
        liquidityUsd: best.liquidity?.usd ?? 0,
        pairAddress: best.pairAddress,
        pairUrl: best.url,
        dexId: best.dexId,
        lastUpdate: Date.now(),
      };
      state.loading = false;
      state.error = null;
      notify();
    } catch (e) {
      state.error = e?.message || "DexScreener failed";
      state.loading = false;
      notify();
    }
  }

  // GeckoTerminal OHLCV bars for a specific pool (the PancakeSwap V2
  // FOOTBALL/WBNB pair on BSC).
  // timeframe: "minute" | "hour" | "day"
  // aggregate: 1, 5, 15, 30 (minute) | 1, 4, 12 (hour) | 1 (day)
  async function getOHLCV(poolAddr, timeframe = "hour", aggregate = 1, limit = 100) {
    if (!poolAddr) return null;
    const key = `${poolAddr}|${timeframe}|${aggregate}`;
    const cached = state.ohlcvCache[key];
    if (cached && Date.now() - cached.fetchedAt < 60_000) return cached.bars;
    try {
      const url = `https://api.geckoterminal.com/api/v2/networks/bsc/pools/${poolAddr}/ohlcv/${timeframe}?aggregate=${aggregate}&limit=${limit}`;
      const r = await fetch(url, { headers: { accept: "application/json" } });
      if (!r.ok) return null;
      const data = await r.json();
      const list = data?.data?.attributes?.ohlcv_list || [];
      // Each row: [timestamp_seconds, open, high, low, close, volume]
      const bars = list.map((row) => ({
        t: row[0], o: row[1], h: row[2], l: row[3], c: row[4], v: row[5],
      })).sort((a, b) => a.t - b.t);
      state.ohlcvCache[key] = { bars, fetchedAt: Date.now() };
      return bars;
    } catch { return null; }
  }

  window.PRICES = {
    get state() { return state; },
    subscribe,
    refresh: fetchDexScreener,
    getOHLCV,
  };

  // Auto-start
  fetchDexScreener();
  setInterval(fetchDexScreener, 60_000);
})();
