// GOAL — shared on-chain UI helpers (real Transfer log feed + curve preview).

// Formats "ago" using either a timestamp or a current block number diff.
function _ago(timestamp) {
  if (!timestamp) return "";
  const diff = Math.max(0, Math.floor(Date.now() / 1000 - timestamp));
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
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
const TransferLogFeed = ({ tokenAddr, symbol = "tokens", mintsOnly = false, heading = "Recent activity", limit = 8 }) => {
  const [events, setEvents] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let cancel = false;
    let interval = null;

    async function load() {
      if (!tokenAddr || !window.CHAIN || !window.CHAIN._provider) return;
      try {
        const events = mintsOnly
          ? await window.CHAIN.getRecentPackOpens(tokenAddr, limit)
          : await window.CHAIN.getRecentTransfers(tokenAddr, limit);
        if (!cancel) { setEvents(events); setError(null); }
      } catch (e) {
        if (!cancel) setError(e?.message || "Failed to read logs");
      }
    }

    // Initial load: wait for provider to be ready.
    const waitAndLoad = () => {
      if (window.CHAIN && window.CHAIN._provider) {
        load();
        interval = setInterval(load, 20_000);
      } else {
        setTimeout(waitAndLoad, 500);
      }
    };
    waitAndLoad();

    return () => { cancel = true; if (interval) clearInterval(interval); };
  }, [tokenAddr, mintsOnly, limit]);

  if (!tokenAddr) {
    return (
      <div className="recent">
        <div className="recent-empty f-mono" style={{padding:24, textAlign:"center", color:"var(--fg-3)", fontSize:12}}>
          Token not yet deployed.
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="recent">
        <div className="recent-empty f-mono" style={{padding:24, textAlign:"center", color:"var(--fire)", fontSize:12}}>
          RPC error: {error}
        </div>
      </div>
    );
  }
  if (events === null) {
    return (
      <div className="recent">
        <div className="recent-empty f-mono" style={{padding:24, textAlign:"center", color:"var(--fg-3)", fontSize:12}}>
          Reading on-chain {mintsOnly ? "pack opens" : "transfers"}…
        </div>
      </div>
    );
  }
  if (events.length === 0) {
    return (
      <div className="recent">
        <div className="recent-empty f-mono" style={{padding:24, textAlign:"center", color:"var(--fg-3)", fontSize:12}}>
          No on-chain {mintsOnly ? "pack opens" : "activity"} yet — be the first.
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
             href={`https://etherscan.io/tx/${e.txHash}`}
             target="_blank" rel="noreferrer noopener"
             style={{textDecoration:"none", color:"inherit"}}>
            <div className="recent-row-l">
              <div className="recent-dot"/>
              <div>
                <div className="f-mono" style={{fontSize:13, color:"var(--fg)"}}>{_shortAddr(e.buyer)}</div>
                <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>
                  bought {e.count} pack{e.count > 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <div className="recent-row-r">
              <div className="f-mono" style={{fontSize:13, color:"var(--fg)"}}>−{(e.count * 6.9).toFixed(1)} G</div>
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
        const tag = e.isMint ? "BUY" : e.isBurn ? "BURN" : "XFER";
        const color = e.isMint ? "var(--bull)" : e.isBurn ? "var(--fire)" : "var(--fg-2)";
        const amt = Number(ethers.formatEther(e.value));
        return (
          <a key={e.txHash + e.block}
             className="md-event"
             href={`https://etherscan.io/tx/${e.txHash}`}
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
      <text x={xs(A) - 4} y={PAD+10} textAnchor="end" fontSize="9" fill="var(--fire)" fontFamily="var(--f-mono)">ASYMPTOTE</text>
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
          Curve trading not yet active — pack window still open
        </text>
      )}
      <text x={PAD} y={H-12} fontSize="9" fill="var(--fg-3)" fontFamily="var(--f-mono)" letterSpacing="0.06em">SUPPLY →</text>
      <text x={W/2} y={H-12} fontSize="9" fill="var(--fg-3)" fontFamily="var(--f-mono)" textAnchor="middle">[{supply.toLocaleString()} / {A.toLocaleString()}]</text>
    </svg>
  );
};
window.CurvePreview = CurvePreview;

// Real K-line from a curve's Bought/Sold events. Overlays the theoretical
// bonding-curve geometry behind the live trade points.
const CurveKLine = ({ curveAddr, currentPrice, currentSupply, max, curveOpen, symbol = "" }) => {
  const [events, setEvents] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let cancel = false;
    async function load() {
      if (!curveAddr || !window.CHAIN?._provider) return;
      try {
        const tr = await window.CHAIN.getCurveTradeHistory(curveAddr, 50_000, 500);
        if (!cancel) { setEvents(tr); setError(null); }
      } catch (e) {
        if (!cancel) setError(e?.message || "Failed to load trade history");
      }
    }
    const waitAndLoad = () => {
      if (window.CHAIN?._provider) {
        load();
        const id = setInterval(load, 30_000);
        return () => clearInterval(id);
      } else {
        const t = setTimeout(waitAndLoad, 500);
        return () => clearTimeout(t);
      }
    };
    const cleanup = waitAndLoad();
    return () => { cancel = true; if (cleanup) cleanup(); };
  }, [curveAddr]);

  const W = 800, H = 360, PAD = 40;
  const A = max || 20000;

  // Build the theoretical curve (P = K / (A - S)^2 pinned on current).
  const K = curveOpen && currentSupply < A ? currentPrice * (A - currentSupply) ** 2 : 0;
  const theoPts = [];
  for (let s = 0; s <= A * 0.98; s += A * 0.02) {
    const p = K ? K / ((A - s) ** 2) : 0;
    theoPts.push([s, p]);
  }

  // Compute y-range from theoretical curve PLUS event prices.
  const eventPrices = (events || []).map((e) => e.price).filter((p) => p > 0);
  const maxP = Math.max(
    currentPrice * 1.2,
    ...theoPts.map((p) => p[1]),
    ...eventPrices,
    1
  );

  const xsCurve = (s) => PAD + (s / A) * (W - 2 * PAD);
  const ysCurve = (p) => H - PAD - (Math.min(p, maxP) / maxP) * (H - 2 * PAD);
  const theoPath = theoPts
    .map(([s, p], i) => `${i === 0 ? "M" : "L"}${xsCurve(s).toFixed(1)},${ysCurve(p).toFixed(1)}`)
    .join(" ");

  // Time-axis points: each event placed at x = supply-at-trade isn't directly
  // recoverable without state replay, so we use timestamp as x for the K-line
  // overlay AND keep the supply-vs-price theoretical curve as a backdrop.
  const tNow = Math.floor(Date.now() / 1000);
  let tMin = tNow - 24 * 3600;
  let tMax = tNow;
  if (events && events.length) {
    tMin = Math.min(tMin, events[0].timestamp || tMin);
    tMax = Math.max(tMax, events[events.length - 1].timestamp || tMax);
  }
  const xsTime = (t) =>
    tMax > tMin ? PAD + ((t - tMin) / (tMax - tMin)) * (W - 2 * PAD) : PAD;

  const tradePoints = (events || [])
    .filter((e) => e.timestamp && e.price > 0)
    .map((e) => ({ x: xsTime(e.timestamp), y: ysCurve(e.price), kind: e.kind, price: e.price, e }));

  // Connect trade points as a line
  const tradePath = tradePoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  // Current price marker
  const cx = xsTime(tNow);
  const cy = ysCurve(currentPrice);

  return (
    <div>
      <svg className="md-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="klineArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.32"/>
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[0.2, 0.4, 0.6, 0.8].map((t) => (
          <g key={t}>
            <line x1={PAD} y1={PAD + t * (H - 2 * PAD)} x2={W - PAD} y2={PAD + t * (H - 2 * PAD)}
                  stroke="var(--line)" strokeDasharray="2 4"/>
            <text x={W - PAD + 4} y={PAD + t * (H - 2 * PAD) + 3}
                  fontSize="10" fill="var(--fg-3)" fontFamily="var(--f-mono)">
              {(maxP * (1 - t)).toFixed(3)}
            </text>
          </g>
        ))}

        {/* Theoretical bonding curve, dimmed */}
        {curveOpen && (
          <path d={theoPath} fill="none" stroke="var(--fg-3)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4"/>
        )}

        {/* Asymptote marker */}
        <line x1={xsCurve(A)} y1={PAD} x2={xsCurve(A)} y2={H - PAD}
              stroke="var(--fire)" strokeDasharray="3 3" opacity="0.4"/>
        <text x={xsCurve(A) - 4} y={PAD + 10} textAnchor="end"
              fontSize="9" fill="var(--fire)" fontFamily="var(--f-mono)">ASYMPTOTE</text>

        {/* Real trade points + connecting line (time-ordered) */}
        {curveOpen && tradePath && (
          <path d={tradePath} fill="none" stroke="var(--accent)" strokeWidth="1.5"/>
        )}
        {tradePoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3"
                  fill={p.kind === "buy" ? "var(--bull)" : "var(--bear)"}
                  opacity="0.85"/>
        ))}

        {/* Current price */}
        {curveOpen && (
          <>
            <circle cx={cx} cy={cy} r="5" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2"/>
            <text x={cx + 8} y={cy + 3} fontSize="11" fill="var(--accent)" fontFamily="var(--f-mono)">
              {currentPrice.toFixed(3)} G
            </text>
          </>
        )}

        {!curveOpen && (
          <text x={W / 2} y={H / 2} textAnchor="middle"
                fontSize="14" fill="var(--fg-3)" fontFamily="var(--f-mono)">
            Curve trading not yet active — pack window still open
          </text>
        )}

        {/* X-axis labels (time) */}
        {curveOpen && tMax > tMin && (
          <>
            <text x={PAD} y={H - 12} fontSize="9" fill="var(--fg-3)" fontFamily="var(--f-mono)">
              {new Date(tMin * 1000).toLocaleDateString()}
            </text>
            <text x={W - PAD} y={H - 12} textAnchor="end"
                  fontSize="9" fill="var(--fg-3)" fontFamily="var(--f-mono)">
              now
            </text>
          </>
        )}
      </svg>

      {/* Status */}
      <div className="f-mono" style={{fontSize: 10, color: "var(--fg-4)", padding: "8px 12px", display: "flex", justifyContent: "space-between"}}>
        <span>
          {events === null ? "Loading trade history…" :
           error ? `Error: ${error}` :
           events.length === 0 ? "No trades yet — curve just opened or no activity" :
           `${events.length} trades · ${tradePoints.filter(p => p.kind === "buy").length} buys · ${tradePoints.filter(p => p.kind === "sell").length} sells`}
        </span>
        <span>50k-block lookback (~7d)</span>
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
