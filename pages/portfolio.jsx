// GOAL — Portfolio: real on-chain balances for the connected wallet.
const Portfolio = ({ setRoute, burned }) => {
  const wallet = (window.WALLET ? window.WALLET.state : { connected: false });
  const [walletTick, setWalletTick] = React.useState(0);
  React.useEffect(() => {
    if (!window.WALLET) return;
    return window.WALLET.subscribe(() => setWalletTick(t => t + 1));
  }, []);

  const chain = (window.useChain ? window.useChain() : { lastUpdate: 0 });

  // For each country + player token: balanceOf(user).
  const [positions, setPositions] = React.useState(null);
  const [playerPositions, setPlayerPositions] = React.useState(null);
  const [loadingBalances, setLoadingBalances] = React.useState(false);

  React.useEffect(() => {
    let cancel = false;
    async function loadBalances() {
      if (!wallet.connected || !wallet.address) { setPositions([]); setPlayerPositions([]); return; }
      if (!window.CHAIN?._provider) return;
      setLoadingBalances(true);
      try {
        const provider = window.CHAIN._provider;
        const ERC20 = ["function balanceOf(address) view returns (uint256)"];
        // Country balances
        const cAddrs = window.CHAIN.state.countryAddrs;
        const cTokens = COUNTRIES
          .map(c => ({ c, addr: cAddrs[c.id]?.tokenAddr, state: countryState(c) }))
          .filter(x => x.addr);
        const cBals = await Promise.all(cTokens.map(async ({ c, addr, state }) => {
          try {
            const token = new ethers.Contract(addr, ERC20, provider);
            const bal = await token.balanceOf(wallet.address);
            const amount = Number(ethers.formatEther(bal));
            return amount > 0 ? { c: c.id, country: c, amount, price: state.price, value: amount * state.price, curveOpen: state.curveOpen } : null;
          } catch { return null; }
        }));
        const cPositions = cBals.filter(Boolean);

        // Player balances
        const playerEntries = [];
        for (const c of COUNTRIES) {
          for (const role of ["CPT","BST","RKE"]) {
            const ps = window.CHAIN.state.players[`${c.id}-${role}`];
            if (ps && ps.tokenAddr) playerEntries.push({ c: c.id, role, country: c, addr: ps.tokenAddr, price: ps.price });
          }
        }
        const pBals = await Promise.all(playerEntries.map(async (p) => {
          try {
            const token = new ethers.Contract(p.addr, ERC20, provider);
            const bal = await token.balanceOf(wallet.address);
            const amount = Number(ethers.formatEther(bal));
            return amount > 0 ? { ...p, amount } : null;
          } catch { return null; }
        }));
        const pPositions = pBals.filter(Boolean);

        if (!cancel) {
          setPositions(cPositions);
          setPlayerPositions(pPositions);
        }
      } finally {
        if (!cancel) setLoadingBalances(false);
      }
    }
    loadBalances();
    return () => { cancel = true; };
  }, [wallet.connected, wallet.address, chain.lastUpdate]);

  if (!wallet.connected) {
    return (
      <main className="match-page portfolio">
        <section style={{padding:"80px 0", textAlign:"center"}}>
          <div className="eyebrow" style={{marginBottom:16}}>Portfolio</div>
          <h1 className="f-display" style={{fontSize:64, lineHeight:1, margin:"0 0 24px", letterSpacing:"-0.025em"}}>
            Connect your wallet
          </h1>
          <p style={{color:"var(--fg-3)", maxWidth:520, margin:"0 auto", lineHeight:1.6}}>
            Your portfolio is read live from Ethereum mainnet — connect to see your real GOAL,
            country-token, and player-token balances.
          </p>
        </section>
        <Footer setRoute={setRoute}/>
      </main>
    );
  }

  const goalBal = wallet.goalBalance || 0;
  const ethBal = wallet.ethBalance || 0;
  const totalCountryValue = (positions || []).reduce((s, p) => s + p.value, 0);
  const totalValue = goalBal + totalCountryValue;
  const shortAddr = `${wallet.address.slice(0, 6)}…${wallet.address.slice(-4)}`;

  return (
    <main className="match-page portfolio">
      <section className="pf-head">
        <div>
          <div className="eyebrow">
            Wallet · <a href={`https://etherscan.io/address/${wallet.address}`} target="_blank" rel="noreferrer noopener" style={{color:"inherit"}}>{shortAddr}</a>
          </div>
          <h1 className="f-display" style={{fontSize:"clamp(48px,7vw,108px)", lineHeight:0.98, letterSpacing:"-0.025em", margin:"12px 0 8px"}}>
            Portfolio
          </h1>
          <div className="f-mono" style={{fontSize:13, color:"var(--fg-3)"}}>
            {loadingBalances ? "Reading on-chain balances…" :
              `${(positions||[]).length} country positions · ${(playerPositions||[]).length} player positions`}
          </div>
        </div>
        <div className="pf-head-stats">
          <PFHeroStat label="Total GOAL-denominated value" value={totalValue.toFixed(2)} unit="GOAL" big/>
          <PFHeroStat label="GOAL balance" value={goalBal.toLocaleString(undefined,{maximumFractionDigits:4})} unit="GOAL"/>
          <PFHeroStat label="ETH balance"  value={ethBal.toFixed(4)} unit="ETH"/>
          <PFHeroStat label="GOAL burned to date" value={burned.toLocaleString()} unit="GOAL · cap 960k" color="var(--fire)"/>
        </div>
      </section>

      <section className="pf-section">
        <div className="section-eyebrow">
          <span className="bracket-num">01</span>
          <span className="eyebrow">GOAL · base asset</span>
          <div className="hairline"/>
        </div>
        <div className="pf-match-card">
          <div>
            <div className="eyebrow">Balance</div>
            <div className="f-display numeric" style={{fontSize:64, lineHeight:1}}>{goalBal.toLocaleString(undefined,{maximumFractionDigits:4})}</div>
          </div>
          <div className="pf-match-buttons">
            <a className="btn" href={`https://etherscan.io/token/${window.GOAL_CONFIG.goal}?a=${wallet.address}`} target="_blank" rel="noreferrer noopener">Etherscan</a>
            <button className="btn btn-primary" onClick={()=>setRoute({name:"pack"})}>Open Packs →</button>
          </div>
        </div>
      </section>

      <section className="pf-section">
        <div className="section-eyebrow">
          <span className="bracket-num">02</span>
          <span className="eyebrow">Country positions · {(positions||[]).length}</span>
          <div className="hairline"/>
        </div>
        {positions === null && <div className="f-mono" style={{padding:24, color:"var(--fg-3)"}}>Reading…</div>}
        {positions && positions.length === 0 && (
          <div className="f-mono" style={{padding:24, color:"var(--fg-3)"}}>No country tokens yet — open a pack to get started.</div>
        )}
        {positions && positions.length > 0 && (
          <div className="pf-table">
            <div className="pf-table-head f-mono">
              <span style={{flex:"0 0 70px"}}></span>
              <span style={{flex:"1 0 180px"}}>Token</span>
              <span style={{flex:"0 0 120px", textAlign:"right"}}>Amount</span>
              <span style={{flex:"0 0 120px", textAlign:"right"}}>Price</span>
              <span style={{flex:"0 0 140px", textAlign:"right"}}>Value</span>
              <span style={{flex:"0 0 200px", textAlign:"right"}}></span>
            </div>
            {positions.map(p => (
              <div key={p.c} className="pf-table-row">
                <span style={{flex:"0 0 70px"}}><Flag country={p.country} w={48} h={32}/></span>
                <span style={{flex:"1 0 180px"}}>
                  <div className="f-display" style={{fontSize:20, lineHeight:1}}>{p.country.name}</div>
                  <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)", marginTop:2}}>[{p.c}]</div>
                </span>
                <span style={{flex:"0 0 120px", textAlign:"right"}} className="f-mono numeric">{p.amount.toLocaleString(undefined,{maximumFractionDigits:4})}</span>
                <span style={{flex:"0 0 120px", textAlign:"right"}} className="f-mono numeric">{p.curveOpen ? p.price.toFixed(3) : "—"}</span>
                <span style={{flex:"0 0 140px", textAlign:"right", color:"var(--fg)"}} className="f-mono numeric">{p.curveOpen ? p.value.toFixed(2) + " G" : "—"}</span>
                <span style={{flex:"0 0 200px", display:"flex", justifyContent:"flex-end", gap:6}}>
                  <button className="pf-mini-btn" onClick={()=>setRoute({name: p.curveOpen ? "market" : "packCountry", country:p.c})}>
                    {p.curveOpen ? "Trade →" : "View →"}
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="pf-section">
        <div className="section-eyebrow">
          <span className="bracket-num">03</span>
          <span className="eyebrow">Player positions · {(playerPositions||[]).length}</span>
          <div className="hairline"/>
        </div>
        {playerPositions === null && <div className="f-mono" style={{padding:24, color:"var(--fg-3)"}}>Reading…</div>}
        {playerPositions && playerPositions.length === 0 && (
          <div className="f-mono" style={{padding:24, color:"var(--fg-3)"}}>No player tokens yet — open country packs to unlock player draws.</div>
        )}
        {playerPositions && playerPositions.length > 0 && (
          <div className="pf-players-grid">
            {playerPositions.map((p, i) => {
              const role = PLAYER_ROLES[p.role];
              const num = p.role === "CPT" ? 10 : p.role === "BST" ? 9 : 23;
              return (
                <div key={i} className="pf-player-card">
                  <div className="pf-player-jersey">
                    <Jersey country={p.country} role={p.role} number={num} w={88} h={98}/>
                  </div>
                  <div className="pf-player-meta">
                    <Flag country={p.country} w={24} h={16}/>
                    <span className={"pp-recent-badge badge-" + p.role}>{p.role}</span>
                    <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>{role.rarity}</div>
                  </div>
                  <div className="f-display" style={{fontSize:22, lineHeight:1, margin:"8px 0 4px"}}>{p.country.name}</div>
                  <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>{role.label} · #{num}</div>
                  <div className="pf-player-bot">
                    <div>
                      <div className="eyebrow">Holding</div>
                      <div className="f-display numeric" style={{fontSize:24, lineHeight:1}}>{p.amount.toLocaleString(undefined,{maximumFractionDigits:4})}</div>
                    </div>
                    <button className="pf-mini-btn" onClick={()=>setRoute({name:"playerMarket", id: `${p.c}-${p.role}`})}>View →</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer setRoute={setRoute}/>
    </main>
  );
};

const PFHeroStat = ({ label, value, unit, big, color }) => (
  <div className="pf-hero-stat">
    <div className="eyebrow">{label}</div>
    <div style={{display:"flex", alignItems:"baseline", gap:8, marginTop:6}}>
      <span className={"f-display numeric"} style={{
        fontSize: big ? 48 : 32,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        color: color || "var(--fg)",
      }}>{value}</span>
      <span className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>{unit}</span>
    </div>
  </div>
);

window.Portfolio = Portfolio;
