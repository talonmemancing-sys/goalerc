// FOOTBALL — Portfolio: real on-chain balances for the connected wallet.
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
          <div className="eyebrow" style={{marginBottom:16}}>{L("资产组合", "Portfolio")}</div>
          <h1 className="f-display" style={{fontSize:64, lineHeight:1, margin:"0 0 24px", letterSpacing:"-0.025em"}}>
            {L("连接你的钱包", "Connect Your Wallet")}
          </h1>
          <p style={{color:"var(--fg-3)", maxWidth:520, margin:"0 auto", lineHeight:1.6}}>
            {L("你的资产组合实时读取自 BSC — 连接后即可查看你真实的 FOOTBALL、国家代币和球员代币余额。",
               "Your portfolio reads live from BSC — connect to see your real FOOTBALL, country token and player token balances.")}
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
            {L("钱包", "Wallet")} · <a href={`https://bscscan.com/address/${wallet.address}`} target="_blank" rel="noreferrer noopener" style={{color:"inherit"}}>{shortAddr}</a>
          </div>
          <h1 className="f-display" style={{fontSize:"clamp(48px,7vw,108px)", lineHeight:0.98, letterSpacing:"-0.025em", margin:"12px 0 8px"}}>
            {L("资产组合", "Portfolio")}
          </h1>
          <div className="f-mono" style={{fontSize:13, color:"var(--fg-3)"}}>
            {loadingBalances ? L("读取链上余额中…", "Reading on-chain balances…") :
              L(`${(positions||[]).length} 个国家持仓 · ${(playerPositions||[]).length} 个球员持仓`,
                `${(positions||[]).length} country positions · ${(playerPositions||[]).length} player positions`)}
          </div>
        </div>
        <div className="pf-head-stats">
          <PFHeroStat label={L("以 FOOTBALL 计价总值", "Total Value in FOOTBALL")} value={totalValue.toFixed(2)} unit="FOOTBALL" big/>
          <PFHeroStat label={L("FOOTBALL 余额", "FOOTBALL Balance")} value={goalBal.toLocaleString(undefined,{maximumFractionDigits:4})} unit="FOOTBALL"/>
          <PFHeroStat label={L("BNB 余额", "BNB Balance")}  value={ethBal.toFixed(4)} unit="BNB"/>
          <PFHeroStat label={L("累计已销毁 FOOTBALL", "Total FOOTBALL Burned")} value={burned.toLocaleString()} unit="FOOTBALL" color="var(--fire)"/>
        </div>
      </section>

      <section className="pf-section">
        <div className="section-eyebrow">
          <span className="bracket-num">01</span>
          <span className="eyebrow">{L("FOOTBALL · 基础资产", "FOOTBALL · Base Asset")}</span>
          <div className="hairline"/>
        </div>
        <div className="pf-match-card">
          <div>
            <div className="eyebrow">{L("余额", "Balance")}</div>
            <div className="f-display numeric" style={{fontSize:64, lineHeight:1}}>{goalBal.toLocaleString(undefined,{maximumFractionDigits:4})}</div>
          </div>
          <div className="pf-match-buttons">
            <a className="btn" href={`https://bscscan.com/token/${window.FOOTBALL_CONFIG.football}?a=${wallet.address}`} target="_blank" rel="noreferrer noopener">BscScan</a>
            <button className="btn btn-primary" onClick={()=>setRoute({name:"pack"})}>{L("开包 →", "Open Pack →")}</button>
          </div>
        </div>
      </section>

      <section className="pf-section">
        <div className="section-eyebrow">
          <span className="bracket-num">02</span>
          <span className="eyebrow">{L("金库分红 · 买包人专属", "Treasury Dividends · Pack Buyers Only")}</span>
          <div className="hairline"/>
        </div>
        <DividendPanel wallet={wallet} chain={chain}/>
      </section>

      <section className="pf-section">
        <div className="section-eyebrow">
          <span className="bracket-num">03</span>
          <span className="eyebrow">{L("国家持仓", "Country Positions")} · {(positions||[]).length}</span>
          <div className="hairline"/>
        </div>
        {positions === null && <div className="f-mono" style={{padding:24, color:"var(--fg-3)"}}>{L("读取中…", "Loading…")}</div>}
        {positions && positions.length === 0 && (
          <div className="f-mono" style={{padding:24, color:"var(--fg-3)"}}>{L("暂无国家代币 — 开一包即可开始。", "No country tokens yet — open a pack to get started.")}</div>
        )}
        {positions && positions.length > 0 && (
          <div className="pf-table">
            <div className="pf-table-head f-mono">
              <span style={{flex:"0 0 70px"}}></span>
              <span style={{flex:"1 0 180px"}}>{L("代币", "Token")}</span>
              <span style={{flex:"0 0 120px", textAlign:"right"}}>{L("数量", "Amount")}</span>
              <span style={{flex:"0 0 120px", textAlign:"right"}}>{L("价格", "Price")}</span>
              <span style={{flex:"0 0 140px", textAlign:"right"}}>{L("价值", "Value")}</span>
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
                    {p.curveOpen ? L("交易 →", "Trade →") : L("查看 →", "View →")}
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="pf-section">
        <div className="section-eyebrow">
          <span className="bracket-num">04</span>
          <span className="eyebrow">{L("球员持仓", "Player Positions")} · {(playerPositions||[]).length}</span>
          <div className="hairline"/>
        </div>
        {playerPositions === null && <div className="f-mono" style={{padding:24, color:"var(--fg-3)"}}>{L("读取中…", "Loading…")}</div>}
        {playerPositions && playerPositions.length === 0 && (
          <div className="f-mono" style={{padding:24, color:"var(--fg-3)"}}>{L("暂无球员代币 — 开国家包即可解锁球员抽取。", "No player tokens yet — open country packs to unlock player draws.")}</div>
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
                    <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>{({Wide:L("普通","Common"),Rare:L("稀有","Rare"),Common:L("常见","Common")}[role.rarity]||role.rarity)}</div>
                  </div>
                  <div className="f-display" style={{fontSize:22, lineHeight:1, margin:"8px 0 4px"}}>{p.country.name}</div>
                  <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>{role.label} · #{num}</div>
                  <div className="pf-player-bot">
                    <div>
                      <div className="eyebrow">{L("持有", "Holding")}</div>
                      <div className="f-display numeric" style={{fontSize:24, lineHeight:1}}>{p.amount.toLocaleString(undefined,{maximumFractionDigits:4})}</div>
                    </div>
                    <button className="pf-mini-btn" onClick={()=>setRoute({name:"playerMarket", id: `${p.c}-${p.role}`})}>{L("查看 →", "View →")}</button>
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

/* ===== 金库分红面板 ===== */
const DivStat = ({ label, value, unit, int }) => (
  <div style={{flex:"1 1 130px"}}>
    <div className="eyebrow">{label}</div>
    <div className="f-display numeric" style={{fontSize:24, lineHeight:1, marginTop:4}}>
      {value === undefined || value === null ? "…" :
        int ? value.toLocaleString() : value.toLocaleString(undefined,{maximumFractionDigits:4})}
    </div>
    <div className="f-mono" style={{fontSize:10, color:"var(--fg-3)"}}>{unit}</div>
  </div>
);

const DividendPanel = ({ wallet, chain }) => {
  const [stats, setStats] = React.useState(null);
  const [claiming, setClaiming] = React.useState("idle");
  const [distributing, setDistributing] = React.useState("idle");
  const [msg, setMsg] = React.useState(null);

  const load = React.useCallback(async () => {
    if (!window.TX?.getTreasuryStats) return;
    const s = await window.TX.getTreasuryStats(wallet.address);
    if (s) setStats(s);
  }, [wallet.address]);

  React.useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load, chain.lastUpdate]);

  const handleClaim = async () => {
    setMsg(null);
    try {
      await window.TX.claimDividend((step) => {
        if (step === "sending") setClaiming("sending");
        else if (step === "mining") setClaiming("mining");
        else if (step === "done") setClaiming("done");
      });
      await load();
      window.WALLET?.refreshBalances?.();
      setTimeout(() => setClaiming("idle"), 4000);
    } catch (e) {
      setClaiming("error");
      setMsg(e?.shortMessage || e?.reason || e?.message || L("领取失败", "Claim failed"));
    }
  };

  const handleDistribute = async () => {
    setMsg(null);
    try {
      await window.TX.distributeTreasury((step) => {
        if (step === "sending") setDistributing("sending");
        else if (step === "mining") setDistributing("mining");
        else if (step === "done") setDistributing("done");
      });
      await load();
      setTimeout(() => setDistributing("idle"), 4000);
    } catch (e) {
      setDistributing("error");
      setMsg(e?.shortMessage || e?.reason || e?.message || L("结算失败", "Settle failed"));
    }
  };

  const packs = stats?.packsBought ?? 0;
  const totalPacks = stats?.totalPacks ?? 0;
  const share = totalPacks > 0 ? (packs / totalPacks * 100) : 0;
  const claimable = stats?.claimable ?? 0;
  const claimBusy = claiming === "sending" || claiming === "mining";
  const distBusy = distributing === "sending" || distributing === "mining";

  return (
    <div style={{border:"1px solid var(--line)", background:"var(--bg-1)", padding:"28px 24px"}}>
      <div style={{display:"flex", flexWrap:"wrap", gap:24, justifyContent:"space-between", alignItems:"flex-end"}}>
        <div>
          <div className="eyebrow">{L("你的可领分红", "Your Claimable Dividends")}</div>
          <div className="f-display numeric" style={{fontSize:56, lineHeight:1, color:"var(--accent)"}}>
            {stats === null ? "…" : claimable.toLocaleString(undefined,{maximumFractionDigits:6})}
          </div>
          <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)", marginTop:4}}>BNB</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div className="f-mono" style={{fontSize:12, color:"var(--fg-2)"}}>
            {L("你买了", "You bought")} <span style={{color:"var(--fg)"}}>{packs.toLocaleString()}</span> {L("包 · 占全网", "packs · ")}<span style={{color:"var(--fg)"}}>{share.toFixed(2)}%</span>{L("", " of all packs")}
          </div>
          <button className="btn btn-primary" style={{marginTop:10}} onClick={handleClaim}
                  disabled={claimBusy || claimable <= 0}>
            {claiming === "sending" ? L("请在钱包确认…", "Confirm in wallet…") :
             claiming === "mining" ? L("领取中…", "Claiming…") :
             claiming === "done" ? L("✓ 已领取", "✓ Claimed") :
             claimable > 0 ? L(`领取 ${claimable.toFixed(4)} BNB`, `Claim ${claimable.toFixed(4)} BNB`) : L("暂无可领分红", "No dividends to claim")}
          </button>
        </div>
      </div>

      <div style={{display:"flex", flexWrap:"wrap", gap:16, marginTop:24, paddingTop:20, borderTop:"1px solid var(--line)"}}>
        <DivStat label={L("分红池", "Dividend Pool")} value={stats?.dividendPoolBnb} unit="BNB"/>
        <DivStat label={L("冠军回购储备", "Champion Buyback Reserve")} value={stats?.championReserveBnb} unit="BNB"/>
        <DivStat label={L("待结算税收", "Pending Tax")} value={stats?.undistributed} unit="BNB"/>
        <DivStat label={L("全网累计买包", "Total Packs Bought")} value={totalPacks} unit={L("包", "packs")} int/>
      </div>

      <div style={{display:"flex", alignItems:"center", gap:12, marginTop:18, flexWrap:"wrap"}}>
        <button className="btn" onClick={handleDistribute}
                disabled={distBusy || (stats?.undistributed || 0) <= 0}>
          {distributing === "sending" ? L("请在钱包确认…", "Confirm in wallet…") :
           distributing === "mining" ? L("结算中…", "Settling…") :
           distributing === "done" ? L("✓ 已结算", "✓ Settled") :
           L("结算金库", "Settle Treasury")}
        </button>
        <span className="f-mono" style={{fontSize:11, color:"var(--fg-3)", maxWidth:440, lineHeight:1.5}}>
          {L("税收入需先「结算」才会拆进分红池 —— 任何人都能调用，把待结算 BNB 按买包数量分给全体买包人。",
             "Tax revenue must be settled before it splits into the dividend pool — anyone can call it to distribute pending BNB to all pack buyers by pack count.")}
        </span>
      </div>

      {msg && <div className="f-mono" style={{color:"var(--fire)", fontSize:11, marginTop:12}}>{msg}</div>}
    </div>
  );
};

window.Portfolio = Portfolio;
