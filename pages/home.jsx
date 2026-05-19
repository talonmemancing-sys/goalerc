// GOAL — Home page
const Home = ({ setRoute, burned, packsSold, totalPacks, countdown }) => {
  const [filter, setFilter] = React.useState("ALL");
  const confs = ["ALL", "UEFA", "CONMEBOL", "AFC", "CAF", "CONCACAF", "OFC"];
  const list = filter === "ALL" ? COUNTRIES : COUNTRIES.filter(c => c.conf === filter);

  return (
    <main className="match-page">

      {/* ============ HERO ============ */}
      <section className="home-hero">
        <div className="pitch-bg"/>
        <PitchLines/>
        <div className="home-hero-mark">
          <div className="eyebrow">Goal Protocol · Ethereum Mainnet · 6&nbsp;ETH FDV</div>
          <div className="home-hero-tagline f-mono">
            {!countdown.available ? (
              <span style={{color:"var(--fg-3)"}}>reading pack window…</span>
            ) : countdown.closed ? (
              <span style={{color:"var(--fire)"}}>pack window closed · curves opening</span>
            ) : (
              <>
                <span style={{color:"var(--fg)"}}>{countdown.days}d {countdown.hours}h {countdown.mins}m {countdown.secs}s</span>
                <span> · pack window closes</span>
              </>
            )}
          </div>
          <GoalPriceTicker/>
        </div>

        <div className="home-hero-headline">
          <span className="line-1">The World Cup,</span>
          <span className="line-2">on-chain.</span>
        </div>

        <div className="home-hero-grid">
          <div className="home-hero-prose">
            <p className="home-hero-lede">
              48 nations. 144 players. <span style={{color:"var(--pitch-green)"}}>One&nbsp;ball.</span>
              <br/>
              960,000 supply, deflating with every trade.
            </p>
            <p className="home-hero-fine">
              Closed-loop curves on Uniswap V4. No team. No mint. No exit.
              <br/>
              Immutable on Ethereum mainnet. <span style={{color:"var(--accent)"}}>The ball never stops.</span>
            </p>
            <div className="home-hero-cta">
              <button className="btn btn-primary" onClick={()=>setRoute({name:"pack"})}>
                Open a Pack
                <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 5 L10 5 M6 1 L10 5 L6 9" stroke="currentColor" strokeWidth="1.4" fill="none"/></svg>
              </button>
              <button className="btn" onClick={()=>setRoute({name:"markets"})}>
                Trade Curves
              </button>
              <button className="btn" onClick={()=>setRoute({name:"mechanics"})}>
                Read Mechanics
              </button>
            </div>
          </div>

          <div className="home-hero-side">
            <SupplyGauge burned={burned} />
          </div>
        </div>
      </section>

      {/* ============ TICKER ============ */}
      <Ticker burned={burned} />

      {/* ============ PHASE STATUS ============ */}
      <section className="home-phases">
        <div className="section-eyebrow">
          <span className="eyebrow">Phase Status</span>
          <div className="hairline" />
        </div>

        <div className="home-phases-grid">
          <PhaseCard
            num="I" title="Pack Window" state="OPEN"
            sub={`${packsSold.toLocaleString()} / ${totalPacks.toLocaleString()} packs sold`}
            pct={Math.round(packsSold / totalPacks * 100)}
            countdown={countdown}
          />
          <PhaseCard
            num="II" title="Curve Trading" state="PARTIAL"
            sub={`${COUNTRIES.filter(c=>countryState(c).curveOpen).length} / 48 country curves live`}
            pct={Math.round(COUNTRIES.filter(c=>countryState(c).curveOpen).length / 48 * 100)}
          />
        </div>
      </section>

      {/* ============ COUNTRY GRID ============ */}
      <section className="home-countries">
        <div className="section-eyebrow">
          <span className="eyebrow">48 nations · 144 players · 192 curves</span>
          <div className="hairline" />
        </div>

        <div className="home-countries-filter">
          {confs.map(c => (
            <button
              key={c}
              className={"filter-chip " + (filter === c ? "is-active" : "")}
              onClick={() => setFilter(c)}
            >
              {c}
              <span className="filter-chip-count">
                {c === "ALL" ? COUNTRIES.length : COUNTRIES.filter(x=>x.conf===c).length}
              </span>
            </button>
          ))}
        </div>

        <div className="home-countries-grid">
          {list.map((c, i) => {
            const s = countryState(c);
            return (
              <button key={c.id} className="country-card" onClick={() => setRoute({name: s.curveOpen ? "market" : "packCountry", country: c.id})}>
                <div className="country-card-top">
                  <Flag country={c} w={48} h={32} />
                  <span className={"country-card-status " + (s.curveOpen ? "status-live" : s.sealed ? "status-sealed" : "status-pack")}>
                    {s.curveOpen ? "Curve Live" : s.sealed ? "Sealed" : "Pack Open"}
                  </span>
                </div>
                <div>
                  <div className="country-card-id">[{c.id}] · {c.conf}</div>
                  <div className="country-card-name">{c.name}</div>
                </div>
                <div className="country-card-progress">
                  <div className={"country-card-progress-fill " + (s.curveOpen ? "is-live" : "")}
                       style={{width: `${(s.packsSold/PACKS_PER_COUNTRY)*100}%`}} />
                </div>
                <div className="country-card-foot">
                  {s.curveOpen ? (
                    <>
                      <span><span className="v">{s.price.toFixed(2)}</span> G/tkn</span>
                      <span><span className="v">{s.supply.toLocaleString()}</span> / 20k</span>
                    </>
                  ) : (
                    <>
                      <span><span className="v">{(s.packsSold/1000).toFixed(1)}k</span>/18k packs</span>
                      <span>6.9 G/pack</span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ============ V4 HOOKS CALLOUT ============ */}
      <section className="home-v4">
        <div className="section-eyebrow">
          <span className="eyebrow">Uniswap V4</span>
          <div className="hairline" />
        </div>

        <div className="home-v4-grid">
          <div>
            <div className="eyebrow" style={{marginBottom:12}}>Hook · 0xC0DE</div>
            <h2 className="f-display" style={{fontSize:"clamp(36px,5vw,72px)", lineHeight:1.0, margin:"0 0 24px", letterSpacing:"-0.045em", fontWeight:600}}>
              The burn lives inside the swap.
            </h2>
            <p style={{color:"var(--fg-2)", fontSize:17, lineHeight:1.6, maxWidth:560}}>
              GOAL's 192 bonding curves are deployed as a single Uniswap V4 hook contract.
              Every swap routes through <code className="inline-code">beforeSwap</code>, where the
              5% protocol fee is extracted and routed straight to <code className="inline-code">GOAL.burn()</code>.
              No router, no intermediate transfer, no second transaction. The deflation is
              atomic with the trade.
            </p>
            <div className="home-v4-stats">
              <div><div className="stat-label f-mono">HOOK PERMISSIONS</div><div className="f-mono" style={{color:"var(--fg)"}}>beforeSwap · afterSwap</div></div>
              <div><div className="stat-label f-mono">PER-SWAP OVERHEAD</div><div className="f-mono" style={{color:"var(--fg)"}}>~21,000 gas</div></div>
              <div><div className="stat-label f-mono">FEE CAPTURE</div><div className="f-mono" style={{color:"var(--fg)"}}>100% → burn</div></div>
            </div>
            <button className="btn" style={{marginTop:32}} onClick={()=>setRoute({name:"mechanics"})}>
              Read the hook spec
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 5 L10 5 M6 1 L10 5 L6 9" stroke="currentColor" strokeWidth="1.4" fill="none"/></svg>
            </button>
          </div>

          <CodeBlock />
        </div>
      </section>

      <Footer setRoute={setRoute} />
    </main>
  );
};

/* ============ Sub-components ============ */
// Live GOAL price ticker — auto-appears once DexScreener indexes the V4 pool.
const GoalPriceTicker = () => {
  const [price, setPrice] = React.useState(() => window.PRICES?.state?.goal || null);
  React.useEffect(() => {
    if (!window.PRICES) return;
    setPrice(window.PRICES.state.goal);
    return window.PRICES.subscribe((s) => setPrice(s.goal));
  }, []);
  if (!price) return null;
  const up = (price.change24h || 0) >= 0;
  return (
    <a className="home-hero-tagline f-mono"
       href={price.pairUrl || `https://dexscreener.com/ethereum/${window.GOAL_CONFIG.goal}`}
       target="_blank" rel="noreferrer noopener"
       style={{display:"inline-flex", gap:14, alignItems:"center", textDecoration:"none", marginTop:6}}>
      <span style={{color:"var(--fg)"}}>${price.priceUsd.toLocaleString(undefined, {maximumFractionDigits: 6})}</span>
      <span style={{color: up ? "var(--bull)" : "var(--bear)"}}>
        {up ? "▲" : "▼"} {Math.abs(price.change24h).toFixed(2)}% 24h
      </span>
      <span style={{color:"var(--fg-3)", fontSize:11}}>
        · vol ${price.volume24h.toLocaleString(undefined,{maximumFractionDigits:0})}
        · liq ${price.liquidityUsd.toLocaleString(undefined,{maximumFractionDigits:0})}
      </span>
      <span style={{color:"var(--fg-4)", fontSize:10}}>{price.dexId} →</span>
    </a>
  );
};
window.GoalPriceTicker = GoalPriceTicker;

const PitchLines = () => (
  <svg className="pitch-lines" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    {/* outer border */}
    <rect x="40" y="60" width="1520" height="780" fill="none" stroke="rgba(234, 227, 210, 0.7)" strokeWidth="1.2"/>
    {/* center line */}
    <line x1="800" y1="60" x2="800" y2="840" stroke="rgba(234, 227, 210, 0.7)" strokeWidth="1.2"/>
    {/* center circle + dot */}
    <circle cx="800" cy="450" r="110" fill="none" stroke="rgba(234, 227, 210, 0.7)" strokeWidth="1.2"/>
    <circle cx="800" cy="450" r="3" fill="rgba(234, 227, 210, 0.9)"/>
    {/* left penalty area */}
    <rect x="40" y="230" width="200" height="440" fill="none" stroke="rgba(234, 227, 210, 0.7)" strokeWidth="1.2"/>
    {/* left goal area */}
    <rect x="40" y="340" width="80"  height="220" fill="none" stroke="rgba(234, 227, 210, 0.7)" strokeWidth="1.2"/>
    {/* left penalty arc */}
    <path d="M 240 386 A 90 90 0 0 1 240 514" fill="none" stroke="rgba(234, 227, 210, 0.7)" strokeWidth="1.2"/>
    {/* left penalty spot */}
    <circle cx="170" cy="450" r="3" fill="rgba(234, 227, 210, 0.9)"/>
    {/* right penalty area */}
    <rect x="1360" y="230" width="200" height="440" fill="none" stroke="rgba(234, 227, 210, 0.7)" strokeWidth="1.2"/>
    {/* right goal area */}
    <rect x="1480" y="340" width="80"  height="220" fill="none" stroke="rgba(234, 227, 210, 0.7)" strokeWidth="1.2"/>
    {/* right penalty arc */}
    <path d="M 1360 386 A 90 90 0 0 0 1360 514" fill="none" stroke="rgba(234, 227, 210, 0.7)" strokeWidth="1.2"/>
    {/* right penalty spot */}
    <circle cx="1430" cy="450" r="3" fill="rgba(234, 227, 210, 0.9)"/>
    {/* corner arcs */}
    <path d="M 40 70 A 10 10 0 0 1 50 60"    fill="none" stroke="rgba(234, 227, 210, 0.7)" strokeWidth="1.2"/>
    <path d="M 1560 70 A 10 10 0 0 0 1550 60" fill="none" stroke="rgba(234, 227, 210, 0.7)" strokeWidth="1.2"/>
    <path d="M 40 830 A 10 10 0 0 0 50 840"   fill="none" stroke="rgba(234, 227, 210, 0.7)" strokeWidth="1.2"/>
    <path d="M 1560 830 A 10 10 0 0 1 1550 840" fill="none" stroke="rgba(234, 227, 210, 0.7)" strokeWidth="1.2"/>
  </svg>
);

const FootballOrb = () => (
  <div className="football-orb" aria-hidden="true">⚽</div>
);

const SupplyGauge = ({ burned }) => {
  const total = 960_000;
  const remaining = total - burned;
  const pct = (burned / total) * 100;
  // Adaptive decimals: small burns (< 1000) show 3 decimals so 0.345 is visible.
  const burnDecimals = burned > 0 && burned < 1000 ? 3 : 0;
  const remainDecimals = burned > 0 && burned < 1000 ? 3 : 0;

  // Real 24h burn rate from chain analytics (auto-refreshing).
  const [rate24h, setRate24h] = React.useState(null);
  React.useEffect(() => {
    let cancel = false;
    async function load() {
      if (!window.CHAIN?._provider) return;
      try {
        const a = await window.CHAIN.getBurnAnalytics(7200);
        if (!cancel) setRate24h(a?.ratePer24h ?? 0);
      } catch {}
    }
    const tick = () => {
      if (window.CHAIN?._provider) { load(); }
      else setTimeout(tick, 500);
    };
    tick();
    const id = setInterval(load, 60_000);
    return () => { cancel = true; clearInterval(id); };
  }, []);

  return (
    <div className="supply-gauge">
      <div className="supply-gauge-glow"/>

      <div className="supply-gauge-head">
        <span className="eyebrow">Live · Ethereum mainnet</span>
        <span className="supply-gauge-live-dot"/>
      </div>

      <div className="supply-gauge-row">
        <div className="supply-gauge-col">
          <div className="supply-gauge-label">Circulating</div>
          <div className="supply-gauge-big">
            <AnimatedNumber value={remaining} duration={1400} decimals={remainDecimals}/>
          </div>
          <div className="supply-gauge-unit">
            <span className="supply-gauge-unit-tag">GOAL</span>
            <span className="supply-gauge-unit-sub">capped · 960,000</span>
          </div>
        </div>
        <div className="supply-gauge-divider"/>
        <div className="supply-gauge-col supply-gauge-col-burn">
          <div className="supply-gauge-label">Burned forever</div>
          <div className="supply-gauge-burn">
            <span className="supply-gauge-burn-mark">▲</span>
            <AnimatedNumber value={burned} duration={1400} decimals={burnDecimals}/>
          </div>
          <div className="supply-gauge-unit">
            <span className="supply-gauge-unit-tag is-fire">
              ▲ {rate24h === null ? "…" : rate24h.toLocaleString(undefined,{maximumFractionDigits: rate24h < 100 ? 3 : 0})}
            </span>
            <span className="supply-gauge-unit-sub">GOAL / 24h on-chain</span>
          </div>
        </div>
      </div>

      <div className="supply-gauge-track">
        <div className="supply-gauge-track-fill" style={{width: `${pct}%`}}>
          <div className="supply-gauge-track-pulse"/>
        </div>
        <div className="supply-gauge-track-ticks">
          {Array.from({length: 41}).map((_,i)=>(<span key={i} className={i % 4 === 0 ? "is-major" : ""}/>))}
        </div>
      </div>
      <div className="supply-gauge-foot">
        <span className="f-mono supply-gauge-foot-end">0</span>
        <span className="supply-gauge-foot-pct">
          <span className="f-display numeric">{pct.toFixed(2)}</span>
          <span className="f-mono">% burned</span>
        </span>
        <span className="f-mono supply-gauge-foot-end is-right">960k</span>
      </div>
    </div>
  );
};

const PhaseCard = ({ num, title, state, sub, pct, countdown }) => (
  <div className="phase-card">
    <div className="phase-card-top">
      <span className="f-display-it" style={{fontSize:64, lineHeight:0.9, color:"var(--fg-4)"}}>{num}</span>
      <div className="phase-card-meta">
        <div className="eyebrow">Phase {num}</div>
        <div className="phase-card-title f-display">{title}</div>
        <div className={"pill " + (state==="OPEN" ? "accent" : state==="PARTIAL" ? "bull" : "")}>
          <span className="pill-dot"/>{state}
        </div>
      </div>
    </div>
    <div className="phase-card-bar">
      <div className="bar"><div className="bar-fill accent" style={{width:`${pct}%`}}/></div>
      <div className="phase-card-bar-foot">
        <span className="f-mono">{sub}</span>
        <span className="f-mono numeric">{pct}%</span>
      </div>
    </div>
    {countdown && (
      <div className="phase-card-countdown">
        <span className="eyebrow">{!countdown.available ? "Reading window…" : countdown.closed ? "Closed" : "Closes in"}</span>
        <div className="f-mono numeric" style={{fontSize:22, color: countdown.closed ? "var(--fire)" : "var(--fg)"}}>
          {!countdown.available ? "—" :
           countdown.closed ? "00:00:00:00" :
           `${String(countdown.days).padStart(2,"0")}:${String(countdown.hours).padStart(2,"0")}:${String(countdown.mins).padStart(2,"0")}:${String(countdown.secs).padStart(2,"0")}`}
        </div>
      </div>
    )}
  </div>
);

const Ticker = ({ burned }) => {
  // Real on-chain ticker — sources from GOAL Transfer logs (burns) every 30s.
  const [events, setEvents] = React.useState([]);

  React.useEffect(() => {
    let cancel = false;
    async function load() {
      if (!window.CHAIN || !window.CHAIN._provider) return;
      try {
        const burns = await window.CHAIN.getRecentBurns(16);
        if (cancel) return;
        const lines = burns.map(b => `BURN · ${b.value.toFixed(2)} GOAL`);
        // Round out with real per-country supply tags
        const live = window.COUNTRIES
          .filter(c => countryState(c).curveOpen)
          .slice(0, 8)
          .map(c => `${c.id} · curve live @ ${countryState(c).price.toFixed(2)} G`);
        const combined = lines.length || live.length ? [...lines, ...live] : ["No on-chain events yet · packs open"];
        setEvents(combined);
      } catch (e) { /* keep current */ }
    }
    const waitAndLoad = () => {
      if (window.CHAIN && window.CHAIN._provider) {
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
  }, []);

  const colorize = (text) => {
    if (text.startsWith("BURN")) return <span style={{color:"var(--fire)"}}>{text}</span>;
    const m = text.match(/^([A-Z]{3})(.*)$/);
    if (m) return <><span style={{color:"var(--pitch-green)"}}>{m[1]}</span>{m[2]}</>;
    return text;
  };

  const display = events.length ? events : ["Reading on-chain events…"];
  return (
    <div className="ticker">
      <div className="ticker-inner">
        {[...display, ...display].map((e, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-dot" />
            {colorize(e)}
          </span>
        ))}
      </div>
    </div>
  );
};

const CodeBlock = () => (
  <div className="code-block">
    <div className="code-block-bar">
      <span className="f-mono" style={{color:"var(--fg-3)", fontSize:11}}>GoalCurveHook.sol</span>
      <span className="f-mono" style={{color:"var(--fg-4)", fontSize:11}}>solidity 0.8.24</span>
    </div>
    <pre className="code-block-pre">
{`function beforeSwap(
  address, PoolKey calldata key,
  IPoolManager.SwapParams calldata params,
  bytes calldata
) external override returns (bytes4, BeforeSwapDelta, uint24) {
  uint256 amountIn = uint256(-params.amountSpecified);
  uint256 fee      = amountIn * 500 / 10_000;     // 5%

  GOAL.burn(fee);                                // ← atomic deflation
  emit Burned(key.toId(), fee);

  return (BaseHook.beforeSwap.selector,
          toBeforeSwapDelta(int128(int256(fee)), 0),
          0);
}`}
    </pre>
  </div>
);

const Footer = ({ setRoute }) => (
  <footer className="match-footer">
    <div className="match-footer-inner">
      <div className="match-footer-credit">
        <div style={{color:"var(--fg-2)"}}>GOAL PROTOCOL</div>
        <div>The 2026 World Cup, on-chain.</div>
        <div>No team. No mint. No proxy. No exit. The ball never stops.</div>
        <div style={{marginTop:8, color:"var(--fg-4)"}} className="f-mono">
          {window.GOAL_CONFIG?.goal} · mainnet
        </div>
      </div>
      <div className="col gap-2">
        <span className="eyebrow">Protocol</span>
        <a className="footer-link" onClick={()=>setRoute({name:"mechanics"})}>Mechanics</a>
        <a className="footer-link" onClick={()=>setRoute({name:"burn"})}>Burn Dashboard</a>
        <a className="footer-link" href={`https://etherscan.io/token/${window.GOAL_CONFIG?.goal}`} target="_blank" rel="noreferrer noopener">Etherscan</a>
      </div>
      <div className="col gap-2">
        <span className="eyebrow">Community</span>
        <a className="footer-link" href="https://x.com/goal_erc" target="_blank" rel="noreferrer noopener">@goal_erc on X</a>
        <a className="footer-link" href="https://goalerc20.xyz" target="_blank" rel="noreferrer noopener">goalerc20.xyz</a>
      </div>
      <div className="col gap-2">
        <span className="eyebrow">Network</span>
        <span className="f-mono" style={{fontSize:12, color:"var(--fg-2)"}}>Ethereum · Mainnet · 1</span>
        <span className="f-mono" style={{fontSize:12, color:"var(--fg-2)"}}>Uniswap V4</span>
        <span className="f-mono" style={{fontSize:12, color:"var(--fg-2)"}}>Chainlink VRF v2.5</span>
        <span className="f-mono" style={{fontSize:12, color:"var(--fg-2)"}}>OpenZeppelin v5</span>
      </div>
    </div>
  </footer>
);

window.Home = Home;
window.Footer = Footer;
