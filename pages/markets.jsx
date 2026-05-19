// GOAL — Markets list + Market detail
const Markets = ({ setRoute, burned }) => {
  const [filter, setFilter] = React.useState("LIVE");
  const [type, setType] = React.useState("country");
  const [sort, setSort] = React.useState("price");

  let list = COUNTRIES.map(c => ({...c, state: countryState(c)}));
  if (filter === "LIVE") list = list.filter(c => c.state.curveOpen);
  if (filter === "SEALED") list = list.filter(c => c.state.sealed && !c.state.curveOpen);
  if (filter === "PENDING") list = list.filter(c => !c.state.sealed);
  if (sort === "price")  list.sort((a,b) => b.state.price - a.state.price);
  if (sort === "supply") list.sort((a,b) => b.state.supply - a.state.supply);
  if (sort === "burn")   list.sort((a,b) => b.state.burnedFromCurve - a.state.burnedFromCurve);

  const liveCount = COUNTRIES.filter(c => countryState(c).curveOpen).length;
  const burnFromCurves = COUNTRIES.reduce((s, c) => s + countryState(c).burnedFromCurve, 0);

  return (
    <main className="match-page markets">
      <section className="markets-hero">
        <div>
          <div className="eyebrow">Phase II · Curve Trading</div>
          <h1 className="f-display" style={{fontSize:"clamp(44px,6vw,92px)", lineHeight:0.98, letterSpacing:"-0.045em", margin:"12px 0 24px", fontWeight:600}}>
            <span className="numeric">{liveCount}</span> live curves
            <br/>
            <span style={{color:"var(--accent)", fontWeight:300}}>of 192 total.</span>
          </h1>
          <p style={{maxWidth:600, color:"var(--fg-2)", fontSize:17, lineHeight:1.55}}>
            Each curve is a quadratic bonding curve priced in GOAL. Liquidity provided by the
            pack-window proceeds. Every swap routes through the V4 hook and burns 5%.
          </p>
        </div>
        <div className="markets-hero-stats">
          <MarketStat label="Total burned (curves)" value={"—"} suffix="" big/>
          <MarketStat label="Combined supply"  value={COUNTRIES.filter(c=>countryState(c).curveOpen).reduce((s,c)=>s+countryState(c).supply, 0)}/>
          <MarketStat label="24h volume" value={"—"}/>
          <MarketStat label="Avg. price"  value={liveCount > 0 ? Number((COUNTRIES.filter(c=>countryState(c).curveOpen).reduce((s,c)=>s+countryState(c).price,0) / liveCount).toFixed(2)) : "—"} suffix={liveCount > 0 ? " G" : ""}/>
        </div>
      </section>

      <section className="markets-filters">
        <div className="markets-tabs">
          <button className={"markets-tab " + (type==="country" ? "is-active" : "")} onClick={()=>setType("country")}>
            Country curves<span className="markets-tab-count">{liveCount}</span>
          </button>
          <button className={"markets-tab " + (type==="player" ? "is-active" : "")} onClick={()=>setType("player")}>
            Player curves<span className="markets-tab-count">{liveCount * 3}</span>
          </button>
        </div>
        <div className="markets-filter-r">
          <div className="markets-chips">
            {["LIVE", "SEALED", "PENDING"].map(f => (
              <button key={f} className={"filter-chip " + (filter===f ? "is-active" : "")} onClick={()=>setFilter(f)}>{f}</button>
            ))}
          </div>
          <div className="markets-sort">
            <span className="eyebrow">Sort</span>
            {["price", "supply", "burn"].map(s => (
              <button key={s} className={"markets-sort-btn " + (sort===s ? "is-active" : "")} onClick={()=>setSort(s)}>{s}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="markets-table">
        <div className="markets-table-head f-mono">
          <span style={{flex:"0 0 50px"}}>#</span>
          <span style={{flex:"1 0 220px"}}>Curve</span>
          <span style={{flex:"0 0 120px"}}>Price</span>
          <span style={{flex:"0 0 100px"}}>24h</span>
          <span style={{flex:"0 0 200px"}}>Sparkline</span>
          <span style={{flex:"0 0 180px"}}>Supply / Asymptote</span>
          <span style={{flex:"0 0 120px"}}>Burned</span>
          <span style={{flex:"0 0 100px", textAlign:"right"}}></span>
        </div>
        {list.map((c, i) => (
          <CurveRow key={c.id} c={c} i={i+1} onClick={()=>setRoute({name:"market", country:c.id})}/>
        ))}
      </section>

      <Footer setRoute={setRoute}/>
    </main>
  );
};

const MarketStat = ({ label, value, suffix = "", big }) => (
  <div className="market-stat">
    <div className="eyebrow">{label}</div>
    <div className={"market-stat-v f-display numeric " + (big ? "is-big" : "")}>
      {typeof value === "number"
        ? <AnimatedNumber value={value} suffix={suffix}/>
        : <span>{value}{suffix}</span>}
    </div>
  </div>
);

const CurveRow = ({ c, i, onClick }) => {
  const s = c.state;
  // pseudo 24h change
  const ch = ((parseInt(c.id, 36) % 23) - 10) / 100;
  const up = ch >= 0;

  return (
    <button className="markets-table-row" onClick={onClick}>
      <span style={{flex:"0 0 50px", color:"var(--fg-3)"}} className="f-mono">{String(i).padStart(2,"0")}</span>
      <span style={{flex:"1 0 220px"}} className="markets-table-name">
        <Flag country={c} w={40} h={28}/>
        <div>
          <div className="f-display" style={{fontSize:20, lineHeight:1}}>{c.name}</div>
          <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)", marginTop:2}}>[{c.id}] · {c.conf}</div>
        </div>
      </span>
      <span style={{flex:"0 0 120px"}}>
        {s.curveOpen ? (
          <span className="f-mono numeric" style={{fontSize:15, color:"var(--fg)"}}>{s.price.toFixed(2)} <span style={{color:"var(--fg-3)"}}>G</span></span>
        ) : <span className="f-mono" style={{color:"var(--fg-3)", fontSize:13}}>—</span>}
      </span>
      <span style={{flex:"0 0 100px"}}>
        {s.curveOpen ? (
          <span className="f-mono numeric" style={{fontSize:13, color: up ? "var(--bull)" : "var(--bear)"}}>
            {up ? "▲" : "▼"} {(Math.abs(ch)*100).toFixed(2)}%
          </span>
        ) : <span className="f-mono" style={{color:"var(--fg-3)", fontSize:13}}>—</span>}
      </span>
      <span style={{flex:"0 0 200px"}}>
        {s.curveOpen ? <Sparkline seed={parseInt(c.id, 36)} up={up}/> : <span className="f-mono" style={{color:"var(--fg-3)", fontSize:11}}>{s.sealed ? "Awaiting seal..." : "Pack open"}</span>}
      </span>
      <span style={{flex:"0 0 180px"}}>
        <div className="markets-supply">
          <span className="f-mono numeric" style={{fontSize:12}}>{s.supply.toLocaleString()}</span>
          <div className="bar" style={{flex:1}}>
            <div className="bar-fill accent" style={{width: `${(s.supply/20000)*100}%`}}/>
          </div>
          <span className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>{((s.supply/20000)*100).toFixed(0)}%</span>
        </div>
      </span>
      <span style={{flex:"0 0 120px"}}>
        <span className="f-mono" style={{color:"var(--fg-3)", fontSize:13}}>—</span>
      </span>
      <span style={{flex:"0 0 100px", textAlign:"right"}}>
        <span className="pack-table-arrow">{s.curveOpen ? "Trade →" : s.sealed ? "Awaiting" : "Pack →"}</span>
      </span>
    </button>
  );
};

const Sparkline = ({ seed, up, w = 180, h = 32 }) => {
  const pts = [];
  let v = 0.5;
  for (let i = 0; i < 30; i++) {
    v += ((Math.sin(seed * (i+1) * 0.3) + 1) / 2 - 0.5) * 0.15;
    v += (up ? 0.005 : -0.004) * i / 30;
    v = Math.max(0.05, Math.min(0.95, v));
    pts.push(v);
  }
  const path = pts.map((y, i) => {
    const x = (i / (pts.length-1)) * w;
    const Y = h - y * h;
    return `${i===0?"M":"L"}${x.toFixed(1)},${Y.toFixed(1)}`;
  }).join(" ");
  const color = up ? "var(--bull)" : "var(--bear)";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:"block"}}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
};

/* ============== MARKET DETAIL ============== */
const MarketDetail = ({ setRoute, countryId, burned, setBurned }) => {
  const c = COUNTRIES.find(x => x.id === countryId) || COUNTRIES[0];
  const chain = (window.useChain ? window.useChain() : { lastUpdate: 0 });
  const wallet = (window.WALLET ? window.WALLET.state : { connected: false, goalBalance: 0 });
  const [walletTick, setWalletTick] = React.useState(0);
  React.useEffect(() => window.WALLET ? window.WALLET.subscribe(() => setWalletTick(t => t + 1)) : undefined, []);
  const s = countryState(c);

  const [mode, setMode] = React.useState("buy");
  const [amount, setAmount] = React.useState(100);
  const [slippageBps, setSlippageBps] = React.useState(100); // 1%
  const [txState, setTxState] = React.useState("idle"); // idle | approving | sending | mining | success | error
  const [txHash, setTxHash] = React.useState(null);
  const [errMsg, setErrMsg] = React.useState(null);
  const [quoteOut, setQuoteOut] = React.useState(null);
  const [tokenBal, setTokenBal] = React.useState(null);

  const A = 20000;
  const feeBurn = (amount * 0.05).toFixed(3);

  // Live quote (debounced)
  React.useEffect(() => {
    let cancel = false;
    setQuoteOut(null);
    if (!s.curveAddr || !s.curveOpen || !amount || amount <= 0) return;
    const t = setTimeout(async () => {
      try {
        const amtWei = ethers.parseEther(String(amount));
        const q = mode === "buy"
          ? await window.TX.quoteBuy(s.curveAddr, amtWei)
          : await window.TX.quoteSell(s.curveAddr, amtWei);
        if (!cancel && q !== null) setQuoteOut(Number(ethers.formatEther(q)));
      } catch {}
    }, 350);
    return () => { cancel = true; clearTimeout(t); };
  }, [amount, mode, s.curveAddr, s.curveOpen, chain.lastUpdate]);

  // User's country-token balance for sell-side
  React.useEffect(() => {
    let cancel = false;
    async function load() {
      if (!wallet.connected || !s.tokenAddr || !window.CHAIN?._provider) { setTokenBal(null); return; }
      try {
        const t = new ethers.Contract(s.tokenAddr, ["function balanceOf(address) view returns (uint256)"], window.CHAIN._provider);
        const b = await t.balanceOf(wallet.address);
        if (!cancel) setTokenBal(Number(ethers.formatEther(b)));
      } catch {}
    }
    load();
    const id = setInterval(load, 20_000);
    return () => { cancel = true; clearInterval(id); };
  }, [wallet.connected, wallet.address, s.tokenAddr, txState]);

  const tokenOut = quoteOut !== null ? quoteOut : 0;

  const handleTrade = async () => {
    if (!wallet.connected) { alert("Connect your wallet first."); return; }
    if (!s.curveOpen) { alert("Curve trading not active yet — pack window still open."); return; }
    if (!s.curveAddr || !s.tokenAddr) { alert("Curve not deployed yet."); return; }
    setErrMsg(null); setTxHash(null);
    try {
      const amtWei = ethers.parseEther(String(amount));
      const onStep = (step, hash) => {
        if (step === "approving") setTxState("approving");
        else if (step === "sending") setTxState("sending");
        else if (step === "mining") { setTxState("mining"); if (hash) setTxHash(hash); }
        else if (step === "done") { setTxState("success"); if (hash) setTxHash(hash); }
      };
      if (mode === "buy") {
        await window.TX.curveBuy(s.curveAddr, amtWei, slippageBps, onStep);
      } else {
        await window.TX.curveSell(s.curveAddr, s.tokenAddr, amtWei, slippageBps, onStep);
      }
      window.WALLET.refreshBalances();
      window.CHAIN.refresh();
      setTimeout(() => setTxState("idle"), 4000);
    } catch (e) {
      console.error(e);
      setTxState("error");
      setErrMsg(e?.shortMessage || e?.reason || e?.message || "Transaction failed");
    }
  };

  const balToShow = mode === "buy" ? wallet.goalBalance : tokenBal;
  const pending = txState === "approving" || txState === "sending" || txState === "mining";

  return (
    <main className="match-page market-detail">
      <section className="md-head">
        <button className="pc-back" onClick={()=>setRoute({name:"markets"})}>← All Markets</button>
        <div className="md-head-row">
          <div className="md-head-l">
            <Flag country={c} w={88} h={60}/>
            <div>
              <div className="eyebrow">[{c.id}] / GOAL · Country curve · {c.conf}</div>
              <h1 className="f-display" style={{fontSize:"clamp(40px,6vw,84px)", lineHeight:0.98, letterSpacing:"-0.025em", margin:"6px 0 8px"}}>
                {c.name}
              </h1>
              <div style={{display:"flex", gap:12, alignItems:"center"}}>
                <span className="f-mono numeric" style={{fontSize:24, color:"var(--fg)"}}>{s.price.toFixed(3)} G</span>
                <span className="f-mono numeric" style={{fontSize:13, color: s.price > 5 ? "var(--bull)" : "var(--bear)"}}>
                  {s.price > 5 ? "▲" : "▼"} 2.81% · 24h
                </span>
              </div>
              <div className="md-head-players">
                <div className="md-head-players-label eyebrow">3 player curves</div>
                {["BST","CPT","RKE"].map(role => {
                  const pname = window.playerName ? window.playerName(c.id, role) : `${c.id} ${role}`;
                  const num = role === "CPT" ? 10 : role === "BST" ? 9 : 23;
                  return (
                    <button key={role} className={"md-head-player-link tier-link-" + role}
                            onClick={() => setRoute({name:"playerMarket", id: `${c.id}-${role}`})}>
                      <span className={"player-card-badge badge-" + role}>{role}</span>
                      <span className="f-mono" style={{fontSize:12}}>{pname}</span>
                      <span className="f-mono" style={{fontSize:11, color:"var(--fg-4)", marginLeft:"auto"}}>#{num} →</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="md-head-stats">
            <MDStat label="Supply"        value={s.supply}                  sub={`of ${A.toLocaleString()}`}/>
            <MDStat label="Asymptote dist" value={`${(100 - s.supply/A*100).toFixed(2)}%`}/>
            <MDStat label="Reserve (GOAL)" value={Math.round(s.reserve || 0)} fire={false}/>
            <MDStat label="Burned"         value="—" sub="indexer pending"/>
          </div>
        </div>
      </section>

      <section className="md-grid">
        <div className="md-chart-wrap">
          <div className="md-chart-head">
            <div className="md-chart-tabs">
              {["1H","1D","7D","30D","ALL"].map(t => (
                <button key={t} className={"md-chart-tab " + (t==="1D" ? "is-active" : "")}>{t}</button>
              ))}
            </div>
            <div className="md-chart-meta">
              <span className="eyebrow">Curve</span>
              <span className="f-mono" style={{fontSize:11, color:"var(--accent)"}}>K = {K.toFixed(0)}</span>
            </div>
          </div>
          <CurveChart c={c} s={s}/>
          <div className="md-events">
            <div className="md-events-head">
              <span className="eyebrow">Recent transfers</span>
              <span className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>last 8</span>
            </div>
            <TransferLogFeed tokenAddr={s.tokenAddr} symbol={c.id} mintsOnly={false} limit={8}/>
          </div>
        </div>

        <div className="md-trade">
          <div className="md-trade-tabs">
            <button className={"md-trade-tab " + (mode==="buy" ? "is-active is-buy" : "")} onClick={()=>setMode("buy")}>Buy</button>
            <button className={"md-trade-tab " + (mode==="sell" ? "is-active is-sell" : "")} onClick={()=>setMode("sell")}>Sell</button>
          </div>

          <div className="md-trade-body">
            <div className="md-input">
              <div className="md-input-head">
                <span className="eyebrow">{mode==="buy" ? "You pay" : "You sell"}</span>
                <span className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>
                  Balance: {wallet.connected
                    ? (balToShow !== null ? balToShow.toLocaleString(undefined,{maximumFractionDigits:4}) : "…")
                    : "—"} {mode==="buy" ? "GOAL" : c.id}
                </span>
              </div>
              <div className="md-input-row">
                <input
                  className="md-input-field f-display numeric"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value) || 0)}
                  type="number"
                />
                <div className="md-input-token">
                  <div className="md-input-token-tag f-mono">{mode==="buy" ? "GOAL" : c.id}</div>
                </div>
              </div>
              <div className="md-input-presets">
                {[25, 50, 75].map(p => (
                  <button key={p} className="md-preset" onClick={() => balToShow && setAmount(Number((balToShow * p/100).toFixed(4)))}>{p}%</button>
                ))}
                <button className="md-preset" onClick={() => balToShow && setAmount(Number(balToShow.toFixed(4)))}>MAX</button>
              </div>
            </div>

            <div className="md-swap-arrow">↓</div>

            <div className="md-input">
              <div className="md-input-head">
                <span className="eyebrow">You receive (quote)</span>
                <span className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>after 5% curve fee → burn</span>
              </div>
              <div className="md-input-row">
                <div className="md-input-field f-display-it numeric" style={{color:"var(--accent)"}}>
                  {quoteOut !== null ? quoteOut.toLocaleString(undefined,{maximumFractionDigits:4}) : "—"}
                </div>
                <div className="md-input-token">
                  <div className="md-input-token-tag f-mono">{mode==="buy" ? c.id : "GOAL"}</div>
                </div>
              </div>
            </div>

            <div className="md-rate">
              <div className="md-rate-row">
                <span className="eyebrow">Rate</span>
                <span className="f-mono">1 {c.id} = {s.price.toFixed(3)} G</span>
              </div>
              <div className="md-rate-row">
                <span className="eyebrow">Slippage</span>
                <span style={{display:"flex", gap:4}}>
                  {[[10,"0.1%"],[50,"0.5%"],[100,"1%"],[200,"2%"]].map(([bps, lbl]) => (
                    <button key={bps} onClick={()=>setSlippageBps(bps)}
                            className="f-mono"
                            style={{fontSize:11, padding:"2px 6px", borderRadius:4,
                                    background: slippageBps===bps ? "var(--accent)":"transparent",
                                    color: slippageBps===bps ? "var(--bg)":"var(--fg-2)",
                                    border:"1px solid var(--line)", cursor:"pointer"}}>
                      {lbl}
                    </button>
                  ))}
                </span>
              </div>
              <div className="md-rate-row">
                <span className="eyebrow">Curve fee</span>
                <span className="f-mono" style={{color:"var(--fire)"}}>5% → burn</span>
              </div>
              <div className="md-rate-row" style={{paddingTop:10, borderTop:"1px solid var(--line)"}}>
                <span className="f-mono" style={{fontSize:12, color:"var(--fg-2)"}}>Net burn this trade</span>
                <span className="f-mono numeric" style={{fontSize:13, color:"var(--fire)"}}>−{feeBurn} {mode==="buy" ? "G" : c.id}</span>
              </div>
            </div>

            <button
              className={"btn md-trade-cta " + (mode==="buy" ? "btn-primary" : "btn-fire")}
              onClick={handleTrade}
              disabled={pending || !wallet.connected || !s.curveOpen}
            >
              {!wallet.connected ? "Connect wallet" :
               !s.curveOpen ? "Curve not yet active" :
               txState === "approving" ? <><span className="pc-spin"/> Approve in wallet…</> :
               txState === "sending"   ? <><span className="pc-spin"/> Confirm in wallet…</> :
               txState === "mining"    ? <><span className="pc-spin"/> Mining…</> :
               txState === "success"   ? "✓ Confirmed" :
               `${mode==="buy" ? "Buy" : "Sell"} ${c.id}`}
            </button>

            {errMsg && <div className="f-mono" style={{color:"var(--fire)", fontSize:11, marginTop:8}}>{errMsg}</div>}
            {txHash && (
              <div className="md-trade-foot">
                <a className="f-mono" style={{fontSize:10, color:"var(--fg-4)"}}
                   href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer noopener">
                  tx: {txHash.slice(0, 14)}… (Etherscan)
                </a>
              </div>
            )}
            {!txHash && (
              <div className="md-trade-foot">
                <span className="f-mono" style={{fontSize:10, color:"var(--fg-4)"}}>
                  Curve · {s.curveAddr ? `${s.curveAddr.slice(0,8)}…${s.curveAddr.slice(-4)}` : "not deployed"}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer setRoute={setRoute}/>
    </main>
  );
};

const MDStat = ({ label, value, suffix = "", sub, fire }) => (
  <div className="md-stat">
    <div className="eyebrow">{label}</div>
    <div className={"f-display numeric " + (fire ? "is-fire" : "")} style={{fontSize:24, lineHeight:1, marginTop:4, color: fire ? "var(--fire)" : "var(--fg)"}}>
      {typeof value === "number" ? value.toLocaleString() : value}{suffix}
    </div>
    {sub && <div className="f-mono" style={{fontSize:10, color:"var(--fg-3)", marginTop:4}}>{sub}</div>}
  </div>
);

const CurveChart = ({ c, s }) => {
  // Real K-line — pulls Bought/Sold events from this curve and renders the
  // price-at-trade line over the theoretical bonding-curve geometry.
  return (
    <CurveKLine
      curveAddr={s.curveAddr}
      currentPrice={s.price}
      currentSupply={s.supply}
      max={20000}
      curveOpen={s.curveOpen}
      symbol={c.id}
    />
  );
};

window.Markets = Markets;
window.MarketDetail = MarketDetail;
