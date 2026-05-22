// FOOTBALL — Pack pages: overview, country detail, player reveal

// Maps the data-layer rarity tier to a Chinese label for display.
const rarityZh = (r) => ({ Wide: "普通", Rare: "稀有", Common: "常见" }[r] || r);

const Pack = ({ setRoute, packsSold, totalPacks, countdown }) => {
  const [filter, setFilter] = React.useState("OPEN");
  const filters = ["ALL", "OPEN", "SEALED", "LIVE"];

  const list = COUNTRIES.filter(c => {
    const s = countryState(c);
    if (filter === "ALL") return true;
    if (filter === "OPEN") return !s.sealed && !s.curveOpen;
    if (filter === "SEALED") return s.sealed && !s.curveOpen;
    if (filter === "LIVE") return s.curveOpen;
    return true;
  });

  return (
    <main className="match-page pack">
      <section className="pack-hero">
        <div className="pack-hero-l">
          <div className="eyebrow">阶段 I · 开包窗口</div>
          <h1 className="f-display" style={{fontSize:"clamp(44px,6vw,92px)", lineHeight:0.98, letterSpacing:"-0.045em", margin:"12px 0 24px", fontWeight:600}}>
            48 个窗口。
            <br/>
            <span style={{color:"var(--accent)", fontWeight:300}}>同一个倒计时。</span>
          </h1>
          <p style={{maxWidth:560, color:"var(--fg-2)", fontSize:17, lineHeight:1.55}}>
            开包窗口分发国家代币与球员代币的初始供应。每个国家最多 18,000 个国家包，
            每包用 FOOTBALL 购买、铸造 1 枚国家代币；窗口封盘后，该国曲线即上线交易。
            随后可用国家代币开 450 个球员包。
          </p>
        </div>
        <div className="pack-hero-r">
          <div className="pack-clock">
            <div className="eyebrow">
              {!countdown.available ? "读取开包窗口中…" :
               countdown.closed ? "开包窗口已关闭" :
               "全局窗口关闭于"}
            </div>
            <div className="pack-clock-row">
              <ClockUnit value={countdown.available ? countdown.days  : "—"} label="天"/>
              <ClockUnit value={countdown.available ? countdown.hours : "—"} label="时"/>
              <ClockUnit value={countdown.available ? countdown.mins  : "—"} label="分"/>
              <ClockUnit value={countdown.available ? countdown.secs  : "—"} label="秒"/>
            </div>
          </div>
          <div className="pack-progress">
            <div className="pack-progress-head">
              <span className="eyebrow">已售开包</span>
              <span className="f-mono" style={{fontSize:13}}>
                <span style={{color:"var(--fg)"}}>{packsSold.toLocaleString()}</span>
                <span style={{color:"var(--fg-3)"}}> / {totalPacks.toLocaleString()}</span>
              </span>
            </div>
            <div className="bar"><div className="bar-fill" style={{width:`${packsSold/totalPacks*100}%`}}/></div>
            <div className="pack-progress-foot">
              <span className="f-mono" style={{color:"var(--fg-3)", fontSize:11}}>
                已完成 {(packsSold/totalPacks*100).toFixed(1)}%
              </span>
              <span className="f-mono" style={{color:"var(--accent)", fontSize:11}}>
                {COUNTRIES.filter(c=>countryState(c).sealed).length} 国已封盘
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="pack-filters">
        <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
          {filters.map(f => (
            <button
              key={f}
              className={"filter-chip " + (filter===f ? "is-active" : "")}
              onClick={()=>setFilter(f)}
            >
              {f === "ALL" ? "全部" : f === "OPEN" ? "开包中" : f === "SEALED" ? "已封盘" : "已上线 · 开球员包"}
              <span className="filter-chip-count">
                {f === "ALL" ? 48 :
                 f === "OPEN" ? COUNTRIES.filter(c => !countryState(c).sealed && !countryState(c).curveOpen).length :
                 f === "SEALED" ? COUNTRIES.filter(c => countryState(c).sealed && !countryState(c).curveOpen).length :
                 COUNTRIES.filter(c => countryState(c).curveOpen).length}
              </span>
            </button>
          ))}
        </div>
        <div style={{marginLeft:"auto", display:"flex", gap:12, alignItems:"center"}}>
          <span className="eyebrow">排序</span>
          <span className="f-mono" style={{fontSize:12, color:"var(--fg-2)"}}>按大洲分区 ↓</span>
        </div>
      </section>

      <section className="pack-table">
        <div className="pack-table-head f-mono">
          <span style={{width:60}}></span>
          <span style={{flex:"1 0 200px"}}>国家</span>
          <span style={{flex:"0 0 100px"}}>分区</span>
          <span style={{flex:"0 0 160px"}}>状态</span>
          <span style={{flex:"1 0 220px"}}>开包进度</span>
          <span style={{flex:"0 0 110px"}}>价格 · FOOTBALL</span>
          <span style={{flex:"0 0 110px", textAlign:"right"}}></span>
        </div>
        {list.map(c => {
          const s = countryState(c);
          return (
            <button key={c.id} className="pack-table-row" onClick={() => setRoute({name: s.curveOpen ? "packPlayer" : "packCountry", country: c.id})}>
              <span style={{width:60}}><Flag country={c} w={48} h={32}/></span>
              <span style={{flex:"1 0 200px"}}>
                <div className="f-display" style={{fontSize:22, lineHeight:1}}>{c.name}</div>
                <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)", marginTop:4}}>[{c.id}]</div>
              </span>
              <span style={{flex:"0 0 100px"}} className="f-mono pack-table-conf">{c.conf}</span>
              <span style={{flex:"0 0 160px"}}>
                <span className={"country-card-status " + (s.curveOpen ? "status-live" : s.sealed ? "status-sealed" : "status-pack")}>
                  {s.curveOpen ? "曲线上线" : s.sealed ? "已封盘" : "开包中"}
                </span>
              </span>
              <span style={{flex:"1 0 220px"}}>
                <div className="pack-table-progress">
                  <div className="bar" style={{flex:1}}><div className={"bar-fill " + (s.curveOpen ? "accent" : "")} style={{width:`${(s.packsSold/PACKS_PER_COUNTRY)*100}%`}}/></div>
                  <span className="f-mono" style={{fontSize:11, width:80, textAlign:"right"}}>{(s.packsSold/1000).toFixed(1)}k/18k</span>
                </div>
              </span>
              <span style={{flex:"0 0 110px"}} className="f-mono">
                {s.curveOpen ? s.price.toFixed(2) : PACK_PRICE.toLocaleString()} <span style={{color:"var(--fg-3)"}}>FB</span>
              </span>
              <span style={{flex:"0 0 110px", textAlign:"right"}}>
                <span className="pack-table-arrow">
                  {s.curveOpen ? "开球员包 →" : "开包 →"}
                </span>
              </span>
            </button>
          );
        })}
      </section>

      <Footer setRoute={setRoute} />
    </main>
  );
};

const ClockUnit = ({ value, label }) => (
  <div className="clock-unit">
    <div className="clock-unit-value f-display numeric">{String(value).padStart(2,"0")}</div>
    <div className="clock-unit-label f-mono">{label}</div>
  </div>
);

/* =========== Pack Country — open country packs =========== */
const PackCountry = ({ setRoute, countryId, burned, setBurned }) => {
  const c = COUNTRIES.find(x => x.id === countryId) || COUNTRIES[0];
  const chain = (window.useChain ? window.useChain() : { lastUpdate: 0 });
  const wallet = (window.WALLET ? window.WALLET.state : { connected: false, goalBalance: 0 });
  const [walletTick, setWalletTick] = React.useState(0);
  React.useEffect(() => window.WALLET ? window.WALLET.subscribe(() => setWalletTick(t => t + 1)) : undefined, []);
  const s = countryState(c);

  const [packCount, setPackCount] = React.useState(1);
  const [state, setState] = React.useState("idle"); // idle | approving | sending | mining | success | error
  const [txHash, setTxHash] = React.useState(null);
  const [errMsg, setErrMsg] = React.useState(null);

  const tokensPerPack = 1; // 合约 CountryPackOpener.TOKENS_PER_PACK = 1 枚国家代币 / 包
  const pricePerPack = PACK_PRICE; // FOOTBALL 计价，按部署日 k（参考 3,850）
  const total = +(packCount * pricePerPack).toFixed(2);
  const tokensReceived = packCount * tokensPerPack;
  const burnAmount = +(packCount * PACK_BURN).toFixed(2);

  // Only treat balance as "definitely insufficient" if we've actually fetched
  // one. Before that, assume the user has enough — let the on-chain tx be the
  // source of truth. (Prevents the "Need X more FOOTBALL" lock when the RPC read
  // failed but the user actually has FOOTBALL.)
  const balanceKnown = (wallet.balanceFetchedAt || 0) > 0;
  const insufficientGoal = balanceKnown && wallet.goalBalance < total;
  const cantBuy = s.sealed || s.curveOpen;
  // Block click until this country's chain data is loaded — otherwise the tx
  // throws "Country ARG not yet loaded from chain" after the user already clicks.
  const chainReady = s && !s.unavailable && (
    (window.CHAIN?.state?.isoToContractIdx?.[c.id] !== undefined) ||
    (window.CHAIN?.state?.countries?.[c.id]?.contractIdx !== undefined)
  );

  const handleBuy = async () => {
    if (!window.WALLET?.state?.connected) {
      alert("请先连接钱包（右上角）。");
      return;
    }
    setErrMsg(null);
    setTxHash(null);
    try {
      await window.TX.buyCountryPack(c.id, packCount, (step, hash) => {
        if (step === "approving") setState("approving");
        else if (step === "sending") setState("sending");
        else if (step === "mining") { setState("mining"); if (hash) setTxHash(hash); }
        else if (step === "done") { setState("success"); if (hash) setTxHash(hash); }
      });
      // Refresh balances and chain reads
      window.WALLET.refreshBalances();
      window.CHAIN.refresh();
    } catch (e) {
      console.error(e);
      setState("error");
      setErrMsg(e?.shortMessage || e?.reason || e?.message || "交易失败");
    }
  };

  return (
    <main className="match-page pack-country">
      <section className="pc-head">
        <button className="pc-back" onClick={()=>setRoute({name:"pack"})}>
          ← 全部开包
        </button>
        <div className="pc-head-row">
          <Flag country={c} w={120} h={80}/>
          <div>
            <div className="eyebrow">国家 · [{c.id}] · {c.conf}</div>
            <h1 className="f-display" style={{fontSize:"clamp(48px,7vw,96px)", lineHeight:0.98, letterSpacing:"-0.025em", margin:"8px 0 12px"}}>
              {c.name}
            </h1>
            <div style={{display:"flex", gap:12}}>
              <span className={"country-card-status " + (s.sealed ? "status-sealed" : "status-pack")}>
                {s.sealed ? "已封盘" : "开包中"}
              </span>
              <span className="pill"><span className="pill-dot"/>已售 {s.packsSold.toLocaleString()} / 18,000</span>
            </div>
          </div>
        </div>
      </section>

      <section className="pc-grid">
        <div className="pc-left">
          <div className="section-eyebrow"><span className="bracket-num">A</span><span className="eyebrow">国家包</span><div className="hairline"/></div>

          <div className="pc-card">
            <div className="pc-card-art">
              <Flag country={c} w={280} h={180}/>
              <div className="pc-card-overlay">
                <div className="eyebrow">包含</div>
                <div className="f-display" style={{fontSize:36, lineHeight:1}}>1 × {c.id}</div>
                <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>国家代币 / 包</div>
              </div>
            </div>

            <div className="pc-card-body">
              <div className="pc-spec">
                <SpecRow label="包价" value={`${PACK_PRICE.toLocaleString()} FOOTBALL`} mono accent="accent"/>
                <SpecRow label="销毁 (5%)" value={`${PACK_BURN.toLocaleString()} FOOTBALL · 永久销毁`} mono accent="fire"/>
                <SpecRow label="注入曲线储备 (95%)" value={`${PACK_TO_CURVE.toLocaleString()} FOOTBALL`} mono/>
                <SpecRow label="每包铸造" value="1 枚国家代币" mono/>
                <SpecRow label="开包窗口上限" value="18,000 包 / 国" mono/>
                <SpecRow label="曲线渐近线" value="20,000 枚" mono/>
                <SpecRow label="曲线买/卖手续费" value="5% → 永久销毁" mono accent="fire"/>
              </div>

              <div className="pc-buy">
                <div className="eyebrow" style={{marginBottom:12}}>数量</div>
                <div className="pc-qty">
                  {[1, 5, 10, 25, 100].map(n => (
                    <button
                      key={n}
                      className={"pc-qty-btn " + (packCount===n ? "is-active" : "")}
                      onClick={()=>setPackCount(n)}
                      disabled={state !== "idle"}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <div className="pc-total">
                  <div>
                    <div className="eyebrow">你支付</div>
                    <div className="f-display numeric" style={{fontSize:48, lineHeight:1}}>{total.toLocaleString()}</div>
                    <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>FOOTBALL</div>
                  </div>
                  <div className="pc-total-arrow">→</div>
                  <div style={{textAlign:"right"}}>
                    <div className="eyebrow">你获得</div>
                    <div className="f-display-it numeric" style={{fontSize:48, lineHeight:1, color:"var(--accent)"}}>{tokensReceived.toLocaleString()}</div>
                    <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>{c.id}</div>
                  </div>
                </div>

                <div className="pc-burn-note">
                  <span className="f-mono" style={{color:"var(--fire)"}}>▲</span>
                  <span className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>
                    本次购买立即销毁 <span style={{color:"var(--fire)"}}>{burnAmount.toLocaleString()} FOOTBALL</span>（包价的 5%），其余 95% 注入 {c.id} 曲线储备。
                  </span>
                </div>

                {(state === "idle" || state === "error") && (
                  <>
                    {!wallet.connected ? (
                      <button className="btn btn-primary pc-cta" onClick={() => window.dispatchEvent(new CustomEvent("goal:openWalletModal"))} disabled>
                        连接钱包后购买
                      </button>
                    ) : cantBuy ? (
                      <button className="btn pc-cta" disabled>
                        {s.curveOpen ? "曲线交易中 — 请前往市场页" : "开包窗口已封盘"}
                      </button>
                    ) : !chainReady ? (
                      <button className="btn pc-cta" disabled>
                        <span className="pc-spin"/> 正从链上读取 {c.id}…
                      </button>
                    ) : (
                      <>
                        <button className="btn btn-primary pc-cta" onClick={handleBuy}>
                          确认购买 · {total} FOOTBALL
                        </button>
                        {insufficientGoal && (
                          <div className="f-mono" style={{color:"var(--fire)", fontSize:11, marginTop:8, textAlign:"center"}}>
                            ⚠ 余额读数为 {wallet.goalBalance.toLocaleString(undefined,{maximumFractionDigits:4})} FOOTBALL — 还差 {(total - wallet.goalBalance).toFixed(2)}。
                            如果你实际持有足够，仍可点击 — 以链上数据为准。
                          </div>
                        )}
                      </>
                    )}
                    {state === "error" && errMsg && (
                      <div className="f-mono" style={{color:"var(--fire)", fontSize:11, marginTop:8}}>
                        {errMsg}
                      </div>
                    )}
                  </>
                )}
                {state === "approving" && (
                  <button className="btn pc-cta" disabled>
                    <span className="pc-spin"/> 请在钱包中授权 FOOTBALL…
                  </button>
                )}
                {state === "sending" && (
                  <button className="btn pc-cta" disabled>
                    <span className="pc-spin"/> 请在钱包中确认…
                  </button>
                )}
                {state === "mining" && (
                  <button className="btn pc-cta" disabled>
                    <span className="pc-spin"/> 正在 BSC 上打包…
                  </button>
                )}
                {state === "success" && (
                  <div className="pc-success">
                    <div className="pc-success-row">
                      <span className="f-mono" style={{color:"var(--bull)"}}>✓ 已确认</span>
                      {txHash && (
                        <a className="f-mono" style={{color:"var(--fg-3)", fontSize:11}}
                           href={`https://bscscan.com/tx/${txHash}`} target="_blank" rel="noreferrer noopener">
                          {txHash.slice(0, 10)}…
                        </a>
                      )}
                    </div>
                    <div className="f-display" style={{fontSize:32, lineHeight:1, margin:"8px 0"}}>
                      +{tokensReceived} <span className="f-display-it" style={{color:"var(--accent)"}}>{c.id}</span> 已到账
                    </div>
                    <button className="btn btn-primary" onClick={()=>setRoute({name:"packPlayer", country:c.id})}>
                      开球员包 →
                    </button>
                    <button className="btn" onClick={()=>{setState("idle"); setPackCount(1); setTxHash(null);}}>
                      继续购买国家包
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pc-right">
          <div className="section-eyebrow"><span className="bracket-num">B</span><span className="eyebrow">近期动态</span><div className="hairline"/></div>
          <RecentActivity countryId={c.id}/>
        </div>
      </section>

      <Footer setRoute={setRoute}/>
    </main>
  );
};

const RecentActivity = ({ countryId }) => {
  const addrs = (window.CHAIN?.state?.countryAddrs && window.CHAIN.state.countryAddrs[countryId]) || {};
  return (
    <TransferLogFeed
      tokenAddr={addrs.tokenAddr}
      mintsOnly={true}
      heading="近期开包"
      limit={8}
    />
  );
};

/* =========== Pack Player — VRF slot machine reveal =========== */
const PackPlayer = ({ setRoute, countryId }) => {
  const c = COUNTRIES.find(x => x.id === countryId) || COUNTRIES[0];
  const chain = (window.useChain ? window.useChain() : { players: {} });
  const wallet = (window.WALLET ? window.WALLET.state : { connected: false });

  // Real per-role pack mints derived from chain supply (10 tokens per pack).
  const pools = {};
  for (const role of ["CPT","BST","RKE"]) {
    const ps = chain.players && chain.players[`${c.id}-${role}`];
    const max = PLAYER_ROLES[role].packs;
    const minted = ps ? Math.floor(ps.supply / 10) : 0;
    pools[role] = Math.max(0, max - minted);
  }

  const [stage, setStage] = React.useState("idle");
  const [result, setResult] = React.useState(null);
  const [requestId, setRequestId] = React.useState(null);
  const [packCount, setPackCount] = React.useState(1);
  const reelRef = React.useRef(null);
  const opened = []; // VRF reveal history will come from on-chain events once wired

  const roles = ["RKE", "BST", "CPT", "RKE", "RKE", "CPT", "BST", "RKE", "CPT", "RKE", "BST", "RKE", "CPT", "RKE", "BST", "RKE", "CPT", "RKE", "RKE", "BST", "CPT", "RKE", "BST"];

  const [reveals, setReveals] = React.useState([]);
  const [vrfSeconds, setVrfSeconds] = React.useState(0);
  const [errMsg, setErrMsg] = React.useState(null);
  const [txHash, setTxHash] = React.useState(null);
  const [openedAt, setOpenedAt] = React.useState(0); // unix seconds when open tx confirmed

  // Persist pending VRF request so closing the tab doesn't lose it.
  const storageKey = `goal_pending_pack_${c.id}_${window.WALLET?.state?.address || "anon"}`;
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved.requestId) return;
      setRequestId(saved.requestId);
      setTxHash(saved.txHash || null);
      setOpenedAt(saved.openedAt || 0);
      setStage("requesting");
      // Resume polling
      resumeWait(saved.requestId);
    } catch {}
  }, [c.id, window.WALLET?.state?.address]);

  async function resumeWait(rid) {
    try {
      await window.TX.waitForVrfFulfillment(BigInt(rid), {
        onTick: (sec) => setVrfSeconds(sec),
      });
      setStage("spinning");
      const { reveals: revealEvents, txHash: claimHash } = await window.TX.claimPlayerPack(BigInt(rid));
      setTxHash(claimHash);
      setReveals(revealEvents);
      const roleCounts = { CPT: 0, BST: 0, RKE: 0 };
      revealEvents.forEach(r => { roleCounts[r.role] = (roleCounts[r.role] || 0) + r.packs; });
      const dominant = Object.entries(roleCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || null;
      setResult(dominant);
      setStage("revealed");
      try { localStorage.removeItem(storageKey); } catch {}
      window.WALLET.refreshBalances();
      window.CHAIN.refresh();
    } catch (e) {
      setStage("idle");
      setErrMsg(e?.shortMessage || e?.reason || e?.message || "恢复开包失败");
    }
  }

  const handleOpen = async () => {
    if (stage !== "idle") return;
    if (!window.WALLET?.state?.connected) {
      alert("请先连接钱包（右上角）。");
      return;
    }
    setErrMsg(null);
    setReveals([]);
    setTxHash(null);
    setVrfSeconds(0);

    try {
      setStage("committing");
      const { requestId: rid, txHash: openHash } = await window.TX.openPlayerPack(
        c.id, packCount,
        (step, hash) => {
          if (step === "approving") setStage("committing");
          else if (step === "sending") setStage("committing");
          else if (step === "mining") { setStage("requesting"); if (hash) setTxHash(hash); }
          else if (step === "requested") { setStage("requesting"); if (hash) setTxHash(hash); }
        }
      );
      const ridStr = typeof rid === "bigint" ? rid.toString() : String(rid);
      setRequestId(ridStr);
      const ts = Math.floor(Date.now() / 1000);
      setOpenedAt(ts);
      setStage("requesting");
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          requestId: ridStr, txHash: openHash, openedAt: ts, packCount,
        }));
      } catch {}

      await window.TX.waitForVrfFulfillment(rid, {
        onTick: (sec) => setVrfSeconds(sec),
      });
      setStage("spinning");

      const { reveals: revealEvents, txHash: claimHash } = await window.TX.claimPlayerPack(rid);
      setTxHash(claimHash);
      setReveals(revealEvents);
      const roleCounts = { CPT: 0, BST: 0, RKE: 0 };
      revealEvents.forEach(r => { roleCounts[r.role] = (roleCounts[r.role] || 0) + r.packs; });
      const dominant = Object.entries(roleCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || null;
      setResult(dominant);
      setStage("revealed");
      try { localStorage.removeItem(storageKey); } catch {}

      window.WALLET.refreshBalances();
      window.CHAIN.refresh();
    } catch (e) {
      console.error(e);
      setStage("idle");
      setErrMsg(e?.shortMessage || e?.reason || e?.message || "交易失败");
    }
  };

  // Spec: recoverStuckRequest only callable after 24h. Show button only then.
  const RECOVERY_AFTER_S = 24 * 3600;
  const sinceOpened = openedAt ? Math.floor(Date.now() / 1000 - openedAt) : 0;
  const canRecover = openedAt && sinceOpened >= RECOVERY_AFTER_S;

  const handleRecover = async () => {
    if (!requestId) return;
    try {
      await window.TX.recoverStuckPack(requestId);
      setStage("idle");
      setRequestId(null);
      setOpenedAt(0);
      try { localStorage.removeItem(storageKey); } catch {}
      window.WALLET.refreshBalances();
    } catch (e) {
      setErrMsg(e?.shortMessage || e?.message);
    }
  };


  return (
    <main className="match-page pack-player">
      <section className="pp-head-v2">
        <button className="pc-back" onClick={()=>setRoute({name:"packCountry", country:c.id})}>
          ← 返回 {c.id}
        </button>
        <div className="pp-head-v2-row">
          <Flag country={c} w={88} h={60}/>
          <div className="pp-head-v2-meta">
            <h1 className="f-display pp-head-v2-title">{c.name} 球员</h1>
            <div className="f-mono pp-head-v2-sub">
              3 个球员市场 · 阶段 1 · 剩余 {pools.CPT + pools.BST + pools.RKE}/450 包
            </div>
          </div>
          <div className="pp-balance">
            <div className="eyebrow">你的 {c.id}</div>
            <div className="f-display numeric pp-balance-v">—</div>
          </div>
        </div>
      </section>

      <section className="pp-roster">
        {["BST", "CPT", "RKE"].map(role => {
          const r = PLAYER_ROLES[role];
          const remaining = pools[role];
          const minted = r.packs - remaining;
          const supply = minted * 10;
          const pname = window.playerName ? window.playerName(c.id, role) : `${c.id} ${role}`;
          const handle = pname.toUpperCase().replace(/\s+/g, "").slice(0, 12);
          const num = role === "CPT" ? 10 : role === "BST" ? 9 : 23;
          return (
            <div key={role} className={"roster-card tier-" + role}>
              <div className="roster-card-glow"/>
              <div className="roster-card-jersey-wrap">
                <Jersey country={c} role={role} number={num}
                        initials={window.playerInitials ? window.playerInitials(c.id, role) : null}
                        w={140} h={160}/>
              </div>
              <div className={"roster-card-tier eyebrow tier-text-" + role}>{rarityZh(r.rarity)}</div>
              <div className="roster-card-name f-display">{pname}</div>
              <div className="roster-card-handle f-mono">{window.playerHandle ? window.playerHandle(c.id, role) : handle}</div>
              <div className="roster-card-stats">
                <div className="roster-card-stat">
                  <div className="eyebrow">已开包</div>
                  <div className="f-mono numeric roster-card-stat-v">{minted}/{r.packs}</div>
                </div>
                <div className="roster-card-stat">
                  <div className="eyebrow">供应量</div>
                  <div className="f-mono numeric roster-card-stat-v">{supply}/{r.max}</div>
                </div>
                <div className="roster-card-stat">
                  <div className="eyebrow">曲线价格</div>
                  <div className="f-mono numeric roster-card-stat-v">
                    {(() => {
                      const ps = chain.players && chain.players[`${c.id}-${role}`];
                      return ps && ps.curveOpen ? ps.price.toFixed(3) + " G" : "—";
                    })()}
                  </div>
                </div>
                <div className="roster-card-stat">
                  <div className="eyebrow">供应量</div>
                  <div className="f-mono numeric roster-card-stat-v">
                    {(() => {
                      const ps = chain.players && chain.players[`${c.id}-${role}`];
                      return ps ? Math.floor(ps.supply).toLocaleString() : "0";
                    })()}
                  </div>
                </div>
              </div>
              <div className="roster-card-actions">
                <button className="roster-card-btn" onClick={() => setRoute({name:"playerMarket", id: `${c.id}-${role}`})}>
                  图表
                </button>
                <button className="roster-card-btn is-locked" disabled>
                  已锁定
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <section className="pp-open">
        <div className="pp-open-head">
          <div>
            <div className="eyebrow">开 {c.name} 球员包</div>
            <div className="pp-open-desc">
              每开一包消耗 1 枚 {c.id} 代币，通过 Chainlink VRF 随机抽取角色，每包铸造 10 枚球员代币。链上剩余 {pools.CPT + pools.BST + pools.RKE}/450 包。
            </div>
          </div>
          <div className="pp-open-bal">
            <div className="eyebrow">你的 {c.id}</div>
            <div className="f-display numeric" style={{fontSize:32, lineHeight:1}}>
              <CountryBalance iso={c.id}/>
            </div>
          </div>
        </div>
        <div className="pp-open-controls">
          <div className="pp-open-qty">
            {[1, 10, 50].map(n => (
              <button key={n}
                      className={"pp-open-qty-btn " + (packCount === n ? "is-active" : "")}
                      onClick={()=>setPackCount(n)} disabled={stage !== "idle"}>
                {n} 包
              </button>
            ))}
          </div>
          {(() => {
            const ws = window.WALLET?.state || {};
            const phase2 = chain.countries?.[c.id]?.curveOpen;
            const remaining = pools.CPT + pools.BST + pools.RKE;
            const disabled = stage !== "idle" || !ws.connected || !phase2 || remaining < packCount;
            let label = `开 ${packCount} 包`;
            if (stage === "committing") label = "请在钱包中确认…";
            else if (stage === "requesting") label = `等待 VRF · ${vrfSeconds}秒`;
            else if (stage === "spinning") label = "领取中…";
            else if (stage === "revealed") label = "再开一次";
            else if (!ws.connected) label = "连接钱包";
            else if (!phase2) label = "国家曲线尚未激活";
            else if (remaining < packCount) label = `仅剩 ${remaining} 包`;
            return (
              <button className="pp-open-cta" onClick={stage === "revealed" ? () => { setStage("idle"); setReveals([]); setResult(null); setRequestId(null); } : handleOpen} disabled={disabled && stage !== "revealed"}>
                {stage !== "idle" && stage !== "revealed" && <span className="pc-spin"/>}
                {label}
              </button>
            );
          })()}
        </div>
        <div className="pp-open-flow f-mono">
          两笔交易流程：开包（提交 1 枚 {c.id}/包，请求 VRF v2.5）→ 约 30–90 秒等待 → 领取（揭晓球员、铸造球员代币）。若 VRF 超 24 小时未回调，可取回国家代币。
          {stage === "requesting" && canRecover && (
            <button onClick={handleRecover} style={{marginLeft:12, color:"var(--fire)", background:"transparent", border:"none", textDecoration:"underline", cursor:"pointer"}}>
              取消并退款（已超 24 小时）
            </button>
          )}
          {stage === "requesting" && !canRecover && openedAt > 0 && vrfSeconds > 300 && (
            <span style={{marginLeft:12, color:"var(--fg-3)", fontSize:11}}>
              卡住了？{Math.ceil((RECOVERY_AFTER_S - sinceOpened) / 3600)} 小时后可恢复
            </span>
          )}
        </div>
        {errMsg && <div className="f-mono" style={{color:"var(--fire)", fontSize:12, marginTop:8}}>{errMsg}</div>}
        {txHash && stage !== "idle" && (
          <div className="f-mono" style={{fontSize:11, marginTop:6, color:"var(--fg-3)"}}>
            交易: <a href={`https://bscscan.com/tx/${txHash}`} target="_blank" rel="noreferrer noopener" style={{color:"inherit"}}>{txHash.slice(0,12)}…</a>
          </div>
        )}
        {reveals.length > 0 && (
          <div className="pp-open-recent">
            <span className="eyebrow">本次开包揭晓</span>
            <div className="pp-open-recent-list">
              {reveals.map((rv, i) => {
                const pname = window.playerName ? window.playerName(c.id, rv.role) : `${c.id} ${rv.role}`;
                return (
                  <span key={i} className={"pp-open-recent-chip badge-" + rv.role}>
                    {rv.role} · {pname} · ×{rv.packs}
                  </span>
                );
              })}
            </div>
          </div>
        )}

      </section>

      {stage !== "idle" && (
        <div className="pp-reveal-overlay">
          <div className={"pp-reveal-modal " + (result ? "tier-" + result : "")}>
            <div className="pp-reveal-bar">
              <span className="f-mono" style={{fontSize:11, color:"var(--fg-3)", letterSpacing:"0.06em"}}>VRF · v2.5 · 请求 {requestId || "—"}</span>
              <StatusLight stage={stage}/>
            </div>
            <div className="pp-slot">
              <div className="pp-slot-window">
                <div className="pp-slot-bracket pp-slot-bracket-top"/>
                <div className="pp-slot-bracket pp-slot-bracket-bot"/>
                <SlotReel stage={stage} roles={roles} target={result} country={c}/>
              </div>
            </div>
            <StatusBlock stage={stage} result={result} country={c} requestId={requestId}/>
            <div className="pp-actions">
              {(stage === "committing" || stage === "requesting" || stage === "spinning") && (
                <button className="btn pp-cta" disabled>
                  <span className="pc-spin"/> {
                    stage === "committing" ? "请在钱包中确认…" :
                    stage === "requesting" ? `Chainlink VRF · ${vrfSeconds}秒` :
                    "正在领取揭晓结果…"
                  }
                </button>
              )}
              {stage === "revealed" && (
                <button className="btn btn-fire pp-cta" onClick={() => { setStage("idle"); setReveals([]); setResult(null); setRequestId(null); }}>
                  ✓ 已铸造 {reveals.reduce((s,r)=>s+r.packs*10,0)} 枚 {c.id} 球员代币 · 关闭
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer setRoute={setRoute}/>
    </main>
  );
};

const PoolBar = ({ role, remaining, total, label, rarity, color, country }) => {
  const pct = (remaining / total) * 100;
  // deterministic jersey number for this nation × role
  const num = role === "CPT" ? 10 : role === "BST" ? 9 : 23;
  return (
    <div className="pool-bar">
      <div className="pool-bar-head">
        <div className="pool-bar-meta">
          {country && <Jersey country={country} role={role} number={num} w={48} h={54}/>}
          <div>
            <div className="f-display" style={{fontSize:22, lineHeight:1}}>{label}</div>
            <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>{rarity} · {total} 包 / 国</div>
          </div>
        </div>
        <div className="pool-bar-count">
          <span className="f-display numeric" style={{fontSize:32, lineHeight:1}}>{remaining}</span>
          <span className="f-mono" style={{fontSize:10, color:"var(--fg-3)"}}>共 {total}</span>
        </div>
      </div>
      <div className="bar"><div className="bar-fill" style={{width:`${pct}%`, background:color}}/></div>
    </div>
  );
};

const StatusLight = ({ stage }) => {
  const states = {
    idle:       { color: "var(--fg-3)", label: "就绪" },
    committing: { color: "var(--accent)", label: "提交中", pulse: true },
    requesting: { color: "var(--accent)", label: "VRF 已发送", pulse: true },
    spinning:   { color: "var(--accent)", label: "随机熵", pulse: true },
    revealed:   { color: "var(--bull)", label: "已解析" },
    claimed:    { color: "var(--bull)", label: "已铸造" },
  };
  const s = states[stage];
  return (
    <div className="status-light">
      <div className={"status-light-dot " + (s.pulse ? "is-pulse" : "")} style={{background:s.color}}/>
      <span className="f-mono" style={{fontSize:10, color:s.color, letterSpacing:"0.08em"}}>{s.label}</span>
    </div>
  );
};

const StatusBlock = ({ stage, result, country, requestId }) => {
  if (stage === "idle") {
    return (
      <div className="pp-status">
        <div className="eyebrow">等待中</div>
        <div className="f-display" style={{fontSize:28, lineHeight:1.05}}>
          点击开包，<span className="f-display-it" style={{color:"var(--accent)"}}>销毁一枚</span> {country.id} 代币。
        </div>
        <div className="f-mono" style={{fontSize:12, color:"var(--fg-3)", marginTop:8}}>
          Chainlink VRF 将返回一个角色。每包铸造 10 枚解析出的球员代币。
        </div>
      </div>
    );
  }
  if (stage === "committing") {
    return (
      <div className="pp-status">
        <div className="eyebrow">01 / 提交</div>
        <div className="f-display" style={{fontSize:28, lineHeight:1.05}}>正在销毁 1 枚 {country.id}…</div>
        <div className="f-mono" style={{fontSize:12, color:"var(--fg-3)", marginTop:8}}>
          正在调用 PlayerPackOpener 的 openPack(country)…
        </div>
      </div>
    );
  }
  if (stage === "requesting") {
    return (
      <div className="pp-status">
        <div className="eyebrow">02 / VRF 请求</div>
        <div className="f-display" style={{fontSize:28, lineHeight:1.05}}>等待 <span className="f-display-it">{requestId}</span></div>
        <div className="f-mono" style={{fontSize:12, color:"var(--fg-3)", marginTop:8}}>
          numWords=1 · randomWord % (cpt+bst+rke) → role
        </div>
      </div>
    );
  }
  if (stage === "spinning") {
    return (
      <div className="pp-status">
        <div className="eyebrow">03 / 解析中</div>
        <div className="f-display" style={{fontSize:28, lineHeight:1.05}}>
          <span className="dots"><span/><span/><span/></span>
        </div>
        <div className="f-mono" style={{fontSize:12, color:"var(--fg-3)", marginTop:8}}>
          fulfillRandomWords() — 在回调中扣减配额。
        </div>
      </div>
    );
  }
  if (stage === "revealed" || stage === "claimed") {
    const r = PLAYER_ROLES[result];
    const playerName = window.playerName ? window.playerName(country.id, result) : `${country.id} ${r.label}`;
    return (
      <div className={"pp-status pp-status-revealed pp-status-" + result}>
        <div className="pp-status-burst"/>
        <div className="eyebrow" style={{color:r.color}}>{rarityZh(r.rarity)} · {result}</div>
        <div className="f-display" style={{fontSize:32, lineHeight:1.05, color: r.color, marginTop:4}}>
          {playerName}
        </div>
        <div className="f-mono" style={{fontSize:12, color:"var(--fg-2)", marginTop:6}}>
          <span style={{color:"var(--fg)"}}>{country.name}</span> · {r.label} · #{result === "CPT" ? 10 : result === "BST" ? 9 : 23}
        </div>
        <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)", marginTop:6}}>
          +10 枚 {country.id}.{result} 球员代币 · 曲线在领取时注入
        </div>
      </div>
    );
  }
  return null;
};

/* === Slot reel === */
const SlotReel = ({ stage, roles, target, country }) => {
  const itemH = 84;
  const reelRef = React.useRef(null);
  React.useEffect(() => {
    const el = reelRef.current;
    if (!el) return;
    if (stage === "idle") {
      el.style.transition = "none";
      el.style.transform = "translateY(0)";
    }
    if (stage === "spinning") {
      el.style.transition = "none";
      el.style.transform = "translateY(0)";
      // start fast spin
      requestAnimationFrame(() => {
        el.style.transition = "transform 1.4s linear";
        el.style.transform = `translateY(-${itemH * 12}px)`;
      });
    }
    if (stage === "revealed") {
      // land on target — find target index in roles repeating
      const targetIdx = roles.findIndex(r => r === target);
      const landing = targetIdx + roles.length * 2; // a few loops in
      el.style.transition = "transform 1.6s cubic-bezier(0.16, 0.84, 0.27, 1.02)";
      el.style.transform = `translateY(-${landing * itemH}px)`;
    }
  }, [stage, target]);

  // build a long strip
  const strip = [];
  for (let i = 0; i < 4; i++) strip.push(...roles);

  return (
    <div className="pp-reel" ref={reelRef} style={{transform:"translateY(0)"}}>
      {strip.map((r, i) => {
        const role = PLAYER_ROLES[r];
        const num = r === "CPT" ? 10 : r === "BST" ? 9 : 23;
        return (
                  <div className={"pp-reel-item is-" + r}>
                    <Jersey country={country} role={r} number={num} w={56} h={62} className="pp-reel-item-jersey"/>
                    <div className="pp-reel-item-info">
                      <div className="pp-reel-item-tag f-mono">{r}</div>
                      <div className="pp-reel-item-label f-display">{role.label}</div>
                      <div className="pp-reel-item-rarity f-mono">{rarityZh(role.rarity)}</div>
                    </div>
                  </div>
        );
      })}
    </div>
  );
};

window.Pack = Pack;
window.PackCountry = PackCountry;
window.PackPlayer = PackPlayer;
