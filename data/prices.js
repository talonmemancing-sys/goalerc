// GOAL — external price feeds (DexScreener + GeckoTerminal).
// DexScreener:    real-time price, 24h delta, volume, liquidity (any DEX-indexed pair)
// GeckoTerminal: historical OHLCV bars for K-line charts
// Both have permissive CORS, no API key needed.

(function () {
  const cfg = window.GOAL_CONFIG;

  const state = {
    loading: true,
    error: null,
    goal: null,        // { priceUsd, priceNative, change24h, change1h, volume24h, liquidityUsd, pairAddress, pairUrl, dexId, lastUpdate }
    ohlcvCache: {},    // `${poolAddr}|${timeframe}` → { bars, fetchedAt }
  };

  const listeners = new Set();
  function notify() { listeners.forEach((fn) => { try { fn(state); } catch (e) { console.error(e); } }); }
  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  async function fetchDexScreener() {
    try {
      const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${cfg.goal}`);
      if (!r.ok) throw new Error("DexScreener HTTP " + r.status);
      const data = await r.json();
      if (!data?.pairs || data.pairs.length === 0) {
        state.goal = null; // pool not yet indexed by DexScreener
        state.loading = false;
        state.error = null;
        notify();
        return;
      }
      // Pick the highest-liquidity pair on Ethereum.
      const pairs = data.pairs.filter((p) => p.chainId === "ethereum");
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

  // GeckoTerminal OHLCV bars for a specific pool (the V4 GOAL/ETH pool).
  // timeframe: "minute" | "hour" | "day"
  // aggregate: 1, 5, 15, 30 (minute) | 1, 4, 12 (hour) | 1 (day)
  async function getOHLCV(poolAddr, timeframe = "hour", aggregate = 1, limit = 100) {
    if (!poolAddr) return null;
    const key = `${poolAddr}|${timeframe}|${aggregate}`;
    const cached = state.ohlcvCache[key];
    if (cached && Date.now() - cached.fetchedAt < 60_000) return cached.bars;
    try {
      const url = `https://api.geckoterminal.com/api/v2/networks/eth/pools/${poolAddr}/ohlcv/${timeframe}?aggregate=${aggregate}&limit=${limit}`;
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
