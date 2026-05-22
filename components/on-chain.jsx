// FOOTBALL — shared on-chain UI helpers (real Transfer log feed + curve preview).

// Formats "ago" using either a timestamp or a current block number diff.
function _ago(timestamp) {
  if (!timestamp) return "";
  const diff = Math.max(0, Math.floor(Date.now() / 1000 - timestamp));
  if (diff < 60)   return L(`${diff}秒前`, `${diff}s ago`);
  if (diff < 3600) return L(`${Math.floor(diff/60)}分钟前`, `${Math.floor(diff/60)}m ago`);
  if (diff < 86400)return L(`${Math.floor(diff/3600)}小时前`, `${Math.floor(diff/3600)}h ago`);
  return L(`${Math.floor(diff/86400)}天前`, `${Math.floor(diff/86400)}d ago`);
}
function _shortAddr(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
window._goalAgo = _ago;
window._goalShortAddr = _shortAddr;

// Live ERC20 Transfer log feed for a given token.
// - When `mintsOnly` is true (default): treats logs as pack opens — groups by
//   tx, shows "bought N pack(s)" rows.
// - Else shows raw transfers as BUY (mint), SELL (burn-to-zero), or XFER.
const TransferLogFeed = ({ tokenAddr, symbol = L("代币", "Token"), mintsOnly = false, heading = L("近期动态", "Recent Activity"), limit = 8 }) => {
  const [events, setEvents] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [retryNonce, setRetryNonce] = React.useState(0);

  React.useEffect(() => {
    let cancel = false;
    let interval = null;
    let waitTimer = null;

    async function load() {
      if (!tokenAddr || !window.CHAIN || !window.CHAIN._provider) return;
      try {
        // Race the RPC against a 15s timeout. Public RPCs can silently hang
        // on eth_getLogs; without this we'd render "Reading…" forever.
        const fetchPromise = mintsOnly
          ? window.CHAIN.getRecentPackOpens(tokenAddr, limit)
          : window.CHAIN.getRecentTransfers(tokenAddr, limit);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(L("RPC 在 15 秒后超时", "RPC timed out after 15s"))), 15_000)
        );
        const evs = await Promise.race([fetchPromise, timeoutPromise]);
        if (!cancel) { setEvents(evs); setError(null); }
      } catch (e) {
        if (!cancel) setError(e?.message || L("读取日志失败", "Failed to read logs"));
      }
    }

    const waitAndLoad = () => {
      if (window.CHAIN && window.CHAIN._provider) {
        load();
        interval = setInterval(load, 20_000);
      } else {
        waitTimer = setTimeout(waitAndLoad, 500);
      }
    };
    waitAndLoad();

    return () => {
      cancel = true;
      if (interval) clearInterval(interval);
      if (waitTimer) clearTimeout(waitTimer);
    };
  }, [tokenAddr, mintsOnly, limit, retryNonce]);

  const retry = () => { setEvents(null); setError(null); setRetryNonce((n) => n + 1); };

  if (!tokenAddr) {
    return (
      <div className="recent">
        <div className="recent-empty f-mono" style={{padding:24, textAlign:"center", color:"var(--fg-3)", fontSize:12}}>
          {L("代币尚未部署。", "Token not deployed yet.")}
        </div>
      </div>
    );
  }
  if (error) {
    // Trim noisy ethers error envelopes — keep just the message body.
    const short = error.length > 140 ? error.slice(0, 140) + "…" : error;
    return (
      <div className="recent">
        <div className="recent-empty f-mono" style={{padding:24, textAlign:"center", color:"var(--fire)", fontSize:12}}>
          <div style={{marginBottom:10}}>{L("RPC 错误", "RPC Error")}</div>
          <div style={{color:"var(--fg-3)", marginBottom:12, lineHeight:1.45}}>{short}</div>
          <button onClick={retry}
                  style={{background:"transparent", border:"1px solid var(--fire)", color:"var(--fire)",
                          padding:"6px 14px", borderRadius:4, cursor:"pointer", fontSize:11}}>
            {L("重试", "Retry")}
          </button>
        </div>
      </div>
    );
  }
  if (events === null) {
    return (
      <div className="recent">
        <div className="recent-empty f-mono" style={{padding:24, textAlign:"center", color:"var(--fg-3)", fontSize:12}}>
          {mintsOnly
            ? L("正在读取链上开包记录…", "Reading on-chain pack opens…")
            : L("正在读取链上转账记录…", "Reading on-chain transfers…")}
        </div>
      </div>
    );
  }
  if (events.length === 0) {
    return (
      <div className="recent">
        <div className="recent-empty f-mono" style={{padding:24, textAlign:"center", color:"var(--fg-3)", fontSize:12}}>
          {mintsOnly
            ? L("暂无链上开包记录 — 抢个头彩。", "No on-chain pack opens yet — be the first.")
            : L("暂无链上动态 — 抢个头彩。", "No on-chain activity yet — be the first.")}
        </div>
      </div>
    );
  }

  if (mintsOnly) {
    return (
      <div className="recent">
        {events.map((e) => (
          <a key={e.txHash}
             className="recent-row"
             href={`https://bscscan.com/tx/${e.txHash}`}
             target="_blank" rel="noreferrer noopener"
             style={{textDecoration:"none", color:"inherit"}}>
            <div className="recent-row-l">
              <div className="recent-dot"/>
              <div>
                <div className="f-mono" style={{fontSize:13, color:"var(--fg)"}}>{_shortAddr(e.buyer)}</div>
                <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>
                  {L(`购买了 ${e.count} 包`, `bought ${e.count} pack${e.count === 1 ? "" : "s"}`)}
                </div>
              </div>
            </div>
            <div className="recent-row-r">
              <div className="f-mono" style={{fontSize:13, color:"var(--fg)"}}>−{(e.count * (window.PACK_PRICE || 3850)).toLocaleString()} FOOTBALL</div>
              <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>{_ago(e.timestamp)}</div>
            </div>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="md-events-list">
      {events.map((e) => {
        const tag = e.isMint ? L("买入", "BUY") : e.isBurn ? L("销毁", "BURN") : L("转账", "XFER");
        const color = e.isMint ? "var(--bull)" : e.isBurn ? "var(--fire)" : "var(--fg-2)";
        const amt = Number(ethers.formatEther(e.value));
        return (
          <a key={e.txHash + e.block}
             className="md-event"
             href={`https://bscscan.com/tx/${e.txHash}`}
             target="_blank" rel="noreferrer noopener"
             style={{textDecoration:"none", color:"inherit"}}>
            <span className="md-event-tag" style={{color}}>{tag}</span>
            <span className="f-mono" style={{fontSize:13}}>
              <span style={{color:"var(--fg)"}}>{amt.toLocaleString(undefined, {maximumFractionDigits: 4})}</span>
              <span style={{color:"var(--fg-3)"}}> {symbol}</span>
            </span>
            <span className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>{_shortAddr(e.isMint ? e.to : e.from)}</span>
            <span className="f-mono" style={{fontSize:11, color:"var(--fg-3)", marginLeft:"auto"}}>{_ago(e.timestamp)}</span>
          </a>
        );
      })}
    </div>
  );
};
window.TransferLogFeed = TransferLogFeed;

// Simple theoretical-curve preview (no fake historical line).
const CurvePreview = ({ price, supply, max, curveOpen }) => {
  const W = 800, H = 360, PAD = 40;
  const A = max || 20000;
  // P = K / (A - S)^2 with current point pinned
  const K = curveOpen ? price * (A - supply) ** 2 : 0;
  const pts = [];
  for (let s = 0; s <= A * 0.98; s += A * 0.02) {
    const p = curveOpen ? K / ((A - s) ** 2) : 0;
    pts.push([s, p]);
  }
  const maxP = Math.max(...pts.map(p => p[1]), price * 1.1, 1);
  const xs = s => PAD + (s / A) * (W - 2*PAD);
  const ys = p => H - PAD - (Math.min(p, maxP) / maxP) * (H - 2*PAD);
  const curvePath = pts.map(([s, p], i) => `${i===0?"M":"L"}${xs(s).toFixed(1)},${ys(p).toFixed(1)}`).join(" ");
  const cx = xs(supply);
  const cy = ys(price);

  return (
    <svg className="md-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="curvePrevGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(t => (
        <g key={t}>
          <line x1={PAD} y1={PAD + t*(H-2*PAD)} x2={W-PAD} y2={PAD + t*(H-2*PAD)} stroke="var(--line)" strokeDasharray="2 4"/>
          <text x={W-PAD+4} y={PAD + t*(H-2*PAD) + 3} fontSize="10" fill="var(--fg-3)" fontFamily="var(--f-mono)">{(maxP*(1-t)).toFixed(2)}</text>
        </g>
      ))}
      {curveOpen && <path d={curvePath} fill="none" stroke="var(--accent)" strokeWidth="1.5"/>}
      {/* asymptote */}
      <line x1={xs(A)} y1={PAD} x2={xs(A)} y2={H-PAD} stroke="var(--fire)" strokeDasharray="3 3" opacity="0.6"/>
      <text x={xs(A) - 4} y={PAD+10} textAnchor="end" fontSize="9" fill="var(--fire)" fontFamily="var(--f-mono)">{L("渐近线", "Asymptote")}</text>
      {/* current pt */}
      {curveOpen && (
        <>
          <line x1={cx} y1={PAD} x2={cx} y2={H-PAD} stroke="var(--fg)" strokeDasharray="2 3" opacity="0.4"/>
          <circle cx={cx} cy={cy} r="5" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2"/>
          <text x={cx + 8} y={cy + 3} fontSize="11" fill="var(--accent)" fontFamily="var(--f-mono)">{price.toFixed(3)} G</text>
        </>
      )}
      {!curveOpen && (
        <text x={W/2} y={H/2} textAnchor="middle" fontSize="14" fill="var(--fg-3)" fontFamily="var(--f-mono)">
          {L("曲线交易尚未激活 — 开包窗口仍开放中", "Curve trading not active yet — pack window still open")}
        </text>
      )}
      <text x={PAD} y={H-12} fontSize="9" fill="var(--fg-3)" fontFamily="var(--f-mono)" letterSpacing="0.06em">{L("供应量 →", "Supply →")}</text>
      <text x={W/2} y={H-12} fontSize="9" fill="var(--fg-3)" fontFamily="var(--f-mono)" textAnchor="middle">[{supply.toLocaleString()} / {A.toLocaleString()}]</text>
    </svg>
  );
};
window.CurvePreview = CurvePreview;

// K 线（蜡烛图）—— 把曲线的 Bought/Sold 成交按所选周期分桶成 OHLC 蜡烛。
// 支持周期切换（1M/15M/1H/4H/24H）+ 悬停看 OHLC。
const KLINE_TF = { "1M": 60, "15M": 900, "1H": 3600, "4H": 14400, "24H": 86400 };

const CurveKLine = ({ curveAddr, currentPrice = 0, curveOpen, symbol = "", timeframe = "15M" }) => {
  const [events, setEvents] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [hover, setHover] = React.useState(null);
  const svgRef = React.useRef(null);

  React.useEffect(() => {
    let cancel = false;
    async function load() {
      if (!curveAddr || !window.CHAIN?._provider) return;
      try {
        const tr = await window.CHAIN.getCurveTradeHistory(curveAddr, 50_000, 500);
        if (!cancel) { setEvents(tr || []); setError(null); }
      } catch (e) {
        if (!cancel) setError(e?.message || L("加载交易历史失败", "Failed to load trade history"));
      }
    }
    const waitAndLoad = () => {
      if (window.CHAIN?._provider) {
        load();
        const id = setInterval(load, 30_000);
        return () => clearInterval(id);
      }
      const t = setTimeout(waitAndLoad, 500);
      return () => clearTimeout(t);
    };
    const cleanup = waitAndLoad();
    return () => { cancel = true; if (cleanup) cleanup(); };
  }, [curveAddr]);

  const W = 800, H = 340, PADL = 10, PADR = 66, PADT = 16, PADB = 26;
  const plotW = W - PADL - PADR, plotH = H - PADT - PADB;
  const candleSec = KLINE_TF[timeframe] || 900;
  const N = 48;

  // 成交事件 → 按周期分桶成 OHLC 蜡烛；空桶用上一根收盘价补齐。
  const { candles, lo, hi } = React.useMemo(() => {
    const evs = (events || []).filter((e) => e && e.price > 0 && e.timestamp);
    const now = Math.floor(Date.now() / 1000);
    const endBi = Math.floor(now / candleSec);
    const startBi = endBi - N + 1;
    const buckets = new Map();
    let preClose = null;
    for (const e of evs) {
      const bi = Math.floor(e.timestamp / candleSec);
      if (bi < startBi) { preClose = e.price; continue; }
      const b = buckets.get(bi);
      if (!b) buckets.set(bi, { o: e.price, h: e.price, l: e.price, c: e.price });
      else { if (e.price > b.h) b.h = e.price; if (e.price < b.l) b.l = e.price; b.c = e.price; }
    }
    const arr = [];
    let last = preClose;
    for (let bi = startBi; bi <= endBi; bi++) {
      const b = buckets.get(bi);
      if (b) { arr.push({ bi, o: b.o, h: b.h, l: b.l, c: b.c, real: true }); last = b.c; }
      else { const p = last != null ? last : (currentPrice || 0); arr.push({ bi, o: p, h: p, l: p, c: p, real: false }); }
    }
    let mn = Infinity, mx = -Infinity;
    for (const c of arr) { if (c.l < mn) mn = c.l; if (c.h > mx) mx = c.h; }
    if (currentPrice > 0) { mn = Math.min(mn, currentPrice); mx = Math.max(mx, currentPrice); }
    if (!isFinite(mn) || !isFinite(mx) || mn >= mx) {
      const base = currentPrice || mx || 1;
      mn = base * 0.9; mx = base * 1.1;
    }
    const pad = (mx - mn) * 0.12 || 1;
    return { candles: arr, lo: Math.max(0, mn - pad), hi: mx + pad };
  }, [events, candleSec, currentPrice]);

  const xOf = (i) => PADL + (candles.length > 1 ? (i / (candles.length - 1)) * plotW : plotW / 2);
  const yOf = (p) => PADT + (1 - (p - lo) / (hi - lo || 1)) * plotH;
  const cw = candles.length ? Math.max(2, (plotW / candles.length) * 0.6) : 8;
  const tradeCount = (events || []).filter((e) => e && e.price > 0).length;

  const fmtP = (p) => p >= 1000
    ? p.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : p.toLocaleString(undefined, { maximumFractionDigits: 3 });
  const fmtTime = (bi) => {
    const d = new Date(bi * candleSec * 1000);
    const z = (n) => String(n).padStart(2, "0");
    if (candleSec < 3600) return `${z(d.getHours())}:${z(d.getMinutes())}`;
    if (candleSec < 86400) return `${d.getMonth() + 1}/${d.getDate()} ${z(d.getHours())}:00`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const onMove = (e) => {
    const svg = svgRef.current;
    if (!svg || !candles.length) return;
    const r = svg.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * W;
    const idx = Math.round(((vx - PADL) / (plotW || 1)) * (candles.length - 1));
    setHover(Math.max(0, Math.min(candles.length - 1, idx)));
  };

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef} className="md-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
           onMouseMove={onMove} onMouseLeave={() => setHover(null)} style={{ cursor: "crosshair" }}>
        {/* 横向网格 + 右侧价格刻度 */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PADT + t * plotH;
          return (
            <g key={t}>
              <line x1={PADL} y1={y} x2={W - PADR} y2={y} stroke="var(--line)" strokeDasharray="2 4"/>
              <text x={W - PADR + 5} y={y + 3} fontSize="10" fill="var(--fg-3)" fontFamily="var(--f-mono)">
                {fmtP(hi - t * (hi - lo))}
              </text>
            </g>
          );
        })}

        {!curveOpen ? (
          <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="13" fill="var(--fg-3)" fontFamily="var(--f-mono)">
            {L("曲线交易尚未激活", "Curve trading not active yet")}
          </text>
        ) : (
          <>
            {/* 蜡烛 */}
            {candles.map((c, i) => {
              const x = xOf(i);
              const up = c.c >= c.o;
              const col = up ? "var(--bull)" : "var(--bear)";
              const yH = yOf(c.h), yL = yOf(c.l), yO = yOf(c.o), yC = yOf(c.c);
              const bt = Math.min(yO, yC), bh = Math.max(1.2, Math.abs(yO - yC));
              return (
                <g key={i} opacity={c.real ? 1 : 0.25}>
                  <line x1={x} y1={yH} x2={x} y2={yL} stroke={col} strokeWidth="1.1"/>
                  <rect x={x - cw / 2} y={bt} width={cw} height={bh} fill={col}/>
                </g>
              );
            })}

            {/* 现价线 */}
            {currentPrice > 0 && (
              <g>
                <line x1={PADL} y1={yOf(currentPrice)} x2={W - PADR} y2={yOf(currentPrice)}
                      stroke="var(--accent)" strokeDasharray="3 3" opacity="0.7"/>
                <rect x={W - PADR} y={yOf(currentPrice) - 8} width={PADR} height="16" fill="var(--accent)"/>
                <text x={W - PADR + 5} y={yOf(currentPrice) + 3} fontSize="10" fill="var(--bg)" fontFamily="var(--f-mono)">
                  {fmtP(currentPrice)}
                </text>
              </g>
            )}

            {/* 悬停十字线 + OHLC 浮窗 */}
            {hover != null && candles[hover] && (() => {
              const c = candles[hover];
              const x = xOf(hover);
              const tx = x > W * 0.6 ? x - 158 : x + 10;
              return (
                <g>
                  <line x1={x} y1={PADT} x2={x} y2={H - PADB} stroke="var(--fg-2)" strokeDasharray="2 3" opacity="0.55"/>
                  <g transform={`translate(${tx}, ${PADT + 4})`} fontFamily="var(--f-mono)">
                    <rect width="148" height="92" rx="4" fill="var(--bg-1)" stroke="var(--line)"/>
                    <text x="9" y="18" fontSize="9.5" fill="var(--fg-3)">{fmtTime(c.bi)}</text>
                    <text x="9" y="37" fontSize="10" fill="var(--fg-2)">{L("开 ", "O ")}{fmtP(c.o)}</text>
                    <text x="9" y="53" fontSize="10" fill="var(--bull)">{L("高 ", "H ")}{fmtP(c.h)}</text>
                    <text x="9" y="69" fontSize="10" fill="var(--bear)">{L("低 ", "L ")}{fmtP(c.l)}</text>
                    <text x="9" y="85" fontSize="10" fill="var(--fg)">{L("收 ", "C ")}{fmtP(c.c)}</text>
                  </g>
                </g>
              );
            })()}
          </>
        )}

        {/* 底部时间轴 */}
        {curveOpen && candles.length > 1 && [0, 0.34, 0.67, 1].map((t) => {
          const i = Math.round(t * (candles.length - 1));
          return (
            <text key={t} x={xOf(i)} y={H - 8}
                  textAnchor={t === 0 ? "start" : t === 1 ? "end" : "middle"}
                  fontSize="9" fill="var(--fg-3)" fontFamily="var(--f-mono)">
              {fmtTime(candles[i].bi)}
            </text>
          );
        })}
      </svg>

      {/* 状态栏 */}
      <div className="f-mono" style={{ fontSize: 10, color: "var(--fg-4)", padding: "6px 12px", display: "flex", justifyContent: "space-between" }}>
        <span>
          {events === null ? L("加载 K 线中…", "Loading chart…")
            : error ? L("数据加载失败", "Failed to load data")
            : tradeCount === 0 ? L("暂无成交 —— 曲线刚开启", "No trades yet — curve just opened")
            : L(`${tradeCount} 笔成交`, `${tradeCount} trades`)}
        </span>
        <span>{symbol ? symbol + " · " : ""}{timeframe}</span>
      </div>
    </div>
  );
};
window.CurveKLine = CurveKLine;

// Live balance of an arbitrary ERC20 for the connected wallet.
const TokenBalance = ({ tokenAddr, decimals = 18, decimalsShown = 4 }) => {
  const [bal, setBal] = React.useState(null);
  const [walletTick, setWalletTick] = React.useState(0);
  React.useEffect(() => window.WALLET ? window.WALLET.subscribe(() => setWalletTick(t => t + 1)) : undefined, []);

  React.useEffect(() => {
    let cancel = false;
    async function load() {
      const ws = window.WALLET?.state;
      if (!ws?.connected || !tokenAddr || !window.CHAIN?._provider) { setBal(null); return; }
      try {
        const erc20 = new ethers.Contract(tokenAddr, ["function balanceOf(address) view returns (uint256)"], window.CHAIN._provider);
        const b = await erc20.balanceOf(ws.address);
        if (!cancel) setBal(Number(ethers.formatUnits(b, decimals)));
      } catch { if (!cancel) setBal(null); }
    }
    load();
    const id = setInterval(load, 20_000);
    return () => { cancel = true; clearInterval(id); };
  }, [tokenAddr, walletTick]);

  if (!window.WALLET?.state?.connected) return <span>—</span>;
  if (bal === null) return <span>…</span>;
  return <span>{bal.toLocaleString(undefined, { maximumFractionDigits: decimalsShown })}</span>;
};
window.TokenBalance = TokenBalance;

const CountryBalance = ({ iso }) => {
  const addr = window.CHAIN?.state?.countryAddrs?.[iso]?.tokenAddr;
  return <TokenBalance tokenAddr={addr}/>;
};
window.CountryBalance = CountryBalance;
