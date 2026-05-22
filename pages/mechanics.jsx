// FOOTBALL — 机制说明页（协议文档）
const Mechanics = ({ setRoute }) => {
  return (
    <main className="match-page mech">

      <section className="mech-hero">
        <div className="mech-hero-top">
          <div className="eyebrow">{L("机制 · v1.0 · 最后更新 2026 年 5 月 22 日", "Mechanics · v1.0 · Last updated May 22, 2026")}</div>
          <div className="eyebrow">{L("阅读时长 · 8 分钟", "Reading time · 8 minutes")}</div>
        </div>
        <h1 className="mech-h1 f-display">
          {L("一个对谁会夺冠", "A protocol that takes ")}<span style={{color:"var(--accent)"}}>{L("毫无立场", "no position")}</span>{L("的协议。", " on who lifts the trophy.")}
        </h1>
        <p className="mech-lede">
          {L("FOOTBALL 是建在 BSC 上的闭环锦标赛市场。FOOTBALL 代币进，国家与球员代币出。192 条联合曲线没有治理、没有管理员、没有升级路径 —— 它们不挑选赢家。代币 4% 的交易税单独流入金库，自动回购 FOOTBALL，并把分红发还给买过包的人。",
             "FOOTBALL is a closed-loop tournament market built on BSC. FOOTBALL tokens go in, Country and Player Tokens come out. The 192 bonding curves have no governance, no admin, and no upgrade path — they do not pick winners. The token's 4% trading tax flows separately into the Treasury, automatically buys back FOOTBALL, and returns Dividends to everyone who has opened packs.")}
        </p>

        <div className="mech-toc">
          {SECTIONS.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} className="mech-toc-item">
              <span className="f-mono mech-toc-num">{String(i+1).padStart(2,"0")}</span>
              <span className="mech-toc-label">{s.label}</span>
            </a>
          ))}
        </div>
      </section>

      <MechSection id="token" num="01" title={L("代币", "The Token")} subtitle={L("FOOTBALL · BEP-20 · flap.sh 发射", "FOOTBALL · BEP-20 · launched on flap.sh")}>
        <div className="mech-cols">
          <div>
            <p>
              <span className="f-mono" style={{color:"var(--accent)"}}>FOOTBALL</span>{L(" 是协议唯一接受的资产，通过 ", " is the only asset the protocol accepts, launched via the ")}<span className="f-mono">flap.sh</span>{L(" 启动板发射 —— 总量固定 10 亿枚，没有增发函数、没有团队预留、没有解锁计划。供应量在发射时一次性铸造完毕。",
              " launchpad — a fixed Total Supply of 1 billion tokens, with no mint function, no team allocation, and no unlock schedule. The entire supply is minted once at launch.")}
            </p>
            <p>
              {L("FOOTBALL 是一个 4/4 税代币：在 flap 内盘联合曲线、以及毕业后的 PancakeSwap 上，每笔买入与卖出各收 4% 税，自动换成 BNB 打进金库合约（见 ",
                "FOOTBALL is a 4/4 tax token: on the flap internal bonding curve, and on PancakeSwap after graduation, every buy and sell is charged a 4% tax, automatically swapped into BNB and sent to the Treasury contract (see ")}<code className="inline-code">{L("04 · 金库与分红", "04 · Treasury & Dividends")}</code>{L("）。钱包之间的普通转账、以及转入本协议合约（买包、曲线交易）", "). Ordinary wallet-to-wallet transfers, and transfers into the protocol's own contracts (opening packs, curve trades), are ")}<span className="f-display-it" style={{color:"var(--fg)"}}>{L("不收税", "tax-free")}</span>.
            </p>
            <p>
              {L("作用于供应量的唯一力量是销毁。FOOTBALL 一旦被转入销毁地址便无法重建 —— 这条曲线单调、单向。",
                "The only force acting on supply is the Burn. Once FOOTBALL is sent to the burn address it can never be reconstituted — this curve is monotonic and one-directional.")}
            </p>
          </div>
          <div className="mech-spec">
            <SpecRow label={L("总供应量", "Total Supply")}  value="1,000,000,000 FOOTBALL" mono />
            <SpecRow label={L("发射方式", "Launch")}  value={L("flap.sh 启动板", "flap.sh launchpad")} mono />
            <SpecRow label={L("小数位", "Decimals")}    value="18" mono />
            <SpecRow label={L("标准", "Standard")}      value="BEP-20" mono />
            <SpecRow label={L("交易税", "Trading Tax")}    value={L("买 4% / 卖 4% → BNB → 金库", "Buy 4% / Sell 4% → BNB → Treasury")} mono accent="accent" />
            <SpecRow label={L("普通转账", "Plain Transfers")}  value={L("免税（转账 / 买包 / 曲线交易）", "Tax-free (transfers / pack opens / curve trades)")} mono />
            <SpecRow label={L("增发函数", "Mint Function")}  value={L("无", "None")} mono accent="fire" />
            <SpecRow label={L("团队预留", "Team Allocation")}  value="0" mono accent="accent" />
            <SpecRow label={L("销毁地址", "Burn Address")}  value={L("0x…dEaD（转入即销毁）", "0x…dEaD (transfer = burn)")} mono accent="fire" />
            <SpecRow label={L("网络", "Network")}      value={L("BSC 主网 · chainId 56", "BSC Mainnet · chainId 56")} mono />
          </div>
        </div>
      </MechSection>

      <MechSection id="phases" num="02" title={L("两个阶段，互不重叠", "Two Phases, Never Overlapping")} subtitle={L("开包窗口 → 曲线交易", "Pack Window → Curve Trading")}>
        <p className="mech-prose">
          {L("协议对每个国家以两个严格顺序的阶段运行。开包窗口用 FOOTBALL 分发初始供应，每国最多 18,000 个国家包、每包铸造 1 枚国家代币。只要开包仍在进行，曲线就无法交易。阶段边界由 ",
            "The protocol runs each country through two strictly sequential Phases. The Pack Window distributes the initial supply for FOOTBALL: up to 18,000 Country Packs per country, each pack minting 1 Country Token. As long as Open Packs is still running, the curve cannot trade. The Phase boundary is enforced on-chain by ")}<code className="inline-code">activateCountry()</code>{L(" —— 满 18,000 包、或开窗满 7 天后，任何人都可调用它把该国翻入第二阶段。",
            " — once 18,000 packs are sold, or 7 days after the window opens, anyone can call it to flip that country into the second Phase.")}
        </p>
        <PhaseDiagram />
      </MechSection>

      <MechSection id="curve" num="03" title={L("联合曲线", "Bonding Curves")} subtitle={L("虚拟储备 XYK · 192 条独立合约", "Virtual-Reserve XYK · 192 independent contracts")}>
        <div className="mech-cols">
          <div>
            <p>
              {L("192 条曲线是 192 个", "The 192 curves are 192 ")}<span className="f-display-it" style={{color:"var(--fg)"}}>{L("独立部署", "independently deployed")}</span>{L("的合约 —— 48 条国家曲线 + 144 条球员曲线（48 国 × 队长/巨星/新星）。每条都是带硬性渐近线的虚拟储备 XYK，价格函数为 ",
              " contracts — 48 Country curves + 144 Player curves (48 countries × Captain / Best / Rookie). Each is a Virtual-Reserve XYK with a hard Asymptote, with the price function ")}<code className="inline-code">{L("P = (虚拟储备 + 真实储备) / (渐近线 − 流通量)", "P = (Virtual Reserve + Real Reserve) / (Asymptote − Circulating Supply)")}</code>.
            </p>
            <p>
              {L("渐近线 ", "The Asymptote ")}<code className="inline-code">A</code>{L(" 是代币数量上限：国家代币 20,000，球员代币队长 / 巨星 / 新星分别为 1,500 / 500 / 2,500。虚拟储备 = ",
              " is the cap on token count: 20,000 for Country Tokens, and 1,500 / 500 / 2,500 for Captain / Best / Rookie Player Tokens respectively. Virtual Reserve = ")}<code className="inline-code">A × k</code>{L("，把开盘价精确固定在开包等价。此后价格随流通量单调上升，当流通量 → A 时趋于无穷 —— 渐近线在数学上不可达。",
              ", which pins the opening price exactly at pack-open parity. From there the price rises monotonically with Circulating Supply, tending to infinity as Circulating Supply → A — the Asymptote is mathematically unreachable.")}
            </p>
            <p>
              {L("每一笔曲线买入与卖出都收 ", "Every curve buy and sell is charged a ")}<code className="inline-code">5%</code>{L(" 手续费，这笔 FOOTBALL 直接转入销毁地址。买入 95% 的净额进入曲线储备并铸造代币；卖出则销毁曲线代币、按储备返还 FOOTBALL。",
              " fee, and that FOOTBALL goes straight to the burn address. On a buy, the 95% net amount enters the curve Reserve and mints tokens; on a sell, curve tokens are burned and FOOTBALL is returned out of the Reserve.")}
            </p>
          </div>
          <CurveDiagram />
        </div>
      </MechSection>

      <MechSection id="treasury" num="04" title={L("金库与分红", "Treasury & Dividends")} subtitle={L("4% 交易税 → 回购 + 分红", "4% trading tax → Buyback + Dividends")} highlight>
        <div className="mech-cols">
          <div>
            <p>
              {L("FOOTBALL 代币 4% 的交易税自动换成 BNB，打进", "The FOOTBALL token's 4% trading tax is automatically swapped into BNB and sent to the ")}<code className="inline-code">PitchTreasury</code>{L(" 金库合约（金库已部署在 BSC 主网）。任何人都可调用 ", " Treasury contract (the Treasury is already deployed on BSC Mainnet). Anyone can call ")}<code className="inline-code">distribute()</code>{L("，把每一笔进账拆成两份：", " to split each incoming amount into two parts:")}
            </p>
            <ul className="mech-list">
              <li>
                <span className="f-mono" style={{color:"var(--bull)"}}>{L("50% · 冠军储备", "50% · Champion Reserve")}</span>{L(" —— 用于回购 FOOTBALL：内盘（flap Portal）、外盘（PancakeSwap）或手动兜底通道。买回的 FOOTBALL 留在金库。",
                " — used to buy back FOOTBALL: on the internal market (flap Portal), the external market (PancakeSwap), or a manual fallback channel. The bought-back FOOTBALL stays in the Treasury.")}
              </li>
              <li>
                <span className="f-mono" style={{color:"var(--accent)"}}>{L("50% · 持包人分红", "50% · Pack-Holder Dividends")}</span>{L(" —— 按每个地址买过的国家包数量加权（MasterChef 会计），BNB 随时可在金库",
                " — weighted by the number of Country Packs each address has bought (MasterChef accounting); the BNB can be claimed from the Treasury at any time via ")}<code className="inline-code">claim()</code>{L(" 领取。", ".")}
              </li>
            </ul>
            <p>
              {L("分红那一份里会先扣一小撮（默认 1%、上限 5%）给球员包的 Chainlink VRF 充值 —— consumer 的 BNB 余额达标后自动停扣。还没有人买包时，这部分分红并入冠军储备，不浪费。",
                "A small slice is skimmed off the Dividends share first (1% by default, capped at 5%) to top up the Chainlink VRF for Player Packs — the skim stops automatically once the consumer's BNB balance is sufficient. When no one has bought packs yet, this slice is rolled into the Champion Reserve so nothing is wasted.")}
            </p>
            <p>
              {L("金库的紧急取款受 ", "The Treasury's Emergency Withdraw is subject to a ")}<code className="inline-code">{L("24 小时冷却", "24-hour cooldown")}</code>{L("约束：dev 发起后须等满 24 小时才能执行 —— 给所有人留出反应时间。",
              ": after the dev initiates it, a full 24 hours must pass before it can execute — leaving everyone time to react.")}
            </p>
          </div>
          <TaxFlowDiagram />
        </div>

        <div className="hook-spec">
          <SpecRow label={L("金库合约", "Treasury Contract")} value={L("PitchTreasury · BSC 已部署", "PitchTreasury · deployed on BSC")} mono accent="accent" />
          <SpecRow label={L("税收入", "Tax Revenue")} value={L("FOOTBALL 4% 交易税 → BNB", "FOOTBALL 4% trading tax → BNB")} mono />
          <SpecRow label={L("冠军储备", "Champion Reserve")} value={L("50% → 回购 FOOTBALL（内盘 / 外盘）", "50% → Buyback FOOTBALL (internal / external market)")} mono />
          <SpecRow label={L("分红", "Dividends")} value={L("50% → 买包人，按包数加权", "50% → pack buyers, weighted by pack count")} mono accent="accent" />
          <SpecRow label={L("VRF 滴灌", "VRF Drip")} value={L("分红中扣 1%（上限 5%）充值 VRF", "1% skimmed from Dividends (capped 5%) to fund VRF")} mono />
          <SpecRow label={L("分红领取", "Dividend Claim")} value={L("claim() · BNB 随时可领", "claim() · BNB claimable anytime")} mono accent="accent" />
        </div>
      </MechSection>

      <MechSection id="burn" num="05" title={L("销毁飞轮", "The Burn Flywheel")} subtitle={L("每笔交易都减少总供应量", "Every trade shrinks Total Supply")}>
        <p className="mech-prose">
          {L("销毁是系统中唯一的通缩力量。它有两个来源：买国家包时立即销毁包价的 5%；以及 192 条曲线上的每一笔买入 / 卖出，都把流入 FOOTBALL 的 5% 转入销毁地址。随着时间推移，流通供应量 ",
            "The Burn is the only deflationary force in the system. It has two sources: buying a Country Pack immediately burns 5% of the pack price; and every buy and sell across the 192 curves sends 5% of the inbound FOOTBALL to the burn address. Over time, Circulating Supply ")}<span className="f-display-it" style={{color:"var(--fg)"}}>{L("单调递减", "decreases monotonically")}</span>.
        </p>
        <FlywheelDiagram />
      </MechSection>

      <MechSection id="vrf" num="06" title={L("球员包随机性", "Player Pack Randomness")} subtitle={L("Chainlink VRF v2.5 · 直接付费", "Chainlink VRF v2.5 · direct funding")}>
        <p className="mech-prose">
          {L("球员包从每国 150 队长、50 巨星、250 新星的受限池中抽取 —— 共 450 包。角色通过单个 VRF 随机字在链上选定，配额在领取时原子扣减。每包铸造 10 枚球员代币。VRF 采用 ",
            "Player Packs draw from a capped pool of 150 Captains, 50 Bests, and 250 Rookies per country — 450 packs in total. Roles are selected on-chain from a single VRF random word, and quotas are decremented atomically at claim time. Each pack mints 10 Player Tokens. The VRF uses ")}<code className="inline-code">{L("v2.5 直接付费", "v2.5 direct funding")}</code>{L("模式：合约用自身 BNB 余额付费，无需订阅、无需管理 LINK —— 这笔 BNB 由金库分红滴灌持续补充。代币不在 VRF 回调里铸造，而在用户调用 ",
            " mode: the contract pays from its own BNB balance, with no subscription and no LINK to manage — that BNB is continuously replenished by the Treasury's Dividend drip. Tokens are not minted in the VRF callback, but when the user calls ")}<code className="inline-code">claim()</code>{L("时铸造，这既防止回调重入，也让卡住的请求可在 24 小时后安全取回国家代币。",
            ", which both prevents callback reentrancy and lets a stuck request safely reclaim its Country Token after 24 hours.")}
        </p>
        <VRFDiagram />
      </MechSection>

      <section className="mech-footer-cta">
        <div>
          <div className="eyebrow">{L("机制说明完", "End of mechanics")}</div>
          <h2 className="f-display" style={{fontSize:56, lineHeight:1, margin:"12px 0 24px", letterSpacing:"-0.02em"}}>
            {L("准备好开一包了吗？", "Ready to open a pack?")}
          </h2>
        </div>
        <div style={{display:"flex", gap:12}}>
          <button className="btn btn-primary" onClick={()=>setRoute({name:"pack"})}>{L("开一包", "Open a Pack")}</button>
          <button className="btn" onClick={()=>setRoute({name:"markets"})}>{L("浏览市场", "Browse Markets")}</button>
        </div>
      </section>

      <Footer setRoute={setRoute} />
    </main>
  );
};

const SECTIONS = [
  { id: "token",    label: L("代币（FOOTBALL）", "The Token (FOOTBALL)") },
  { id: "phases",   label: L("两个阶段", "Two Phases") },
  { id: "curve",    label: L("联合曲线", "Bonding Curves") },
  { id: "treasury", label: L("金库与分红", "Treasury & Dividends") },
  { id: "burn",     label: L("销毁飞轮", "Burn Flywheel") },
  { id: "vrf",      label: L("球员 VRF", "Player VRF") },
];

const MechSection = ({ id, num, title, subtitle, children, highlight }) => (
  <section id={id} className={"mech-section " + (highlight ? "is-highlight" : "")}>
    <div className="mech-section-head">
      <div className="mech-section-num f-display-it">{num}</div>
      <div className="mech-section-meta">
        <div className="eyebrow">{subtitle}</div>
        <h2 className="mech-section-title f-display">{title}</h2>
      </div>
    </div>
    <div className="mech-section-body">{children}</div>
  </section>
);

const SpecRow = ({ label, value, mono, accent }) => (
  <div className="spec-row">
    <span className="spec-label">{label}</span>
    <span className={"spec-value " + (mono ? "f-mono " : "") + (accent === "fire" ? "is-fire" : accent === "accent" ? "is-accent" : "")}>{value}</span>
  </div>
);

/* ===================== DIAGRAMS ===================== */

const PhaseDiagram = () => (
  <div className="phase-diagram">
    <div className="phase-diagram-track">
      <div className="phase-diagram-segment phase-1">
        <div className="phase-diagram-segment-head">
          <span className="eyebrow">{L("阶段 I", "Phase I")}</span>
          <span className="pill accent"><span className="pill-dot"/>{L("进行中", "Live")}</span>
        </div>
        <div className="phase-diagram-segment-title f-display">{L("开包窗口", "Pack Window")}</div>
        <ul className="phase-diagram-bullets">
          <li>{L("每国最多 18,000 个国家包 · 48 国共 864,000 包", "Up to 18,000 Country Packs per country · 864,000 packs across 48 countries")}</li>
          <li>{L("每个国家包用 FOOTBALL 购买，铸造 1 枚国家代币", "Each Country Pack is bought with FOOTBALL and mints 1 Country Token")}</li>
          <li>{L("包价 5% 立即销毁，95% 注入该国曲线储备", "5% of the pack price is burned instantly, 95% seeds that country's curve Reserve")}</li>
          <li>{L("封盘后每国 450 个球员包，用国家代币支付", "After the window closes, 450 Player Packs per country, paid in Country Tokens")}</li>
          <li>{L("窗口逐国关闭：满 18,000 包 或 开窗满 7 天", "The window closes per country: at 18,000 packs, or 7 days after opening")}</li>
        </ul>
      </div>

      <div className="phase-diagram-divider">
        <div className="phase-diagram-divider-line" />
        <div className="phase-diagram-divider-label f-mono">
          activateCountry()
        </div>
      </div>

      <div className="phase-diagram-segment phase-2">
        <div className="phase-diagram-segment-head">
          <span className="eyebrow">{L("阶段 II", "Phase II")}</span>
          <span className="pill bull"><span className="pill-dot"/>{L("逐国", "Per country")}</span>
        </div>
        <div className="phase-diagram-segment-title f-display">{L("曲线交易", "Curve Trading")}</div>
        <ul className="phase-diagram-bullets">
          <li>{L("192 条联合曲线逐国激活，开放买卖", "The 192 bonding curves activate country by country, opening for buying and selling")}</li>
          <li>{L("P = (虚拟储备 + 真实储备) / (渐近线 − 流通量)", "P = (Virtual Reserve + Real Reserve) / (Asymptote − Circulating Supply)")}</li>
          <li>{L("开包窗口注入的 FOOTBALL 成为曲线初始储备", "FOOTBALL injected during the Pack Window becomes the curve's initial Reserve")}</li>
          <li>{L("每笔买入 / 卖出销毁 5% 流入的 FOOTBALL", "Every buy and sell burns 5% of the inbound FOOTBALL")}</li>
          <li>{L("无到期。曲线永久运行，直到流通量 → 渐近线", "No expiry. The curves run forever, until Circulating Supply → Asymptote")}</li>
        </ul>
      </div>
    </div>
  </div>
);

const CurveDiagram = () => {
  // P = (VIRTUAL + reserve) / (A - S) — 虚拟储备 XYK；归一化 A=100 仅示意形状。
  const A = 100, VIRT = 100;
  const pts = [];
  for (let s = 0; s <= 98; s += 0.5) {
    const reserve = s * 6.555;
    const p = (VIRT + reserve) / (A - s);
    pts.push([s, Math.min(p, 60)]);
  }
  const W = 460, H = 280, PAD = 32;
  const xs = s => PAD + (s / 100) * (W - 2*PAD);
  const ys = p => H - PAD - (Math.min(p, 60) / 60) * (H - 2*PAD);
  const path = pts.map(([s,p], i) => `${i===0?"M":"L"}${xs(s).toFixed(1)},${ys(p).toFixed(1)}`).join(" ");
  return (
    <svg className="curve-diagram" viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
      {[0.25, 0.5, 0.75].map(t => (
        <line key={"h"+t} x1={PAD} y1={PAD + t*(H-2*PAD)} x2={W-PAD} y2={PAD + t*(H-2*PAD)} stroke="var(--line)" strokeDasharray="2 4"/>
      ))}
      <line x1={PAD} y1={H-PAD} x2={W-PAD} y2={H-PAD} stroke="var(--line-2)"/>
      <line x1={PAD} y1={PAD} x2={PAD} y2={H-PAD} stroke="var(--line-2)"/>
      <line x1={xs(100)} y1={PAD} x2={xs(100)} y2={H-PAD} stroke="var(--fire)" strokeDasharray="3 3" opacity="0.6"/>
      <text x={xs(100)-4} y={PAD+12} textAnchor="end" className="curve-axis-fire">{L("A = 20,000 · 渐近线", "A = 20,000 · Asymptote")}</text>
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2"/>
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="6" opacity="0.18"/>
      <text x={PAD} y={H-12} className="curve-axis">{L("流通量 →", "Circulating Supply →")}</text>
      <text x={PAD} y={PAD-12} className="curve-axis">{L("价格", "Price")}</text>
      <text x={xs(18)} y={ys((VIRT + 18*6.555)/(A-18))-8} className="curve-label">{L("开包窗口封盘", "Pack Window closes")}</text>
      <text x={xs(85)} y={ys((VIRT + 85*6.555)/(A-85))-10} className="curve-label">{L("抛物线区", "Parabolic zone")}</text>
    </svg>
  );
};

const TaxFlowDiagram = () => (
  <div className="hook-diagram">
    <div className="hook-node hook-node-user">
      <div className="eyebrow">{L("交易者", "Trader")}</div>
      <div className="hook-node-label f-mono">{L("买 / 卖 FOOTBALL", "Buy / Sell FOOTBALL")}</div>
    </div>
    <div className="hook-arrow"><span>1</span></div>
    <div className="hook-node hook-node-pm">
      <div className="eyebrow">{L("FOOTBALL 代币", "FOOTBALL Token")}</div>
      <div className="hook-node-label f-mono">{L("收 4% 税 → 换成 BNB", "4% tax charged → swapped into BNB")}</div>
    </div>
    <div className="hook-arrow"><span>2</span></div>
    <div className="hook-node hook-node-hook">
      <div className="eyebrow">{L("PitchTreasury 金库", "PitchTreasury Treasury")}</div>
      <div className="hook-node-label f-display" style={{fontSize:18}}>distribute()</div>
      <div className="hook-node-sub f-mono">{L("回购 + 分红", "Buyback + Dividends")}</div>
      <div className="hook-burn-glow" />
    </div>
    <div className="hook-arrow hook-arrow-down"><span>3</span></div>
    <div className="hook-node hook-node-burn">
      <div className="eyebrow" style={{color:"var(--accent)"}}>{L("50% 冠军回购 · 50% 持包人分红", "50% Champion Buyback · 50% Pack-Holder Dividends")}</div>
      <div className="hook-node-label f-mono">{L("分红按买包数量加权发放", "Dividends paid out weighted by pack count")}</div>
    </div>
  </div>
);

const FlywheelDiagram = () => (
  <div className="flywheel">
    {[
      { label: L("交易", "Trade"),       sub: L("买包 / 曲线买卖", "Pack opens / curve trades"),       color: "var(--accent)" },
      { label: L("收 5%", "5% Charged"), sub: L("包价或曲线流入的 5%", "5% of pack price or curve inflow"),   color: "var(--fg)" },
      { label: L("销毁", "Burn"),        sub: L("FOOTBALL 转入销毁地址", "FOOTBALL sent to burn address"), color: "var(--fire)" },
      { label: L("稀缺度 ↑", "Scarcity ↑"),  sub: L("流通 FOOTBALL 下降", "Circulating FOOTBALL falls"),    color: "var(--bull)" },
      { label: L("需求 ↑", "Demand ↑"),    sub: L("曲线价格上涨", "Curve price rises"),          color: "var(--accent)" },
    ].map((s, i, arr) => (
      <React.Fragment key={i}>
        <div className="flywheel-step">
          <div className="flywheel-step-num f-mono">0{i+1}</div>
          <div className="flywheel-step-dot" style={{background:s.color}} />
          <div className="flywheel-step-label f-display">{s.label}</div>
          <div className="flywheel-step-sub f-mono">{s.sub}</div>
        </div>
        {i < arr.length-1 && <div className="flywheel-arrow">→</div>}
      </React.Fragment>
    ))}
  </div>
);

const VRFDiagram = () => (
  <div className="vrf-diagram">
    {["openPlayerPacks()", L("请求 VRF v2.5", "Request VRF v2.5"), "fulfillRandomWords", L("claim() 抽取角色", "claim() draws role"), L("铸造 10 枚/包", "Mint 10 per pack")].map((step, i) => (
      <React.Fragment key={i}>
        <div className="vrf-step">
          <div className="vrf-step-num f-mono">{String(i+1).padStart(2,"0")}</div>
          <div className="vrf-step-label f-mono">{step}</div>
        </div>
        {i < 4 && <div className="vrf-divider"/>}
      </React.Fragment>
    ))}
  </div>
);

window.Mechanics = Mechanics;
