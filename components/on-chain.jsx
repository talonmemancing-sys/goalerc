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

// 联合曲线图（抛物线）—— 价格随供应量上升,接近渐近线时陡升。鼠标悬停查看任意点。
const CurveKLine = ({ currentPrice = 0, currentSupply = 0, max, curveOpen, symbol = "" }) => {
  const [hover, setHover] = React.useState(null); // 鼠标处的 supply
  const svgRef = React.useRef(null);

  const W = 800, H = 340, PADL = 12, PADR = 66, PADT = 18, PADB = 28;
  const plotW = W - PADL - PADR, plotH = H - PADT - PADB;
  const A = max || 20000;

  // P = K/(A-S)^2,K 由当前点钉住 —— 平滑曲线,过当前点,接近渐近线陡升。
  const K = (curveOpen && currentSupply < A && currentPrice > 0)
    ? currentPrice * (A - currentSupply) ** 2 : 0;
  const priceAt = (s) => {
    const ss = Math.min(Math.max(s, 0), A * 0.995);
    return K ? K / ((A - ss) ** 2) : 0;
  };

  const SAMPLES = 96;
  const pts = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const s = (i / SAMPLES) * A * 0.99;
    pts.push([s, priceAt(s)]);
  }
  const maxP = Math.max(currentPrice * 1.3, priceAt(A * 0.99), 1);

  const xOf = (s) => PADL + (s / A) * plotW;
  const yOf = (p) => PADT + (1 - Math.min(p, maxP) / maxP) * plotH;

  const line = pts.map(([s, p], i) => `${i ? "L" : "M"}${xOf(s).toFixed(1)},${yOf(p).toFixed(1)}`).join(" ");
  const area = line + ` L${xOf(pts[pts.length - 1][0]).toFixed(1)},${H - PADB} L${PADL},${H - PADB} Z`;

  const onMove = (e) => {
    const svg = svgRef.current;
    if (!svg || !curveOpen || !K) return;
    const r = svg.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * W;
    let s = ((vx - PADL) / (plotW || 1)) * A;
    setHover(Math.min(Math.max(s, 0), A * 0.99));
  };

  const fmtP = (p) => p >= 1000
    ? p.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : p.toLocaleString(undefined, { maximumFractionDigits: 3 });
  const fmtS = (s) => Math.round(s).toLocaleString();

  const hp = hover != null ? priceAt(hover) : null;

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef} className="md-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
           onMouseMove={onMove} onMouseLeave={() => setHover(null)}
           style={{ cursor: curveOpen ? "crosshair" : "default" }}>
        <defs>
          <linearGradient id="curveAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.34"/>
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* 横向网格 + 右侧价格刻度 */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PADT + t * plotH;
          return (
            <g key={t}>
              <line x1={PADL} y1={y} x2={W - PADR} y2={y} stroke="var(--line)" strokeDasharray="2 4"/>
              <text x={W - PADR + 5} y={y + 3} fontSize="10" fill="var(--fg-3)" fontFamily="var(--f-mono)">
                {fmtP(maxP * (1 - t))}
              </text>
            </g>
          );
        })}

        {curveOpen && K > 0 ? (
          <>
            {/* 曲线 + 面积填充 */}
            <path d={area} fill="url(#curveAreaGrad)"/>
            <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2"/>

            {/* 渐近线 */}
            <line x1={xOf(A)} y1={PADT} x2={xOf(A)} y2={H - PADB} stroke="var(--fire)" strokeDasharray="3 3" opacity="0.55"/>
            <text x={xOf(A) - 5} y={PADT + 11} textAnchor="end" fontSize="9" fill="var(--fire)" fontFamily="var(--f-mono)">
              {L("渐近线", "Asymptote")}
            </text>

            {/* 当前点 */}
            <line x1={xOf(currentSupply)} y1={PADT} x2={xOf(currentSupply)} y2={H - PADB}
                  stroke="var(--fg)" strokeDasharray="2 3" opacity="0.3"/>
            <circle cx={xOf(currentSupply)} cy={yOf(currentPrice)} r="5" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2"/>
            <text x={xOf(currentSupply) + 9} y={yOf(currentPrice) + 3} fontSize="11" fill="var(--accent)" fontFamily="var(--f-mono)">
              {fmtP(currentPrice)}
            </text>

            {/* 悬停十字 + 浮窗 */}
            {hover != null && hp != null && (() => {
              const hx = xOf(hover), hy = yOf(hp);
              const tx = hx > W * 0.6 ? hx - 150 : hx + 10;
              return (
                <g>
                  <line x1={hx} y1={PADT} x2={hx} y2={H - PADB} stroke="var(--fg-2)" strokeDasharray="2 3" opacity="0.6"/>
                  <circle cx={hx} cy={hy} r="3.5" fill="var(--fg)" stroke="var(--bg)" strokeWidth="1.5"/>
                  <g transform={`translate(${tx}, ${PADT + 4})`} fontFamily="var(--f-mono)">
                    <rect width="140" height="46" rx="4" fill="var(--bg-1)" stroke="var(--line)"/>
                    <text x="9" y="19" fontSize="10" fill="var(--fg-2)">{L("供应量 ", "Supply ")}{fmtS(hover)}</text>
                    <text x="9" y="35" fontSize="10" fill="var(--accent)">{L("价格 ", "Price ")}{fmtP(hp)}</text>
                  </g>
                </g>
              );
            })()}
          </>
        ) : (
          <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="13" fill="var(--fg-3)" fontFamily="var(--f-mono)">
            {L("曲线交易尚未激活", "Curve trading not active yet")}
          </text>
        )}

        {/* X 轴 */}
        <text x={PADL} y={H - 9} fontSize="9" fill="var(--fg-3)" fontFamily="var(--f-mono)">{L("供应量 →", "Supply →")}</text>
        <text x={W - PADR} y={H - 9} textAnchor="end" fontSize="9" fill="var(--fg-3)" fontFamily="var(--f-mono)">
          {fmtS(currentSupply)} / {fmtS(A)}
        </text>
      </svg>
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
