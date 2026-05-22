// FOOTBALL — Home page
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
          <div className="eyebrow">FOOTBALL 协议 · BSC · 48 国 144 球员</div>
          <div className="home-hero-tagline f-mono">
            {!countdown.available ? (
              <span style={{color:"var(--fg-3)"}}>读取开包窗口中…</span>
            ) : countdown.closed ? (
              <span style={{color:"var(--fire)"}}>开包窗口已关闭 · 曲线开启中</span>
            ) : (
              <>
                <span style={{color:"var(--fg)"}}>{countdown.days}天 {countdown.hours}时 {countdown.mins}分 {countdown.secs}秒</span>
                <span> · 距开包窗口关闭</span>
              </>
            )}
          </div>
          <GoalPriceTicker/>
        </div>

        <div className="home-hero-headline">
          <span className="line-1">世界杯，</span>
          <span className="line-2">全部上链。</span>
        </div>

        <div className="home-hero-grid">
          <div className="home-hero-prose">
            <p className="home-hero-lede">
              48 国家。144 球员。<span style={{color:"var(--pitch-green)"}}>同&nbsp;一颗球。</span>
              <br/>
              FOOTBALL 总量 10 亿，每笔曲线交易持续销毁。
            </p>
            <p className="home-hero-fine">
              192 条链上联合曲线。无团队。无增发。无退出。
              <br/>
              在 BSC 上永久不可篡改。<span style={{color:"var(--accent)"}}>这颗球永不停转。</span>
            </p>
            <div className="home-hero-cta">
              <button className="btn btn-primary" onClick={()=>setRoute({name:"pack"})}>
                开一包
                <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 5 L10 5 M6 1 L10 5 L6 9" stroke="currentColor" strokeWidth="1.4" fill="none"/></svg>
              </button>
              <button className="btn" onClick={()=>setRoute({name:"markets"})}>
                交易曲线
              </button>
              <button className="btn" onClick={()=>setRoute({name:"mechanics"})}>
                查看机制
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
          <span className="eyebrow">阶段状态</span>
          <div className="hairline" />
        </div>

        <div className="home-phases-grid">
          <PhaseCard
            num="I" title="开包窗口" state="OPEN"
            sub={`已售 ${packsSold.toLocaleString()} / ${totalPacks.toLocaleString()} 包`}
            pct={Math.round(packsSold / totalPacks * 100)}
            countdown={countdown}
          />
          <PhaseCard
            num="II" title="曲线交易" state="PARTIAL"
            sub={`${COUNTRIES.filter(c=>countryState(c).curveOpen).length} / 48 条国家曲线已上线`}
            pct={Math.round(COUNTRIES.filter(c=>countryState(c).curveOpen).length / 48 * 100)}
          />
        </div>
      </section>

      {/* ============ COUNTRY GRID ============ */}
      <section className="home-countries">
        <div className="section-eyebrow">
          <span className="eyebrow">48 国家 · 144 球员 · 192 条曲线</span>
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
                    {s.curveOpen ? "曲线上线" : s.sealed ? "已封盘" : "开包中"}
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
                      <span><span className="v">{s.price.toFixed(2)}</span> /枚</span>
                      <span><span className="v">{s.supply.toLocaleString()}</span> / 20k</span>
                    </>
                  ) : (
                    <>
                      <span><span className="v">{(s.packsSold/1000).toFixed(1)}k</span>/18k 包</span>
                      <span>1 枚/包</span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ============ TREASURY · 4% 税分配 ============ */}
      <section className="home-v4">
        <div className="section-eyebrow">
          <span className="eyebrow">金库 · 4% 交易税</span>
          <div className="hairline" />
        </div>

        <div className="home-v4-grid">
          <div>
            <div className="eyebrow" style={{marginBottom:12}}>PitchTreasury · 链上自动分账</div>
            <h2 className="f-display" style={{fontSize:"clamp(36px,5vw,72px)", lineHeight:1.0, margin:"0 0 24px", letterSpacing:"-0.045em", fontWeight:600}}>
              买过包，就持续分红。
            </h2>
            <p style={{color:"var(--fg-2)", fontSize:17, lineHeight:1.6, maxWidth:560}}>
              FOOTBALL 是 flap.sh 发射的 4/4 税代币 —— 每一笔在内盘或 PancakeSwap 上的买卖，
              4% 自动换成 BNB 打进金库合约。金库把每笔进账拆成两份：
            </p>
            <div className="home-v4-stats">
              <div><div className="stat-label f-mono">50% · 冠军回购</div><div className="f-mono" style={{color:"var(--fg)"}}>回购 FOOTBALL</div></div>
              <div><div className="stat-label f-mono">50% · 持包人分红</div><div className="f-mono" style={{color:"var(--fg)"}}>发给买包的人</div></div>
            </div>
            <p style={{color:"var(--fg-3)", fontSize:13, lineHeight:1.6, maxWidth:560, marginTop:16}}>
              分红按你买过的国家包数量加权（MasterChef 会计），BNB 随时可在金库领取。
            </p>
            <button className="btn" style={{marginTop:32}} onClick={()=>setRoute({name:"mechanics"})}>
              阅读完整机制
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 5 L10 5 M6 1 L10 5 L6 9" stroke="currentColor" strokeWidth="1.4" fill="none"/></svg>
            </button>
          </div>

          <TaxSplitCard />
        </div>
      </section>

      <Footer setRoute={setRoute} />
    </main>
  );
};

/* ============ Sub-components ============ */
// Live FOOTBALL price ticker — auto-appears once DexScreener indexes the PancakeSwap pool.
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
       href={price.pairUrl || `https://dexscreener.com/bsc/${window.FOOTBALL_CONFIG.football}`}
       target="_blank" rel="noreferrer noopener"
       style={{display:"inline-flex", gap:14, alignItems:"center", textDecoration:"none", marginTop:6}}>
      <span style={{color:"var(--fg)"}}>${price.priceUsd.toLocaleString(undefined, {maximumFractionDigits: 6})}</span>
      <span style={{color: up ? "var(--bull)" : "var(--bear)"}}>
        {up ? "▲" : "▼"} {Math.abs(price.change24h).toFixed(2)}% 24小时
      </span>
      <span style={{color:"var(--fg-3)", fontSize:11}}>
        · 成交量 ${price.volume24h.toLocaleString(undefined,{maximumFractionDigits:0})}
        · 流动性 ${price.liquidityUsd.toLocaleString(undefined,{maximumFractionDigits:0})}
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
  const total = window.TOTAL_SUPPLY || 1_000_000_000;
  const remaining = total - burned;
  const pct = (burned / total) * 100;
  // Adaptive decimals tuned to keep both columns from overflowing the gauge:
  //   - Circulating: always integer (the fractional part is meaningless at 100k+)
  //   - Burned: only as many decimals as we need to show the magnitude
  const burnDecimals =
    burned >= 10000 ? 0 :
    burned >= 100   ? 2 :
    burned >= 1     ? 3 :
    burned > 0      ? 4 : 0;
  const remainDecimals = 0;

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
        <span className="eyebrow">实时 · BSC</span>
        <span className="supply-gauge-live-dot"/>
      </div>

      <div className="supply-gauge-row">
        <div className="supply-gauge-col">
          <div className="supply-gauge-label">流通量</div>
          <div className="supply-gauge-big">
            <AnimatedNumber value={remaining} duration={1400} decimals={remainDecimals}/>
          </div>
          <div className="supply-gauge-unit">
            <span className="supply-gauge-unit-tag">FOOTBALL</span>
            <span className="supply-gauge-unit-sub">总量 · 10 亿</span>
          </div>
        </div>
        <div className="supply-gauge-divider"/>
        <div className="supply-gauge-col supply-gauge-col-burn">
          <div className="supply-gauge-label">已永久销毁</div>
          <div className="supply-gauge-burn">
            <span className="supply-gauge-burn-mark">▲</span>
            <AnimatedNumber value={burned} duration={1400} decimals={burnDecimals}/>
          </div>
          <div className="supply-gauge-unit">
            <span className="supply-gauge-unit-tag is-fire">
              ▲ {rate24h === null ? "…" : rate24h.toLocaleString(undefined,{maximumFractionDigits: rate24h < 100 ? 3 : 0})}
            </span>
            <span className="supply-gauge-unit-sub">FOOTBALL / 24小时链上</span>
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
          <span className="f-mono">% 已销毁</span>
        </span>
        <span className="f-mono supply-gauge-foot-end is-right">10 亿</span>
      </div>
    </div>
  );
};

const PhaseCard = ({ num, title, state, sub, pct, countdown }) => (
  <div className="phase-card">
    <div className="phase-card-top">
      <span className="f-display-it" style={{fontSize:64, lineHeight:0.9, color:"var(--fg-4)"}}>{num}</span>
      <div className="phase-card-meta">
        <div className="eyebrow">阶段 {num}</div>
        <div className="phase-card-title f-display">{title}</div>
        <div className={"pill " + (state==="OPEN" ? "accent" : state==="PARTIAL" ? "bull" : "")}>
          <span className="pill-dot"/>{state==="OPEN" ? "开放中" : state==="PARTIAL" ? "部分上线" : state}
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
        <span className="eyebrow">{!countdown.available ? "读取窗口中…" : countdown.closed ? "已关闭" : "剩余时间"}</span>
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
  // Real on-chain ticker — sources from FOOTBALL Transfer logs (burns) every 30s.
  const [events, setEvents] = React.useState([]);

  React.useEffect(() => {
    let cancel = false;
    async function load() {
      if (!window.CHAIN || !window.CHAIN._provider) return;
      try {
        const burns = await window.CHAIN.getRecentBurns(16);
        if (cancel) return;
        const lines = burns.map(b => `销毁 · ${b.value.toFixed(2)} FOOTBALL`);
        // Round out with real per-country supply tags
        const live = window.COUNTRIES
          .filter(c => countryState(c).curveOpen)
          .slice(0, 8)
          .map(c => `${c.id} · 曲线上线 @ ${countryState(c).price.toFixed(2)} FOOTBALL`);
        const combined = lines.length || live.length ? [...lines, ...live] : ["暂无链上事件 · 开包进行中"];
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
    if (text.startsWith("销毁")) return <span style={{color:"var(--fire)"}}>{text}</span>;
    const m = text.match(/^([A-Z]{3})(.*)$/);
    if (m) return <><span style={{color:"var(--pitch-green)"}}>{m[1]}</span>{m[2]}</>;
    return text;
  };

  const display = events.length ? events : ["读取链上事件中…"];
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

const TaxSplitCard = () => (
  <div className="code-block">
    <div className="code-block-bar">
      <span className="f-mono" style={{color:"var(--fg-3)", fontSize:11}}>PitchTreasury · distribute()</span>
      <span className="f-mono" style={{color:"var(--bull)", fontSize:11}}>● BSC 已部署</span>
    </div>
    <div style={{padding:"26px 22px", display:"flex", flexDirection:"column", gap:14}}>
      <div style={{textAlign:"center", paddingBottom:8}}>
        <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)", letterSpacing:"0.06em"}}>每笔交易 4% 税 → 换成 BNB</div>
        <div className="f-display" style={{fontSize:34, lineHeight:1.1, color:"var(--accent)", marginTop:4}}>流入金库合约</div>
      </div>
      {[
        { pct: "50%", label: "冠军回购", sub: "回购 FOOTBALL · 内盘 / 外盘", color: "var(--bull)" },
        { pct: "50%", label: "持包人分红", sub: "按买包数量加权 · BNB 可领取", color: "var(--accent)" },
      ].map(r => (
        <div key={r.label} style={{display:"flex", alignItems:"center", gap:14, padding:"12px 14px", border:"1px solid var(--line)", borderRadius:6}}>
          <div className="f-display numeric" style={{fontSize:30, lineHeight:1, width:68, color:r.color}}>{r.pct}</div>
          <div>
            <div className="f-display" style={{fontSize:18, lineHeight:1.1}}>{r.label}</div>
            <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)", marginTop:2}}>{r.sub}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Footer = ({ setRoute }) => (
  <footer className="match-footer">
    <div className="match-footer-inner">
      <div className="match-footer-credit">
        <div style={{color:"var(--fg-2)"}}>FOOTBALL 协议</div>
        <div>2026 世界杯，全部上链。</div>
        <div>无团队。无增发。无代理。无退出。这颗球永不停转。</div>
        <div style={{marginTop:8, color:"var(--fg-4)"}} className="f-mono">
          {window.FOOTBALL_CONFIG?.football || "FOOTBALL 代币待发射"} · BSC
        </div>
      </div>
      <div className="col gap-2">
        <span className="eyebrow">协议</span>
        <a className="footer-link" onClick={()=>setRoute({name:"mechanics"})}>机制</a>
        <a className="footer-link" onClick={()=>setRoute({name:"burn"})}>销毁看板</a>
        <a className="footer-link" href={`https://bscscan.com/token/${window.FOOTBALL_CONFIG?.football}`} target="_blank" rel="noreferrer noopener">BscScan</a>
      </div>
      <div className="col gap-2">
        <span className="eyebrow">社区</span>
        <a className="footer-link" href="https://x.com/DELPHIbsc" target="_blank" rel="noreferrer noopener">X 上关注 @DELPHIbsc</a>
        <a className="footer-link" href="https://footballflap.online" target="_blank" rel="noreferrer noopener">footballflap.online</a>
      </div>
      <div className="col gap-2">
        <span className="eyebrow">网络</span>
        <span className="f-mono" style={{fontSize:12, color:"var(--fg-2)"}}>BSC · 主网 · 56</span>
        <span className="f-mono" style={{fontSize:12, color:"var(--fg-2)"}}>PancakeSwap</span>
        <span className="f-mono" style={{fontSize:12, color:"var(--fg-2)"}}>Chainlink VRF v2.5</span>
        <span className="f-mono" style={{fontSize:12, color:"var(--fg-2)"}}>OpenZeppelin v5</span>
      </div>
    </div>
  </footer>
);

window.Home = Home;
window.Footer = Footer;
