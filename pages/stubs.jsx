// FOOTBALL — stub pages (will be built out progressively)
const Mechanics  = ({ setRoute }) => <StubPage title={L("机制", "Mechanics")}  setRoute={setRoute} />;
const Pack       = ({ setRoute }) => <StubPage title={L("开包窗口", "Pack Window")} setRoute={setRoute} />;
const PackCountry= ({ setRoute, countryId }) => <StubPage title={L(`开包 · ${countryId}`, `Open Pack · ${countryId}`)} setRoute={setRoute} />;
const PackPlayer = ({ setRoute, countryId }) => <StubPage title={L(`球员包 · ${countryId}`, `Player Pack · ${countryId}`)} setRoute={setRoute} />;
const Markets    = ({ setRoute }) => <StubPage title={L("市场", "Markets")} setRoute={setRoute} />;
const MarketDetail = ({ setRoute, countryId }) => <StubPage title={L(`市场 · ${countryId}`, `Market · ${countryId}`)} setRoute={setRoute} />;
const Portfolio  = ({ setRoute }) => <StubPage title={L("资产组合", "Portfolio")} setRoute={setRoute} />;
const Burn       = ({ setRoute }) => <StubPage title={L("销毁看板", "Burn Dashboard")} setRoute={setRoute} />;

const StubPage = ({ title, setRoute }) => (
  <main className="match-page">
    <section style={{padding:"80px 0"}}>
      <div className="eyebrow" style={{marginBottom:16}}>{L("页面", "Page")}</div>
      <h1 className="f-display" style={{fontSize:96, lineHeight:1, margin:"0 0 24px", letterSpacing:"-0.02em"}}>
        {title}
      </h1>
      <p style={{color:"var(--fg-3)", maxWidth:600, lineHeight:1.6}}>
        {L("将在下一次迭代中推出。", "Shipping in the next iteration.")}
      </p>
      <div style={{marginTop:32, display:"flex", gap:12}}>
        <button className="btn" onClick={()=>setRoute({name:"home"})}>{L("← 返回首页", "← Back to Home")}</button>
      </div>
    </section>
  </main>
);

Object.assign(window, {
  Mechanics, Pack, PackCountry, PackPlayer, Markets, MarketDetail, Portfolio, Burn, StubPage
});
