// FOOTBALL — Player markets pages (gallery + single player detail)

// Maps the data-layer rarity tier to a Chinese label for display.
const rarityZhP = (r) => ({ Wide: "普通", Rare: "稀有", Common: "常见" }[r] || r);
const { useState: usePlState, useMemo: usePlMemo, useEffect: usePlEffect } = React;

/* ============== Helper: build all 144 players from real chain state ============== */
const allPlayers = () => {
  const out = [];
  const cs = (window.CHAIN && window.CHAIN.state && window.CHAIN.state.players) || {};
  for (const c of COUNTRIES) {
    for (const role of ["BST", "CPT", "RKE"]) {
      const r = PLAYER_ROLES[role];
      const key = `${c.id}-${role}`;
      const ps = cs[key] || { supply: 0, reserve: 0, curveOpen: false, price: PACK_PRICE, max: r.max };
      const name = window.playerName ? window.playerName(c.id, role) : `${c.id} ${role}`;
      const num = role === "CPT" ? 10 : role === "BST" ? 9 : 23;
      out.push({
        id: key,
        country: c,
        role,
        roleData: r,
        name,
        number: num,
        supply: Math.floor(ps.supply),
        price: Number(ps.price || PACK_PRICE),
        reserve: ps.reserve,
        curveOpen: ps.curveOpen,
        burned: 0,           // per-curve burn requires event indexer
        ch24: 0,             // 24h change requires price history indexer
        tokenAddr: ps.tokenAddr,
        curveAddr: ps.curveAddr,
      });
    }
  }
  return out;
};

/* ============== Players Gallery ============== */
const PlayersMarket = ({ setRoute }) => {
  const chain = (window.useChain ? window.useChain() : { lastUpdate: 0 });
  const players = usePlMemo(() => allPlayers(), [chain.lastUpdate]);
  const [filter, setFilter] = usePlState("ALL");
  const [conf, setConf]     = usePlState("ALL");
  const [sort, setSort]     = usePlState("price");

  let list = players;
  if (filter !== "ALL") list = list.filter(p => p.role === filter);
  if (conf !== "ALL")   list = list.filter(p => p.country.conf === conf);
  if (sort === "price") list = [...list].sort((a,b) => b.price - a.price);
  if (sort === "ch")    list = [...list].sort((a,b) => b.ch24 - a.ch24);
  if (sort === "burn")  list = [...list].sort((a,b) => b.burned - a.burned);
  if (sort === "scarcity") list = [...list].sort((a,b) => (b.supply / b.roleData.max) - (a.supply / a.roleData.max));

  const confs = ["ALL", "UEFA", "CONMEBOL", "AFC", "CAF", "CONCACAF", "OFC"];
  const roles = [
    { id: "ALL", label: "全部", count: 144 },
    { id: "BST", label: "巨星", count: 48, color: "var(--rare-best)" },
    { id: "CPT", label: "队长", count: 48, color: "var(--rare-captain)" },
    { id: "RKE", label: "新星", count: 48, color: "var(--rare-rookie)" },
  ];

  return (
    <main className="match-page players-page">
      <section className="players-hero">
        <div>
          <div className="eyebrow">球员 · 144 条曲线</div>
          <h1 className="f-display" style={{fontSize:"clamp(44px,6vw,92px)", lineHeight:0.98, letterSpacing:"-0.045em", margin:"12px 0 8px", fontWeight:600}}>
            144 名球员。
            <br/>
            <span style={{color:"var(--rare-best)", fontWeight:300}}>同一颗球，背书所有。</span>
          </h1>
          <p style={{maxWidth:560, color:"var(--fg-2)", fontSize:17, lineHeight:1.55}}>
            每国三个角色。50 巨星（最稀有）、150 队长、250 新星 — 总量固定、
            曲线不可篡改、以 FOOTBALL 计价。
          </p>
        </div>
        <div className="players-hero-stats">
          <div className="player-tier-stat tier-BST">
            <div className="player-tier-stat-num">48</div>
            <div className="player-tier-stat-label">巨星 · 每个 500</div>
          </div>
          <div className="player-tier-stat tier-CPT">
            <div className="player-tier-stat-num">48</div>
            <div className="player-tier-stat-label">队长 · 每个 1,500</div>
          </div>
          <div className="player-tier-stat tier-RKE">
            <div className="player-tier-stat-num">48</div>
            <div className="player-tier-stat-label">新星 · 每个 2,500</div>
          </div>
        </div>
      </section>

      <section className="players-filters">
        <div className="players-filter-group">
          {roles.map(r => (
            <button key={r.id} className={"players-role-chip " + (filter === r.id ? "is-active is-"+r.id : "")}
                    onClick={() => setFilter(r.id)}>
              {r.color && <span className="players-role-dot" style={{background:r.color}}/>}
              {r.label}
              <span className="players-role-count">{filter === "ALL" || filter === r.id ? r.count : ""}</span>
            </button>
          ))}
        </div>
        <div className="players-filter-group">
          {confs.map(c => (
            <button key={c} className={"filter-chip " + (conf === c ? "is-active" : "")}
                    onClick={() => setConf(c)}>{c}</button>
          ))}
        </div>
        <div className="players-sort">
          <span className="eyebrow">排序</span>
          {[
            {id: "price", label: "价格"},
            {id: "ch", label: "24小时"},
            {id: "burn", label: "销毁量"},
            {id: "scarcity", label: "稀缺度"},
          ].map(s => (
            <button key={s.id} className={"markets-sort-btn " + (sort === s.id ? "is-active" : "")}
                    onClick={() => setSort(s.id)}>{s.label}</button>
          ))}
        </div>
      </section>

      <section className="players-grid">
        {list.map(p => (
          <PlayerCard key={p.id} p={p} onClick={() => setRoute({name: "playerMarket", id: p.id})}/>
        ))}
      </section>

      <Footer setRoute={setRoute}/>
    </main>
  );
};

const PlayerCard = ({ p, onClick }) => {
  const scarcity = (p.supply / p.roleData.max) * 100;
  const up = p.ch24 >= 0;
  return (
    <button className={"player-card tier-" + p.role} onClick={onClick}>
      <div className="player-card-bg"/>
      <div className="player-card-head">
        <Flag country={p.country} w={28} h={20}/>
        <span className={"player-card-badge badge-" + p.role}>{p.role}</span>
        <span className="player-card-number f-display">#{p.number}</span>
      </div>
      <div className="player-card-jersey">
        <Jersey country={p.country} role={p.role} number={p.number} w={86} h={96}/>
      </div>
      <div className="player-card-body">
        <div className="f-display player-card-name">{p.name}</div>
        <div className="f-mono player-card-sub">{p.country.name} · {p.roleData.label}</div>
      </div>
      <div className="player-card-stats">
        <div className="player-card-stat">
          <span className="eyebrow">价格</span>
          <span className="f-display numeric player-card-stat-v">{p.price.toFixed(2)}</span>
          <span className="f-mono player-card-stat-u">FB</span>
        </div>
        <div className="player-card-stat is-right">
          <span className="eyebrow">24小时</span>
          <span className={"f-mono player-card-ch " + (up ? "is-up" : "is-down")}>
            {up ? "▲" : "▼"} {(Math.abs(p.ch24) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="player-card-scarcity">
        <div className="player-card-scarcity-row">
          <span className="f-mono" style={{fontSize:10, color:"var(--fg-3)", letterSpacing:"0.04em"}}>供应量 / 渐近线</span>
          <span className="f-mono numeric" style={{fontSize:11, color:"var(--fg-2)"}}>
            {p.supply.toLocaleString()} / {p.roleData.max.toLocaleString()}
          </span>
        </div>
        <div className="player-card-scarcity-bar">
          <div className={"player-card-scarcity-fill tier-fill-" + p.role}
               style={{width: `${scarcity}%`}}/>
        </div>
      </div>
    </button>
  );
};

/* ============== Single Player Detail ============== */
const PlayerMarketDetail = ({ setRoute, id, burned, setBurned }) => {
  const [countryId, role] = (id || "ARG-BST").split("-");
  const country = COUNTRIES.find(c => c.id === countryId) || COUNTRIES[0];
  const r = PLAYER_ROLES[role] || PLAYER_ROLES.BST;
  const name = window.playerName ? window.playerName(country.id, role) : `${country.id} ${role}`;
  const number = role === "CPT" ? 10 : role === "BST" ? 9 : 23;

  const chain = (window.useChain ? window.useChain() : { players: {} });
  const wallet = (window.WALLET ? window.WALLET.state : { connected: false, goalBalance: 0 });
  const [walletTick, setWalletTick] = usePlState(0);
  usePlEffect(() => window.WALLET ? window.WALLET.subscribe(() => setWalletTick(t => t + 1)) : undefined, []);

  const ps = (chain.players && chain.players[`${country.id}-${role}`]) || { supply: 0, reserve: 0, curveOpen: false, price: PACK_PRICE, max: r.max, tokenAddr: null, curveAddr: null };
  const supply = Math.floor(ps.supply || 0);
  const price = Number(ps.price || PACK_PRICE);
  const reservePool = ps.reserve || 0;
  const scarcity = ps.max ? (supply / ps.max) * 100 : 0;

  const [mode, setMode] = usePlState("buy");
  const [amount, setAmount] = usePlState(50);
  const [slippageBps, setSlippageBps] = usePlState(100);
  const [txState, setTxState] = usePlState("idle");
  const [txHash, setTxHash] = usePlState(null);
  const [errMsg, setErrMsg] = usePlState(null);
  const [quoteOut, setQuoteOut] = usePlState(null);
  const [tokenBal, setTokenBal] = usePlState(null);
  const feeBurn = (amount * 0.05).toFixed(3);

  usePlEffect(() => {
    let cancel = false;
    setQuoteOut(null);
    if (!ps.curveAddr || !ps.curveOpen || !amount || amount <= 0) return;
    const t = setTimeout(async () => {
      try {
        const amtWei = ethers.parseEther(String(amount));
        const q = mode === "buy"
          ? await window.TX.quoteBuy(ps.curveAddr, amtWei)
          : await window.TX.quoteSell(ps.curveAddr, amtWei);
        if (!cancel && q !== null) setQuoteOut(Number(ethers.formatEther(q)));
      } catch {}
    }, 350);
    return () => { cancel = true; clearTimeout(t); };
  }, [amount, mode, ps.curveAddr, ps.curveOpen]);

  usePlEffect(() => {
    let cancel = false;
    async function load() {
      if (!wallet.connected || !ps.tokenAddr || !window.CHAIN?._provider) { setTokenBal(null); return; }
      try {
        const t = new ethers.Contract(ps.tokenAddr, ["function balanceOf(address) view returns (uint256)"], window.CHAIN._provider);
        const b = await t.balanceOf(wallet.address);
        if (!cancel) setTokenBal(Number(ethers.formatEther(b)));
      } catch {}
    }
    load();
    const id = setInterval(load, 20_000);
    return () => { cancel = true; clearInterval(id); };
  }, [wallet.connected, wallet.address, ps.tokenAddr, txState]);

  const tokenOut = quoteOut !== null ? quoteOut : 0;
  const balToShow = mode === "buy" ? wallet.goalBalance : tokenBal;
  const pending = txState === "approving" || txState === "sending" || txState === "mining";

  const handleTrade = async () => {
    if (!wallet.connected) { alert("请先连接钱包。"); return; }
    if (!ps.curveOpen) { alert("球员曲线尚未激活 — 需先封盘对应的国家窗口。"); return; }
    if (!ps.curveAddr || !ps.tokenAddr) { alert("球员曲线尚未部署。"); return; }
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
        await window.TX.curveBuy(ps.curveAddr, amtWei, slippageBps, onStep);
      } else {
        await window.TX.curveSell(ps.curveAddr, ps.tokenAddr, amtWei, slippageBps, onStep);
      }
      window.WALLET.refreshBalances();
      window.CHAIN.refresh();
      setTimeout(() => setTxState("idle"), 4000);
    } catch (e) {
      console.error(e);
      setTxState("error");
      setErrMsg(e?.shortMessage || e?.reason || e?.message || "交易失败");
    }
  };

  return (
    <main className={"match-page player-detail tier-" + role}>
      <section className="pd-head">
        <button className="pc-back" onClick={()=>setRoute({name:"players"})}>← 球员</button>
        <div className="pd-head-grid">
          <div className="pd-jersey-wrap">
            <div className={"pd-jersey-glow tier-glow-" + role}/>
            <Jersey country={country} role={role} number={number} w={220} h={250}/>
          </div>
          <div className="pd-head-meta">
            <div className="pd-tier-row">
              <Flag country={country} w={36} h={24}/>
              <span className={"player-card-badge badge-" + role} style={{fontSize:12, padding:"4px 10px"}}>{role}</span>
              <span className={"pd-rarity-pill tier-pill-" + role}>{rarityZhP(r.rarity)}</span>
            </div>
            <h1 className={"f-display pd-name tier-name-" + role}>{name}</h1>
            <div className="pd-sub">
              <span style={{color:"var(--fg)"}}>{country.name}</span>
              <span className="pd-sep">·</span>
              <span>{r.label}</span>
              <span className="pd-sep">·</span>
              <span>#{number}</span>
            </div>

            <div className="pd-stats">
              <div className="pd-stat">
                <div className="eyebrow">价格</div>
                <div className="f-display numeric pd-stat-big">{price.toFixed(3)}</div>
                <div className="f-mono pd-stat-unit">FOOTBALL</div>
              </div>
              <div className="pd-stat">
                <div className="eyebrow">供应量</div>
                <div className="f-display numeric pd-stat-big">{supply.toLocaleString()}</div>
                <div className="f-mono pd-stat-unit">共 {r.max.toLocaleString()}</div>
              </div>
              <div className="pd-stat">
                <div className="eyebrow">已销毁</div>
                <div className="f-display numeric pd-stat-big" style={{color:"var(--fire)"}}>—</div>
                <div className="f-mono pd-stat-unit">索引器待接入</div>
              </div>
              <div className="pd-stat">
                <div className="eyebrow">储备</div>
                <div className="f-display numeric pd-stat-big">{Math.round(reservePool).toLocaleString()}</div>
                <div className="f-mono pd-stat-unit">FOOTBALL</div>
              </div>
            </div>

            <div className="pd-scarcity">
              <div className="pd-scarcity-row">
                <span className="eyebrow">稀缺度 · 距渐近线 {scarcity.toFixed(1)}%</span>
                <span className="f-mono" style={{fontSize:11, color: scarcity > 80 ? "var(--fire)" : "var(--fg-3)"}}>
                  {scarcity > 80 ? "⚠ 抛物线区" : "安全区"}
                </span>
              </div>
              <div className="pd-scarcity-bar">
                <div className={"pd-scarcity-fill tier-fill-" + role} style={{width: `${scarcity}%`}}/>
                <div className="pd-scarcity-asymptote" style={{left: "100%"}}/>
              </div>
            </div>
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
              <span className="eyebrow">虚拟储备</span>
              <span className="f-mono" style={{fontSize:11, color: r.color}}>{r.max.toLocaleString()}</span>
            </div>
          </div>
          <CurveKLine
            curveAddr={ps.curveAddr}
            currentPrice={price}
            currentSupply={supply}
            max={r.max}
            curveOpen={ps.curveOpen}
            symbol={`${country.id}.${role}`}
          />

          <TransferLogFeed
            tokenAddr={ps.tokenAddr}
            symbol={`${country.id}.${role}`}
            heading="近期转账"
          />
        </div>

        <div className="md-trade">
          <div className="md-trade-tabs">
            <button className={"md-trade-tab " + (mode==="buy" ? "is-active is-buy" : "")} onClick={()=>setMode("buy")}>买入</button>
            <button className={"md-trade-tab " + (mode==="sell" ? "is-active is-sell" : "")} onClick={()=>setMode("sell")}>卖出</button>
          </div>

          <div className="md-trade-body">
            <div className="md-input">
              <div className="md-input-head">
                <span className="eyebrow">{mode==="buy" ? "你支付" : "你卖出"}</span>
                <span className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>
                  余额：{wallet.connected
                    ? (balToShow !== null ? balToShow.toLocaleString(undefined,{maximumFractionDigits:4}) : "…")
                    : "—"} {mode==="buy" ? "FOOTBALL" : `${country.id}.${role}`}
                </span>
              </div>
              <div className="md-input-row">
                <input className="md-input-field f-display numeric" value={amount}
                       onChange={e => setAmount(Number(e.target.value) || 0)} type="number"/>
                <div className="md-input-token">
                  <div className="md-input-token-tag f-mono">{mode==="buy" ? "FOOTBALL" : `${country.id}.${role}`}</div>
                </div>
              </div>
              <div className="md-input-presets">
                {[25, 50, 75].map(p => (
                  <button key={p} className="md-preset" onClick={() => balToShow && setAmount(Number((balToShow * p/100).toFixed(4)))}>{p}%</button>
                ))}
                <button className="md-preset" onClick={() => balToShow && setAmount(Number(balToShow.toFixed(4)))}>最大</button>
              </div>
            </div>

            <div className="md-swap-arrow">↓</div>

            <div className="md-input">
              <div className="md-input-head">
                <span className="eyebrow">你获得（预估）</span>
                <span className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>扣除 5% 曲线手续费 → 销毁</span>
              </div>
              <div className="md-input-row">
                <div className="md-input-field f-display-it numeric" style={{color: r.color}}>
                  {quoteOut !== null ? quoteOut.toLocaleString(undefined,{maximumFractionDigits:4}) : "—"}
                </div>
                <div className="md-input-token">
                  <div className="md-input-token-tag f-mono">{mode==="buy" ? `${country.id}.${role}` : "FOOTBALL"}</div>
                </div>
              </div>
            </div>

            <div className="md-rate">
              <div className="md-rate-row"><span className="eyebrow">汇率</span><span className="f-mono">1 {country.id}.{role} = {price.toFixed(3)} FOOTBALL</span></div>
              <div className="md-rate-row">
                <span className="eyebrow">滑点</span>
                <span style={{display:"flex", gap:4}}>
                  {[[10,"0.1%"],[50,"0.5%"],[100,"1%"],[200,"2%"]].map(([bps, lbl]) => (
                    <button key={bps} onClick={()=>setSlippageBps(bps)} className="f-mono"
                            style={{fontSize:11, padding:"2px 6px", borderRadius:4,
                                    background: slippageBps===bps ? "var(--accent)":"transparent",
                                    color: slippageBps===bps ? "var(--bg)":"var(--fg-2)",
                                    border:"1px solid var(--line)", cursor:"pointer"}}>
                      {lbl}
                    </button>
                  ))}
                </span>
              </div>
              <div className="md-rate-row"><span className="eyebrow">曲线手续费</span><span className="f-mono" style={{color:"var(--fire)"}}>5% → 销毁</span></div>
              <div className="md-rate-row" style={{paddingTop:10, borderTop:"1px solid var(--line)"}}>
                <span className="f-mono" style={{fontSize:12, color:"var(--fg-2)"}}>净销毁</span>
                <span className="f-mono numeric" style={{fontSize:13, color:"var(--fire)"}}>−{feeBurn} {mode==="buy" ? "FOOTBALL" : country.id+"."+role}</span>
              </div>
            </div>

            <button className={"btn md-trade-cta " + (mode==="buy" ? "btn-primary" : "btn-fire")}
                    onClick={handleTrade} disabled={pending || !wallet.connected || !ps.curveOpen}>
              {!wallet.connected ? "连接钱包" :
               !ps.curveOpen ? "曲线尚未激活" :
               txState === "approving" ? <><span className="pc-spin"/> 请在钱包中授权…</> :
               txState === "sending"   ? <><span className="pc-spin"/> 请在钱包中确认…</> :
               txState === "mining"    ? <><span className="pc-spin"/> 打包中…</> :
               txState === "success"   ? "✓ 已确认" :
               `${mode==="buy" ? "买入" : "卖出"} ${country.id}.${role}`}
            </button>

            {errMsg && <div className="f-mono" style={{color:"var(--fire)", fontSize:11, marginTop:8}}>{errMsg}</div>}
            <div className="md-trade-foot">
              {txHash ? (
                <a className="f-mono" style={{fontSize:10, color:"var(--fg-4)"}}
                   href={`https://bscscan.com/tx/${txHash}`} target="_blank" rel="noreferrer noopener">
                  交易: {txHash.slice(0, 14)}…（BscScan）
                </a>
              ) : (
                <span className="f-mono" style={{fontSize:10, color:"var(--fg-4)"}}>
                  曲线 · {ps.curveAddr ? `${ps.curveAddr.slice(0,8)}…${ps.curveAddr.slice(-4)}` : "未部署"}
                </span>
              )}
            </div>

            <button className="pd-go-country" onClick={() => setRoute({name:"market", country: country.id})}>
              <Flag country={country} w={20} h={14}/>
              <span>查看 {country.name} 国家曲线 →</span>
            </button>
          </div>
        </div>
      </section>

      <Footer setRoute={setRoute}/>
    </main>
  );
};

/* simple curve chart for player */
const CurveChartPlayer = ({ price, supply, max, seed }) => {
  const W = 800, H = 360, PAD = 40;
  const days = 60;
  let p = price * 0.5;
  const points = [];
  for (let i = 0; i < days; i++) {
    p += (Math.sin(seed * (i+1) * 0.4) * 0.05 + 0.012) * price * 0.5;
    p = Math.max(0.05, p);
    points.push(p);
  }
  points[points.length - 1] = price;
  const maxP = Math.max(...points) * 1.15;
  const xs = i => PAD + (i / (days-1)) * (W - 2*PAD);
  const ys = v => H - PAD - (v / maxP) * (H - 2*PAD);
  const linePath = points.map((y, i) => `${i===0?"M":"L"}${xs(i).toFixed(1)},${ys(y).toFixed(1)}`).join(" ");
  const areaPath = linePath + ` L${xs(days-1)},${H-PAD} L${xs(0)},${H-PAD} Z`;
  return (
    <svg className="md-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="playerAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.32"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0.2, 0.4, 0.6, 0.8].map(t => (
        <g key={t}>
          <line x1={PAD} y1={PAD + t*(H-2*PAD)} x2={W-PAD} y2={PAD + t*(H-2*PAD)} stroke="var(--line)" strokeDasharray="2 4"/>
          <text x={W-PAD+4} y={PAD + t*(H-2*PAD) + 3} fontSize="10" fill="var(--fg-3)" fontFamily="var(--f-mono)">{(maxP*(1-t)).toFixed(2)}</text>
        </g>
      ))}
      <path d={areaPath} fill="url(#playerAreaGrad)"/>
      <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="1.5"/>
      <circle cx={xs(days-1)} cy={ys(points[days-1])} r="5" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2"/>
      <text x={xs(days-1)-10} y={ys(points[days-1])+4} textAnchor="end" fontSize="11" fill="var(--accent)" fontFamily="var(--f-mono)">{price.toFixed(3)} FOOTBALL</text>
      <text x={PAD} y={H-12} fontSize="9" fill="var(--fg-3)" fontFamily="var(--f-mono)">供应量</text>
      <text x={W/2} y={H-12} fontSize="9" fill="var(--fg-3)" fontFamily="var(--f-mono)" textAnchor="middle">[{supply.toLocaleString()} / {max.toLocaleString()}]</text>
    </svg>
  );
};

window.PlayersMarket = PlayersMarket;
window.PlayerMarketDetail = PlayerMarketDetail;
