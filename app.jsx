// FOOTBALL — main app shell
const { useState, useEffect, useMemo } = React;

// Subscribe to live CHAIN cache. Re-renders whenever a fresh mainnet read lands.
function useChain() {
  const [snap, setSnap] = useState(() =>
    window.CHAIN ? window.CHAIN.state : { loading: true, burned: 0, countries: {} }
  );
  useEffect(() => {
    if (!window.CHAIN) return;
    setSnap({ ...window.CHAIN.state });
    return window.CHAIN.subscribe((s) => setSnap({ ...s }));
  }, []);
  return snap;
}
window.useChain = useChain;

const App = () => {
  const [route, setRoute] = useState({ name: "home" });
  const chain = useChain();
  const burned = chain.burned || 0;   // real float — may be 0.345 etc, don't floor
  React.useEffect(() => { window.__matchSetRoute = setRoute; }, []);

  // Pack window countdown — from countryPackOpener.windowClosesAt()
  // Falls back to "—" until the contract read lands.
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const closesAtMs = (chain.packWindow?.closesAt || 0) * 1000;
  const hasWindow = closesAtMs > 0;
  const remaining = hasWindow ? Math.max(0, closesAtMs - now) : 0;
  const countdown = {
    available: hasWindow,
    closed: hasWindow && remaining === 0,
    days:  Math.floor(remaining / 86400000),
    hours: Math.floor((remaining % 86400000) / 3600000),
    mins:  Math.floor((remaining % 3600000) / 60000),
    secs:  Math.floor((remaining % 60000) / 1000),
  };

  // Global packs sold from live country state (recomputes on each chain update)
  const packsSold = useMemo(
    () => COUNTRIES.reduce((s, c) => s + countryState(c).packsSold, 0),
    [chain.lastUpdate]
  );
  const totalPacks = 48 * PACKS_PER_COUNTRY; // 864,000

  // Scroll to top on route change
  useEffect(() => { window.scrollTo({top:0, behavior:"instant"}); }, [route.name, route.country]);

  // Burn is read-only from chain. Trade-success callbacks ask CHAIN for a fresh
  // read instead of locally bumping a fake counter.
  const setBurned = () => { window.CHAIN?.refresh(); };

  // Route table
  const routes = {
    home:        () => <Home setRoute={setRoute} burned={burned} packsSold={packsSold} totalPacks={totalPacks} countdown={countdown} />,
    mechanics:   () => <Mechanics setRoute={setRoute} />,
    pack:        () => <Pack setRoute={setRoute} packsSold={packsSold} totalPacks={totalPacks} countdown={countdown} />,
    packCountry: () => <PackCountry setRoute={setRoute} countryId={route.country} burned={burned} setBurned={setBurned} />,
    packPlayer:  () => <PackPlayer setRoute={setRoute} countryId={route.country} />,
    markets:     () => <Markets setRoute={setRoute} burned={burned} />,
    market:      () => <MarketDetail setRoute={setRoute} countryId={route.country} burned={burned} setBurned={setBurned} />,
    players:        () => <PlayersMarket setRoute={setRoute}/>,
    playerMarket:   () => <PlayerMarketDetail setRoute={setRoute} id={route.id} burned={burned} setBurned={setBurned}/>,
    portfolio:   () => <Portfolio setRoute={setRoute} burned={burned} />,
    burn:        () => <Burn setRoute={setRoute} burned={burned} />,
  };

  const view = routes[route.name] ? routes[route.name]() : routes.home();

  return (
    <>
      <Header route={route} setRoute={setRoute} burned={burned} />
      <CABanner/>
      {view}
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
