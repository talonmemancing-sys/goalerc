// FOOTBALL — Burn dashboard (scoreboard style)
const Burn = ({ setRoute, burned }) => {
  const chain = (window.useChain ? window.useChain() : (window.CHAIN?.state || {}));
  // Real burn feed + analytics — FOOTBALL Transfer logs where to == 0x0.
  const [feed, setFeed] = React.useState(null);
  const [feedError, setFeedError] = React.useState(null);
  const [analytics, setAnalytics] = React.useState(null);
  const [analyticsError, setAnalyticsError] = React.useState(null);
  const [retryNonce, setRetryNonce] = React.useState(0);

  React.useEffect(() => {
    let cancel = false;
    // Load each independently — if one fails the other still renders.
    async function loadFeed() {
      if (!window.CHAIN?._provider) return;
      try {
        const burns = await Promise.race([
          window.CHAIN.getRecentBurns(18),
          new Promise((_, rej) => setTimeout(() => rej(new Error(L("RPC 在 20 秒后超时", "RPC timed out after 20s"))), 20_000)),
        ]);
        if (!cancel) { setFeed(burns); setFeedError(null); }
      } catch (e) {
        if (!cancel) setFeedError(e?.message || L("加载销毁动态失败", "Failed to load burn feed"));
      }
    }
    async function loadAnalytics() {
      if (!window.CHAIN?._provider) return;
      try {
        const an = await Promise.race([
          window.CHAIN.getBurnAnalytics(7200), // ≈24h on BSC
          new Promise((_, rej) => setTimeout(() => rej(new Error(L("RPC 在 20 秒后超时", "RPC timed out after 20s"))), 20_000)),
        ]);
        if (!cancel) { setAnalytics(an); setAnalyticsError(null); }
      } catch (e) {
        if (!cancel) setAnalyticsError(e?.message || L("加载销毁分析失败", "Failed to load burn analytics"));
      }
    }
    const waitAndLoad = () => {
      if (window.CHAIN?._provider) {
        loadFeed();
        loadAnalytics();
        const id = setInterval(() => { loadFeed(); loadAnalytics(); }, 30_000);
        return () => clearInterval(id);
      } else {
        const t = setTimeout(waitAndLoad, 500);
        return () => clearTimeout(t);
      }
    };
    const cleanup = waitAndLoad();
    return () => { cancel = true; if (cleanup) cleanup(); };
  }, [retryNonce]);

  const retry = () => {
    setFeed(null); setFeedError(null);
    setAnalytics(null); setAnalyticsError(null);
    setRetryNonce((n) => n + 1);
  };
  const setCustomRpc = () => {
    const cur = (() => { try { return localStorage.getItem("football_rpc") || ""; } catch { return ""; } })();
    const url = window.prompt(
      L(
        "粘贴你的 BSC RPC 地址（Alchemy / Infura / QuickNode 等）。\n" +
        "公共 RPC 有时会限速或阻止本站点的 CORS。\n" +
        "留空则清除。",
        "Paste your BSC RPC URL (Alchemy / Infura / QuickNode, etc.).\n" +
        "Public RPCs sometimes rate-limit or block this site's CORS.\n" +
        "Leave empty to clear."
      ), cur
    );
    if (url === null) return;
    try {
      if (url.trim()) localStorage.setItem("football_rpc", url.trim());
      else localStorage.removeItem("football_rpc");
    } catch {}
    location.reload();
  };

  const pct = (burned / (window.TOTAL_SUPPLY || 1e9)) * 100;

  // Real per-curve leaderboard built from analytics.leaderboard, filtered to
  // country+player curves and matched to COUNTRIES for jersey/flag display.
  const topCurves = React.useMemo(() => {
    if (!analytics?.leaderboard) return [];
    return analytics.leaderboard
      .filter(x => x.kind === "country" && x.iso)
      .map(x => {
        const c = COUNTRIES.find(c => c.id === x.iso);
        return c ? { ...c, burned: x.amount } : null;
      })
      .filter(Boolean)
      .slice(0, 10);
  }, [analytics]);

  const maxBurn = topCurves[0]?.burned || 1;

  return (
    <main className="match-page burn-page">

      {/* HERO — Stadium scoreboard */}
      <section className="burn-hero-v2">
        <div className="burn-hero-grid-bg"/>
        <div className="burn-hero-shine"/>

        <div className="burn-hero-top">
          <div className="burn-hero-eyebrow">
            <span className="burn-live-dot"/>
            <span>{L("实时 · 销毁看板", "Live · Burn Dashboard")}</span>
          </div>
          <div className="burn-hero-block-id f-mono">
            {chain.blockNumber
              ? <>{L("区块", "Block")} #{chain.blockNumber.toLocaleString()} · BSC</>
              : <>{L("正在连接 BSC…", "Connecting to BSC…")}</>}
          </div>
        </div>

        <div className="burn-hero-headline-v2">
          <div className="burn-hero-pre">{L("永久销毁总量", "Total Permanently Burned")}</div>
          <div className="burn-hero-num-v2">
            <AnimatedNumber value={burned} duration={1800} decimals={burned > 0 && burned < 1000 ? 3 : 0}/>
            <span className="burn-hero-num-unit">FOOTBALL</span>
          </div>
        </div>

        <div className="burn-hero-track">
          <div className="burn-hero-track-fill" style={{width: `${pct}%`}}>
            <div className="burn-hero-track-pulse"/>
          </div>
        </div>

        <div className="burn-hero-foot-v2">
          <div className="burn-hero-stat">
            <span className="burn-hero-stat-label">{L("已销毁 · 占上限比例", "Burned · % of Cap")}</span>
            <span className="burn-hero-stat-v is-gold">{pct.toFixed(3)}%</span>
          </div>
          <div className="burn-hero-divider-v2"/>
          <div className="burn-hero-stat">
            <span className="burn-hero-stat-label">{L("流通量", "Circulating Supply")}</span>
            <span className="burn-hero-stat-v">{((window.TOTAL_SUPPLY || 1e9) - burned).toLocaleString(undefined,{maximumFractionDigits: burned < 1000 ? 3 : 0})}</span>
          </div>
          <div className="burn-hero-divider-v2"/>
          <div className="burn-hero-stat">
            <span className="burn-hero-stat-label">{L("供应上限", "Supply Cap")}</span>
            <span className="burn-hero-stat-v is-muted">{L("10 亿", "1B")}</span>
          </div>
        </div>
      </section>

      {/* RATES */}
      <section className="burn-rates">
        <div className="section-eyebrow">
          <span className="eyebrow">{L("销毁速度", "Burn Rate")}</span>
          <div className="hairline"/>
        </div>
        <div className="burn-rates-grid">
          <BurnRate label={L("销毁 · 近 24 小时", "Burned · Last 24h")}
                    value={analytics ? analytics.ratePer24h.toLocaleString(undefined,{maximumFractionDigits:2}) : "…"}
                    unit={L("FOOTBALL / 24小时", "FOOTBALL / 24h")}
                    delta={analytics ? L(`${analytics.leaderboard.length} 个销毁来源`, `${analytics.leaderboard.length} burn sources`) : L("读取链上中", "Reading on-chain")}
                    muted={!analytics}/>
          <BurnRate label={L("销毁 · 近 1 小时", "Burned · Last 1h")}
                    value={analytics ? analytics.ratePerHour.toLocaleString(undefined,{maximumFractionDigits:3}) : "…"}
                    unit={L("FOOTBALL / 1小时", "FOOTBALL / 1h")}
                    delta={analytics ? L(`${analytics.hours.toFixed(1)} 小时采样窗口`, `${analytics.hours.toFixed(1)}h sample window`) : L("读取链上中", "Reading on-chain")}
                    muted={!analytics}/>
          <BurnRate label={L("累计销毁", "Cumulative Burned")}
                    value={burned.toLocaleString()}
                    unit={L("FOOTBALL · 累计", "FOOTBALL · total")}
                    delta={L("自上线以来", "Since launch")}
                    muted/>
          <BurnRate label={L("已销毁占上限比例", "Burned % of Cap")}
                    value={pct.toFixed(3) + "%"}
                    unit={L("共 10 亿", "of 1B total")}
                    delta={L("不可变上限", "Immutable cap")}
                    muted/>
        </div>
      </section>

      {/* SUPPLY OVER TIME CHART (placeholder until indexer wired) */}
      <section className="burn-chart-wrap">
        <div className="section-eyebrow">
          <span className="eyebrow">{L("供应量随时间变化", "Supply Over Time")}</span>
          <div className="hairline"/>
        </div>
        <div className="burn-chart" style={{padding:"48px 24px", textAlign:"center", color:"var(--fg-3)"}}>
          <div className="f-mono" style={{fontSize:13, marginBottom:6}}>
            {L("历史供应量图表等待事件索引器接入。", "Historical supply chart pending event indexer integration.")}
          </div>
          <div className="f-mono" style={{fontSize:11, color:"var(--fg-4)"}}>
            {L("当前流通", "Circulating")} · {((window.TOTAL_SUPPLY || 1e9) - burned).toLocaleString()} FOOTBALL · {L("永久销毁", "Permanently Burned")} · {burned.toLocaleString()}
          </div>
        </div>
      </section>

      {/* LIVE FEED + LEADERBOARD */}
      <section className="burn-split">
        <div className="burn-split-l">
          <div className="section-eyebrow">
            <span className="eyebrow">{L("实时销毁动态", "Live Burn Feed")}</span>
            <div className="hairline"/>
            <span className="burn-live-pill"><span className="burn-live-pill-dot"/>{L("实时", "Live")}</span>
          </div>
          <div className="burn-feed">
            {feedError && (
              <RpcErrorBlock label={L("销毁动态", "burn feed")} error={feedError} onRetry={retry} onCustomRpc={setCustomRpc}/>
            )}
            {!feedError && feed === null && (
              <div className="f-mono" style={{padding:24, textAlign:"center", color:"var(--fg-3)", fontSize:12}}>
                {L("正在读取链上 FOOTBALL 销毁…", "Reading on-chain FOOTBALL burns…")}
              </div>
            )}
            {!feedError && feed && feed.length === 0 && (
              <div className="f-mono" style={{padding:24, textAlign:"center", color:"var(--fg-3)", fontSize:12}}>
                {L("近期窗口内暂无 FOOTBALL 销毁。", "No FOOTBALL burns in the recent window.")}
              </div>
            )}
            {feed && feed.map((e, i) => (
              <a key={e.txHash} href={`https://bscscan.com/tx/${e.txHash}`}
                 target="_blank" rel="noreferrer noopener"
                 className={"burn-event " + (i === 0 ? "is-new" : "")}
                 style={{textDecoration:"none", color:"inherit"}}>
                <div className="burn-event-mark">−</div>
                <div className="burn-event-meta">
                  <div className="burn-event-row1">
                    <span className="f-mono" style={{fontSize:12, color:"var(--fg-3)"}}>{window._goalAgo(e.timestamp)}</span>
                    <span className="f-mono" style={{fontSize:11, color:"var(--fg-4)"}}>{e.txHash.slice(0,10)}…</span>
                  </div>
                  <div className="burn-event-row2">
                    <span className="numeric burn-event-amt">{e.value.toLocaleString(undefined, {maximumFractionDigits: 4})} <span>FOOTBALL</span></span>
                    <span className="f-mono burn-event-src">
                      {L("来自", "from")} <span style={{color:"var(--accent)"}}>{window._goalShortAddr(e.from)}</span> → 0x0
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="burn-split-r">
          <div className="section-eyebrow">
            <span className="eyebrow">{L("销毁榜首曲线", "Top Burning Curves")}</span>
            <div className="hairline"/>
          </div>
          <div className="burn-leaderboard">
            {analyticsError && (
              <RpcErrorBlock label={L("销毁分析", "burn analytics")} error={analyticsError} onRetry={retry} onCustomRpc={setCustomRpc}/>
            )}
            {!analyticsError && analytics === null && (
              <div className="f-mono" style={{padding:24, textAlign:"center", color:"var(--fg-3)", fontSize:12}}>
                {L("正在从链上读取 24 小时销毁分析…", "Reading 24h burn analytics from chain…")}
              </div>
            )}
            {!analyticsError && analytics && topCurves.length === 0 && (
              <div className="f-mono" style={{padding:24, textAlign:"center", color:"var(--fg-3)", fontSize:12}}>
                {L(`近 ${analytics.hours.toFixed(1)} 小时内无国家曲线销毁。`, `No country curve burns in the last ${analytics.hours.toFixed(1)}h.`)}
              </div>
            )}
            {topCurves.map((c, i) => (
              <div key={c.id} className="burn-lb-row">
                <span className="f-mono burn-lb-rank">{String(i+1).padStart(2,"0")}</span>
                <Flag country={c} w={32} h={22}/>
                <div className="burn-lb-meta">
                  <div className="f-display" style={{fontSize:18, lineHeight:1, fontWeight:500}}>{c.name}</div>
                  <div className="burn-lb-bar">
                    <div className="burn-lb-bar-fill" style={{width: `${(c.burned/maxBurn)*100}%`}}/>
                  </div>
                </div>
                <div className="burn-lb-amt">
                  <div className="numeric burn-lb-amt-v">{c.burned.toLocaleString(undefined,{maximumFractionDigits:3})}</div>
                  <div className="f-mono" style={{fontSize:10, color:"var(--fg-3)"}}>{L("FOOTBALL · 24小时", "FOOTBALL · 24h")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer setRoute={setRoute}/>
    </main>
  );
};

const BurnRate = ({ label, value, unit, delta, up, muted }) => (
  <div className={"burn-rate " + (muted ? "is-muted" : "")}>
    <div className="burn-rate-head">
      <span className="burn-rate-label">{label}</span>
      {!muted && (
        <span className={"burn-rate-delta " + (up ? "is-up" : "is-down")}>
          {up ? "▲" : "▼"} {delta}
        </span>
      )}
    </div>
    <div className="burn-rate-value">{value}</div>
    <div className="burn-rate-unit">{muted ? delta : unit}</div>
  </div>
);

/* Shared error block — used by the burn feed + leaderboard when getLogs fails
   on all public RPCs. Surfaces error + Retry + Set custom RPC. */
const RpcErrorBlock = ({ label, error, onRetry, onCustomRpc }) => {
  const short = (error || "").length > 180 ? error.slice(0, 180) + "…" : error;
  return (
    <div className="f-mono" style={{padding:24, textAlign:"center", fontSize:12}}>
      <div style={{color:"var(--fire)", marginBottom:8}}>{L(`无法加载${label}`, `Failed to load ${label}`)}</div>
      <div style={{color:"var(--fg-3)", marginBottom:14, lineHeight:1.5}}>{short}</div>
      <div style={{display:"inline-flex", gap:8}}>
        <button onClick={onRetry}
                style={{background:"transparent", border:"1px solid var(--fg-3)", color:"var(--fg-2)",
                        padding:"6px 14px", borderRadius:4, cursor:"pointer", fontSize:11}}>
          {L("重试", "Retry")}
        </button>
        <button onClick={onCustomRpc}
                style={{background:"transparent", border:"1px solid var(--accent)", color:"var(--accent)",
                        padding:"6px 14px", borderRadius:4, cursor:"pointer", fontSize:11}}>
          {L("设置自定义 RPC", "Set Custom RPC")}
        </button>
      </div>
      <div style={{color:"var(--fg-4)", marginTop:10, fontSize:10, lineHeight:1.45}}>
        {L("公共 RPC 对 eth_getLogs 限速严重。", "Public RPCs heavily rate-limit eth_getLogs.")}<br/>
        {L("连接钱包后可通过其 provider 进行回退。", "Connect a wallet to fall back to its provider.")}
      </div>
    </div>
  );
};

/* Supply over time chart */
const SupplyOverTime = ({ burned }) => {
  const W = 1200, H = 280, PAD = 48;
  const days = 90;
  const seriesBurn = [];
  for (let i = 0; i < days; i++) {
    const t = i / (days - 1);
    seriesBurn.push(burned * Math.pow(t, 1.3));
  }
  const TOTAL = window.TOTAL_SUPPLY || 1e9;
  const seriesSupply = seriesBurn.map(b => TOTAL - b);
  const supplyMin = Math.min(...seriesSupply);
  const supplyMax = TOTAL;
  const xs = i => PAD + (i / (days-1)) * (W - 2*PAD);
  const ys = v => PAD + ((supplyMax - v) / (supplyMax - supplyMin * 0.99)) * (H - 2*PAD);

  const linePath = seriesSupply.map((v, i) => `${i===0?"M":"L"}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join(" ");
  const areaPath = linePath + ` L${xs(days-1)},${H-PAD} L${xs(0)},${H-PAD} Z`;

  return (
    <div className="burn-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{width:"100%", height:"auto", display:"block"}}>
        <defs>
          <linearGradient id="burnAreaGradV2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2EE164" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#2EE164" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="burnLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0E8C3A"/>
            <stop offset="100%" stopColor="#2EE164"/>
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map(t => (
          <g key={t}>
            <line x1={PAD} y1={PAD + t*(H-2*PAD)} x2={W-PAD} y2={PAD + t*(H-2*PAD)} stroke="var(--line)" strokeDasharray="2 4"/>
            <text x={PAD-8} y={PAD + t*(H-2*PAD)+3} textAnchor="end" fontSize="10" fill="var(--fg-3)" fontFamily="var(--f-mono)">
              {((supplyMax - (supplyMax - supplyMin*0.99) * t) / 1000).toFixed(1)}k
            </text>
          </g>
        ))}
        <line x1={PAD} y1={ys(supplyMax)} x2={W-PAD} y2={ys(supplyMax)} stroke="var(--fg-4)" strokeDasharray="3 3" opacity="0.6"/>
        <text x={W-PAD} y={ys(supplyMax)-6} textAnchor="end" fontSize="10" fill="var(--fg-3)" fontFamily="var(--f-mono)">{L("总量 · 10 亿", "Total · 1B")}</text>
        <path d={areaPath} fill="url(#burnAreaGradV2)"/>
        <path d={linePath} fill="none" stroke="url(#burnLineGrad)" strokeWidth="2"/>
        <circle cx={xs(days-1)} cy={ys(seriesSupply[days-1])} r="6" fill="#2EE164" stroke="var(--bg)" strokeWidth="2"/>
        <circle cx={xs(days-1)} cy={ys(seriesSupply[days-1])} r="11" fill="none" stroke="#2EE164" strokeWidth="1" opacity="0.4"/>
        <text x={xs(days-1)-10} y={ys(seriesSupply[days-1])+4} textAnchor="end" fontSize="11" fill="#2EE164" fontFamily="var(--f-mono)">
          {L(`${seriesSupply[days-1].toLocaleString()} 流通中`, `${seriesSupply[days-1].toLocaleString()} circulating`)}
        </text>
        <text x={PAD} y={H-12} fontSize="9" fill="var(--fg-3)" fontFamily="var(--f-mono)">{L("−90天", "−90d")}</text>
        <text x={W/2} y={H-12} fontSize="9" fill="var(--fg-3)" fontFamily="var(--f-mono)" textAnchor="middle">{L("−45天", "−45d")}</text>
        <text x={W-PAD} y={H-12} fontSize="9" fill="var(--fg-3)" fontFamily="var(--f-mono)" textAnchor="end">{L("今天", "Today")}</text>
      </svg>
    </div>
  );
};

window.Burn = Burn;
