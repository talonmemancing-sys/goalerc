// MATCH — stub pages (will be built out progressively)
const Mechanics  = ({ setRoute }) => <StubPage title="Mechanics"  setRoute={setRoute} />;
const Pack       = ({ setRoute }) => <StubPage title="Pack Window" setRoute={setRoute} />;
const PackCountry= ({ setRoute, countryId }) => <StubPage title={`Pack · ${countryId}`} setRoute={setRoute} />;
const PackPlayer = ({ setRoute, countryId }) => <StubPage title={`Player Pack · ${countryId}`} setRoute={setRoute} />;
const Markets    = ({ setRoute }) => <StubPage title="Markets" setRoute={setRoute} />;
const MarketDetail = ({ setRoute, countryId }) => <StubPage title={`Market · ${countryId}`} setRoute={setRoute} />;
const Portfolio  = ({ setRoute }) => <StubPage title="Portfolio" setRoute={setRoute} />;
const Burn       = ({ setRoute }) => <StubPage title="Burn Dashboard" setRoute={setRoute} />;

const StubPage = ({ title, setRoute }) => (
  <main className="match-page">
    <section style={{padding:"80px 0"}}>
      <div className="eyebrow" style={{marginBottom:16}}>Page</div>
      <h1 className="f-display" style={{fontSize:96, lineHeight:1, margin:"0 0 24px", letterSpacing:"-0.02em"}}>
        {title}
      </h1>
      <p style={{color:"var(--fg-3)", maxWidth:600, lineHeight:1.6}}>
        Coming up in the next iteration.
      </p>
      <div style={{marginTop:32, display:"flex", gap:12}}>
        <button className="btn" onClick={()=>setRoute({name:"home"})}>← Back to Home</button>
      </div>
    </section>
  </main>
);

Object.assign(window, {
  Mechanics, Pack, PackCountry, PackPlayer, Markets, MarketDetail, Portfolio, Burn, StubPage
});
