// FOOTBALL — stub pages (will be built out progressively)
const Mechanics  = ({ setRoute }) => <StubPage title="机制"  setRoute={setRoute} />;
const Pack       = ({ setRoute }) => <StubPage title="开包窗口" setRoute={setRoute} />;
const PackCountry= ({ setRoute, countryId }) => <StubPage title={`开包 · ${countryId}`} setRoute={setRoute} />;
const PackPlayer = ({ setRoute, countryId }) => <StubPage title={`球员包 · ${countryId}`} setRoute={setRoute} />;
const Markets    = ({ setRoute }) => <StubPage title="市场" setRoute={setRoute} />;
const MarketDetail = ({ setRoute, countryId }) => <StubPage title={`市场 · ${countryId}`} setRoute={setRoute} />;
const Portfolio  = ({ setRoute }) => <StubPage title="资产组合" setRoute={setRoute} />;
const Burn       = ({ setRoute }) => <StubPage title="销毁看板" setRoute={setRoute} />;

const StubPage = ({ title, setRoute }) => (
  <main className="match-page">
    <section style={{padding:"80px 0"}}>
      <div className="eyebrow" style={{marginBottom:16}}>页面</div>
      <h1 className="f-display" style={{fontSize:96, lineHeight:1, margin:"0 0 24px", letterSpacing:"-0.02em"}}>
        {title}
      </h1>
      <p style={{color:"var(--fg-3)", maxWidth:600, lineHeight:1.6}}>
        将在下一次迭代中推出。
      </p>
      <div style={{marginTop:32, display:"flex", gap:12}}>
        <button className="btn" onClick={()=>setRoute({name:"home"})}>← 返回首页</button>
      </div>
    </section>
  </main>
);

Object.assign(window, {
  Mechanics, Pack, PackCountry, PackPlayer, Markets, MarketDetail, Portfolio, Burn, StubPage
});
