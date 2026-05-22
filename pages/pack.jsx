// FOOTBALL — Pack pages: overview, country detail, player reveal

// Maps the data-layer rarity tier to a Chinese label for display.
const rarityZh = (r) => ({ Wide: L("普通","Common"), Rare: L("稀有","Rare"), Common: L("常见","Standard") }[r] || r);

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
          <div className="eyebrow">{L("阶段 I · 开包窗口", "Phase I · Pack Window")}</div>
          <h1 className="f-display" style={{fontSize:"clamp(44px,6vw,92px)", lineHeight:0.98, letterSpacing:"-0.045em", margin:"12px 0 24px", fontWeight:600}}>
            {L("48 个窗口。", "48 Windows.")}
            <br/>
            <span style={{color:"var(--accent)", fontWeight:300}}>{L("同一个倒计时。", "One Countdown.")}</span>
          </h1>
          <p style={{maxWidth:560, color:"var(--fg-2)", fontSize:17, lineHeight:1.55}}>
            {L("开包窗口分发国家代币与球员代币的初始供应。每个国家最多 18,000 个国家包，每包用 FOOTBALL 购买、铸造 1 枚国家代币；窗口封盘后，该国曲线即上线交易。随后可用国家代币开 450 个球员包。",
               "The Pack Window distributes the initial supply of Country Tokens and Player Tokens. Each country offers up to 18,000 Country Packs — each pack is bought with FOOTBALL and mints 1 Country Token. Once a window seals, that country's curve goes live for trading. Country Tokens can then open 450 Player Packs.")}
          </p>
        </div>
        <div className="pack-hero-r">
          <div className="pack-clock">
            <div className="eyebrow">
              {!countdown.available ? L("读取开包窗口中…", "Loading Pack Window…") :
               countdown.closed ? L("开包窗口已关闭", "Pack Window closed") :
               L("全局窗口关闭于", "Global window closes in")}
            </div>
            <div className="pack-clock-row">
              <ClockUnit value={countdown.available ? countdown.days  : "—"} label={L("天","D")}/>
              <ClockUnit value={countdown.available ? countdown.hours : "—"} label={L("时","H")}/>
              <ClockUnit value={countdown.available ? countdown.mins  : "—"} label={L("分","M")}/>
              <ClockUnit value={countdown.available ? countdown.secs  : "—"} label={L("秒","S")}/>
            </div>
          </div>
          <div className="pack-progress">
            <div className="pack-progress-head">
              <span className="eyebrow">{L("已售开包", "Packs Sold")}</span>
              <span className="f-mono" style={{fontSize:13}}>
                <span style={{color:"var(--fg)"}}>{packsSold.toLocaleString()}</span>
                <span style={{color:"var(--fg-3)"}}> / {totalPacks.toLocaleString()}</span>
              </span>
            </div>
            <div className="bar"><div className="bar-fill" style={{width:`${packsSold/totalPacks*100}%`}}/></div>
            <div className="pack-progress-foot">
              <span className="f-mono" style={{color:"var(--fg-3)", fontSize:11}}>
                {L(`已完成 ${(packsSold/totalPacks*100).toFixed(1)}%`, `${(packsSold/totalPacks*100).toFixed(1)}% complete`)}
              </span>
              <span className="f-mono" style={{color:"var(--accent)", fontSize:11}}>
                {L(`${COUNTRIES.filter(c=>countryState(c).sealed).length} 国已封盘`, `${COUNTRIES.filter(c=>countryState(c).sealed).length} countries sealed`)}
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
              {f === "ALL" ? L("全部","All") : f === "OPEN" ? L("开包中","Opening") : f === "SEALED" ? L("已封盘","Sealed") : L("已上线 · 开球员包","Live · Player Packs")}
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
          <span className="eyebrow">{L("排序","Sort")}</span>
          <span className="f-mono" style={{fontSize:12, color:"var(--fg-2)"}}>{L("按大洲分区 ↓","By confederation ↓")}</span>
        </div>
      </section>

      <section className="pack-table">
        <div className="pack-table-head f-mono">
          <span style={{width:60}}></span>
          <span style={{flex:"1 0 200px"}}>{L("国家","Country")}</span>
          <span style={{flex:"0 0 100px"}}>{L("分区","Conf")}</span>
          <span style={{flex:"0 0 160px"}}>{L("状态","Status")}</span>
          <span style={{flex:"1 0 220px"}}>{L("开包进度","Pack Progress")}</span>
          <span style={{flex:"0 0 110px"}}>{L("价格 · FOOTBALL","Price · FOOTBALL")}</span>
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
                  {s.curveOpen ? L("曲线上线","Curve Live") : s.sealed ? L("已封盘","Sealed") : L("开包中","Opening")}
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
                  {s.curveOpen ? L("开球员包 →","Player Packs →") : L("开包 →","Open Packs →")}
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
      alert(L("请先连接钱包（右上角）。", "Please connect your wallet first (top right)."));
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
      setErrMsg(e?.shortMessage || e?.reason || e?.message || L("交易失败", "Transaction failed"));
    }
  };

  return (
    <main className="match-page pack-country">
      <section className="pc-head">
        <button className="pc-back" onClick={()=>setRoute({name:"pack"})}>
          {L("← 全部开包", "← All Packs")}
        </button>
        <div className="pc-head-row">
          <Flag country={c} w={120} h={80}/>
          <div>
            <div className="eyebrow">{L("国家","Country")} · [{c.id}] · {c.conf}</div>
            <h1 className="f-display" style={{fontSize:"clamp(48px,7vw,96px)", lineHeight:0.98, letterSpacing:"-0.025em", margin:"8px 0 12px"}}>
              {c.name}
            </h1>
            <div style={{display:"flex", gap:12}}>
              <span className={"country-card-status " + (s.sealed ? "status-sealed" : "status-pack")}>
                {s.sealed ? L("已封盘","Sealed") : L("开包中","Opening")}
              </span>
              <span className="pill"><span className="pill-dot"/>{L(`已售 ${s.packsSold.toLocaleString()} / 18,000`, `${s.packsSold.toLocaleString()} / 18,000 sold`)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="pc-grid">
        <div className="pc-left">
          <div className="section-eyebrow"><span className="bracket-num">A</span><span className="eyebrow">{L("国家包","Country Pack")}</span><div className="hairline"/></div>

          <div className="pc-card">
            <div className="pc-card-art">
              <Flag country={c} w={280} h={180}/>
              <div className="pc-card-overlay">
                <div className="eyebrow">{L("包含","Contains")}</div>
                <div className="f-display" style={{fontSize:36, lineHeight:1}}>1 × {c.id}</div>
                <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>{L("国家代币 / 包","Country Token / pack")}</div>
              </div>
            </div>

            <div className="pc-card-body">
              <div className="pc-spec">
                <SpecRow label={L("包价","Pack Price")} value={`${PACK_PRICE.toLocaleString()} FOOTBALL`} mono accent="accent"/>
                <SpecRow label={L("销毁 (5%)","Burn (5%)")} value={L(`${PACK_BURN.toLocaleString()} FOOTBALL · 永久销毁`, `${PACK_BURN.toLocaleString()} FOOTBALL · burned forever`)} mono accent="fire"/>
                <SpecRow label={L("注入曲线储备 (95%)","To Curve Reserve (95%)")} value={`${PACK_TO_CURVE.toLocaleString()} FOOTBALL`} mono/>
                <SpecRow label={L("每包铸造","Minted / Pack")} value={L("1 枚国家代币","1 Country Token")} mono/>
                <SpecRow label={L("开包窗口上限","Pack Window Cap")} value={L("18,000 包 / 国","18,000 packs / country")} mono/>
                <SpecRow label={L("曲线渐近线","Curve Asymptote")} value={L("20,000 枚","20,000 tokens")} mono/>
                <SpecRow label={L("曲线买/卖手续费","Curve Buy/Sell Fee")} value={L("5% → 永久销毁","5% → burned forever")} mono accent="fire"/>
              </div>

              <div className="pc-buy">
                <div className="eyebrow" style={{marginBottom:12}}>{L("数量","Quantity")}</div>
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
                    <div className="eyebrow">{L("你支付","You Pay")}</div>
                    <div className="f-display numeric" style={{fontSize:48, lineHeight:1}}>{total.toLocaleString()}</div>
                    <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>FOOTBALL</div>
                  </div>
                  <div className="pc-total-arrow">→</div>
                  <div style={{textAlign:"right"}}>
                    <div className="eyebrow">{L("你获得","You Get")}</div>
                    <div className="f-display-it numeric" style={{fontSize:48, lineHeight:1, color:"var(--accent)"}}>{tokensReceived.toLocaleString()}</div>
                    <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>{c.id}</div>
                  </div>
                </div>

                <div className="pc-burn-note">
                  <span className="f-mono" style={{color:"var(--fire)"}}>▲</span>
                  <span className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>
                    {L("本次购买立即销毁 ", "This purchase immediately burns ")}<span style={{color:"var(--fire)"}}>{burnAmount.toLocaleString()} FOOTBALL</span>{L(`（包价的 5%），其余 95% 注入 ${c.id} 曲线储备。`, ` (5% of pack price); the other 95% goes to the ${c.id} curve reserve.`)}
                  </span>
                </div>

                {(state === "idle" || state === "error") && (
                  <>
                    {!wallet.connected ? (
                      <button className="btn btn-primary pc-cta" onClick={() => window.dispatchEvent(new CustomEvent("goal:openWalletModal"))} disabled>
                        {L("连接钱包后购买","Connect Wallet to Buy")}
                      </button>
                    ) : cantBuy ? (
                      <button className="btn pc-cta" disabled>
                        {s.curveOpen ? L("曲线交易中 — 请前往市场页","Curve trading — go to Market") : L("开包窗口已封盘","Pack Window sealed")}
                      </button>
                    ) : !chainReady ? (
                      <button className="btn pc-cta" disabled>
                        <span className="pc-spin"/> {L(`正从链上读取 ${c.id}…`, `Loading ${c.id} from chain…`)}
                      </button>
                    ) : (
                      <>
                        <button className="btn btn-primary pc-cta" onClick={handleBuy}>
                          {L(`确认购买 · ${total} FOOTBALL`, `Confirm Buy · ${total} FOOTBALL`)}
                        </button>
                        {insufficientGoal && (
                          <div className="f-mono" style={{color:"var(--fire)", fontSize:11, marginTop:8, textAlign:"center"}}>
                            {L(`⚠ 余额读数为 ${wallet.goalBalance.toLocaleString(undefined,{maximumFractionDigits:4})} FOOTBALL — 还差 ${(total - wallet.goalBalance).toFixed(2)}。如果你实际持有足够，仍可点击 — 以链上数据为准。`,
                               `⚠ Balance reads ${wallet.goalBalance.toLocaleString(undefined,{maximumFractionDigits:4})} FOOTBALL — ${(total - wallet.goalBalance).toFixed(2)} short. If you actually hold enough, you can still click — on-chain data is the source of truth.`)}
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
                    <span className="pc-spin"/> {L("请在钱包中授权 FOOTBALL…","Approve FOOTBALL in your wallet…")}
                  </button>
                )}
                {state === "sending" && (
                  <button className="btn pc-cta" disabled>
                    <span className="pc-spin"/> {L("请在钱包中确认…","Confirm in your wallet…")}
                  </button>
                )}
                {state === "mining" && (
                  <button className="btn pc-cta" disabled>
                    <span className="pc-spin"/> {L("正在 BSC 上打包…","Mining on BSC…")}
                  </button>
                )}
                {state === "success" && (
                  <div className="pc-success">
                    <div className="pc-success-row">
                      <span className="f-mono" style={{color:"var(--bull)"}}>{L("✓ 已确认","✓ Confirmed")}</span>
                      {txHash && (
                        <a className="f-mono" style={{color:"var(--fg-3)", fontSize:11}}
                           href={`https://bscscan.com/tx/${txHash}`} target="_blank" rel="noreferrer noopener">
                          {txHash.slice(0, 10)}…
                        </a>
                      )}
                    </div>
                    <div className="f-display" style={{fontSize:32, lineHeight:1, margin:"8px 0"}}>
                      +{tokensReceived} <span className="f-display-it" style={{color:"var(--accent)"}}>{c.id}</span> {L("已到账","received")}
                    </div>
                    <button className="btn btn-primary" onClick={()=>setRoute({name:"packPlayer", country:c.id})}>
                      {L("开球员包 →","Open Player Packs →")}
                    </button>
                    <button className="btn" onClick={()=>{setState("idle"); setPackCount(1); setTxHash(null);}}>
                      {L("继续购买国家包","Buy More Country Packs")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pc-right">
          <div className="section-eyebrow"><span className="bracket-num">B</span><span className="eyebrow">{L("近期动态","Recent Activity")}</span><div className="hairline"/></div>
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
      heading={L("近期开包","Recent Packs")}
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

  // 还能开多少球员包 —— 看链上 committed（已开包数），openable = 450 - committed。
  // 不能用 pools 之和：那是「未领取」额度，含已开未领的包，会误导用户以为还能开。
  const [openable, setOpenable] = React.useState(null);
  React.useEffect(() => {
    let cancel = false;
    async function load() {
      if (!window.TX?.getPlayerPackQuota) return;
      const q = await window.TX.getPlayerPackQuota(c.id);
      if (!cancel && q) setOpenable(q.openable);
    }
    load();
    const id = setInterval(load, 20_000);
    return () => { cancel = true; clearInterval(id); };
  }, [c.id]);

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
      setErrMsg(e?.shortMessage || e?.reason || e?.message || L("恢复开包失败", "Failed to resume pack open"));
    }
  }

  const handleOpen = async () => {
    if (stage !== "idle") return;
    if (!window.WALLET?.state?.connected) {
      alert(L("请先连接钱包（右上角）。", "Please connect your wallet first (top right)."));
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
      setErrMsg(e?.shortMessage || e?.reason || e?.message || L("交易失败", "Transaction failed"));
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
          {L(`← 返回 ${c.id}`, `← Back to ${c.id}`)}
        </button>
        <div className="pp-head-v2-row">
          <Flag country={c} w={88} h={60}/>
          <div className="pp-head-v2-meta">
            <h1 className="f-display pp-head-v2-title">{L(`${c.name} 球员`, `${c.name} Players`)}</h1>
            <div className="f-mono pp-head-v2-sub">
              {L(`3 个球员市场 · 还能开 ${openable == null ? "…" : openable}/450 包`, `3 player markets · ${openable == null ? "…" : openable}/450 packs openable`)}
            </div>
          </div>
          <div className="pp-balance">
            <div className="eyebrow">{L(`你的 ${c.id}`, `Your ${c.id}`)}</div>
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
                  <div className="eyebrow">{L("已开包","Opened")}</div>
                  <div className="f-mono numeric roster-card-stat-v">{minted}/{r.packs}</div>
                </div>
                <div className="roster-card-stat">
                  <div className="eyebrow">{L("供应量","Supply")}</div>
                  <div className="f-mono numeric roster-card-stat-v">{supply}/{r.max}</div>
                </div>
                <div className="roster-card-stat">
                  <div className="eyebrow">{L("曲线价格","Curve Price")}</div>
                  <div className="f-mono numeric roster-card-stat-v">
                    {(() => {
                      const ps = chain.players && chain.players[`${c.id}-${role}`];
                      return ps && ps.curveOpen ? ps.price.toFixed(3) + " G" : "—";
                    })()}
                  </div>
                </div>
                <div className="roster-card-stat">
                  <div className="eyebrow">{L("供应量","Supply")}</div>
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
                  {L("图表","Chart")}
                </button>
                <button className="roster-card-btn is-locked" disabled>
                  {L("已锁定","Locked")}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <section className="pp-open">
        <div className="pp-open-head">
          <div>
            <div className="eyebrow">{L(`开 ${c.name} 球员包`, `Open ${c.name} Player Packs`)}</div>
            <div className="pp-open-desc">
              {L(`每开一包消耗 1 枚 ${c.id} 代币，通过 Chainlink VRF 随机抽取角色，每包铸造 10 枚球员代币。链上还能开 ${openable == null ? "…" : openable}/450 包。`,
                 `Each pack burns 1 ${c.id} token, draws a role at random via Chainlink VRF, and mints 10 Player Tokens. On-chain openable: ${openable == null ? "…" : openable}/450 packs.`)}
            </div>
          </div>
          <div className="pp-open-bal">
            <div className="eyebrow">{L(`你的 ${c.id}`, `Your ${c.id}`)}</div>
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
                {L(`${n} 包`, `${n} packs`)}
              </button>
            ))}
          </div>
          {(() => {
            const ws = window.WALLET?.state || {};
            const phase2 = chain.countries?.[c.id]?.curveOpen;
            const loading = openable == null;
            const remaining = openable || 0;
            const disabled = stage !== "idle" || !ws.connected || !phase2 || loading || remaining < packCount;
            let label = L(`开 ${packCount} 包`, `Open ${packCount} packs`);
            if (stage === "committing") label = L("请在钱包中确认…", "Confirm in your wallet…");
            else if (stage === "requesting") label = L(`等待 VRF · ${vrfSeconds}秒`, `Waiting for VRF · ${vrfSeconds}s`);
            else if (stage === "spinning") label = L("领取中…", "Claiming…");
            else if (stage === "revealed") label = L("再开一次", "Open Again");
            else if (!ws.connected) label = L("连接钱包", "Connect Wallet");
            else if (!phase2) label = L("国家曲线尚未激活", "Country curve not yet active");
            else if (loading) label = L("读取链上额度…", "Loading on-chain quota…");
            else if (remaining <= 0) label = L("球员包已售罄", "Player Packs Sold Out");
            else if (remaining < packCount) label = L(`仅剩 ${remaining} 包`, `Only ${remaining} packs left`);
            return (
              <button className="pp-open-cta" onClick={stage === "revealed" ? () => { setStage("idle"); setReveals([]); setResult(null); setRequestId(null); } : handleOpen} disabled={disabled && stage !== "revealed"}>
                {stage !== "idle" && stage !== "revealed" && <span className="pc-spin"/>}
                {label}
              </button>
            );
          })()}
        </div>
        <div className="pp-open-flow f-mono">
          {L(`两笔交易流程：开包（提交 1 枚 ${c.id}/包，请求 VRF v2.5）→ 约 30–90 秒等待 → 领取（揭晓球员、铸造球员代币）。若 VRF 超 24 小时未回调，可取回国家代币。`,
             `Two-transaction flow: Open (commit 1 ${c.id}/pack, request VRF v2.5) → ~30–90s wait → Claim (reveal players, mint Player Tokens). If VRF doesn't call back within 24 hours, you can recover your Country Tokens.`)}
          {stage === "requesting" && canRecover && (
            <button onClick={handleRecover} style={{marginLeft:12, color:"var(--fire)", background:"transparent", border:"none", textDecoration:"underline", cursor:"pointer"}}>
              {L("取消并退款（已超 24 小时）", "Cancel and Refund (over 24 hours)")}
            </button>
          )}
          {stage === "requesting" && !canRecover && openedAt > 0 && vrfSeconds > 300 && (
            <span style={{marginLeft:12, color:"var(--fg-3)", fontSize:11}}>
              {L(`卡住了？${Math.ceil((RECOVERY_AFTER_S - sinceOpened) / 3600)} 小时后可恢复`, `Stuck? Recoverable in ${Math.ceil((RECOVERY_AFTER_S - sinceOpened) / 3600)}h`)}
            </span>
          )}
        </div>
        {errMsg && <div className="f-mono" style={{color:"var(--fire)", fontSize:12, marginTop:8}}>{errMsg}</div>}
        {txHash && stage !== "idle" && (
          <div className="f-mono" style={{fontSize:11, marginTop:6, color:"var(--fg-3)"}}>
            {L("交易: ","Tx: ")}<a href={`https://bscscan.com/tx/${txHash}`} target="_blank" rel="noreferrer noopener" style={{color:"inherit"}}>{txHash.slice(0,12)}…</a>
          </div>
        )}
        {reveals.length > 0 && (
          <div className="pp-open-recent">
            <span className="eyebrow">{L("本次开包揭晓","This Pack's Reveal")}</span>
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
              <span className="f-mono" style={{fontSize:11, color:"var(--fg-3)", letterSpacing:"0.06em"}}>{L(`VRF · v2.5 · 请求 ${requestId || "—"}`, `VRF · v2.5 · Request ${requestId || "—"}`)}</span>
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
                    stage === "committing" ? L("请在钱包中确认…","Confirm in your wallet…") :
                    stage === "requesting" ? L(`Chainlink VRF · ${vrfSeconds}秒`, `Chainlink VRF · ${vrfSeconds}s`) :
                    L("正在领取揭晓结果…","Claiming reveal…")
                  }
                </button>
              )}
              {stage === "revealed" && (
                <button className="btn btn-fire pp-cta" onClick={() => { setStage("idle"); setReveals([]); setResult(null); setRequestId(null); }}>
                  {L("✓ 已铸造 ","✓ Minted ")}{reveals.reduce((s,r)=>s+r.packs*10,0)}{L(` 枚 ${c.id} 球员代币 · 关闭`, ` ${c.id} Player Tokens · Close`)}
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
            <div className="f-mono" style={{fontSize:11, color:"var(--fg-3)"}}>{rarity} · {L(`${total} 包 / 国`, `${total} packs / country`)}</div>
          </div>
        </div>
        <div className="pool-bar-count">
          <span className="f-display numeric" style={{fontSize:32, lineHeight:1}}>{remaining}</span>
          <span className="f-mono" style={{fontSize:10, color:"var(--fg-3)"}}>{L(`共 ${total}`, `of ${total}`)}</span>
        </div>
      </div>
      <div className="bar"><div className="bar-fill" style={{width:`${pct}%`, background:color}}/></div>
    </div>
  );
};

const StatusLight = ({ stage }) => {
  const states = {
    idle:       { color: "var(--fg-3)", label: L("就绪","Ready") },
    committing: { color: "var(--accent)", label: L("提交中","Committing"), pulse: true },
    requesting: { color: "var(--accent)", label: L("VRF 已发送","VRF Sent"), pulse: true },
    spinning:   { color: "var(--accent)", label: L("随机熵","Entropy"), pulse: true },
    revealed:   { color: "var(--bull)", label: L("已解析","Resolved") },
    claimed:    { color: "var(--bull)", label: L("已铸造","Minted") },
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
        <div className="eyebrow">{L("等待中","Waiting")}</div>
        <div className="f-display" style={{fontSize:28, lineHeight:1.05}}>
          {L("点击开包，","Click to open and ")}<span className="f-display-it" style={{color:"var(--accent)"}}>{L("销毁一枚","burn one")}</span> {L(`${country.id} 代币。`, `${country.id} token.`)}
        </div>
        <div className="f-mono" style={{fontSize:12, color:"var(--fg-3)", marginTop:8}}>
          {L("Chainlink VRF 将返回一个角色。每包铸造 10 枚解析出的球员代币。",
             "Chainlink VRF returns a role. Each pack mints 10 of the resolved Player Tokens.")}
        </div>
      </div>
    );
  }
  if (stage === "committing") {
    return (
      <div className="pp-status">
        <div className="eyebrow">{L("01 / 提交","01 / Commit")}</div>
        <div className="f-display" style={{fontSize:28, lineHeight:1.05}}>{L(`正在销毁 1 枚 ${country.id}…`, `Burning 1 ${country.id}…`)}</div>
        <div className="f-mono" style={{fontSize:12, color:"var(--fg-3)", marginTop:8}}>
          {L("正在调用 PlayerPackOpener 的 openPack(country)…","Calling PlayerPackOpener.openPack(country)…")}
        </div>
      </div>
    );
  }
  if (stage === "requesting") {
    return (
      <div className="pp-status">
        <div className="eyebrow">{L("02 / VRF 请求","02 / VRF Request")}</div>
        <div className="f-display" style={{fontSize:28, lineHeight:1.05}}>{L("等待 ","Waiting on ")}<span className="f-display-it">{requestId}</span></div>
        <div className="f-mono" style={{fontSize:12, color:"var(--fg-3)", marginTop:8}}>
          numWords=1 · randomWord % (cpt+bst+rke) → role
        </div>
      </div>
    );
  }
  if (stage === "spinning") {
    return (
      <div className="pp-status">
        <div className="eyebrow">{L("03 / 解析中","03 / Resolving")}</div>
        <div className="f-display" style={{fontSize:28, lineHeight:1.05}}>
          <span className="dots"><span/><span/><span/></span>
        </div>
        <div className="f-mono" style={{fontSize:12, color:"var(--fg-3)", marginTop:8}}>
          {L("fulfillRandomWords() — 在回调中扣减配额。","fulfillRandomWords() — quota decremented in the callback.")}
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
          {L(`+10 枚 ${country.id}.${result} 球员代币 · 曲线在领取时注入`, `+10 ${country.id}.${result} Player Tokens · curve funded on claim`)}
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
