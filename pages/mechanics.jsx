// FOOTBALL — 机制说明页（协议文档）
const Mechanics = ({ setRoute }) => {
  return (
    <main className="match-page mech">

      <section className="mech-hero">
        <div className="mech-hero-top">
          <div className="eyebrow">机制 · v1.0 · 最后更新 2026 年 5 月 22 日</div>
          <div className="eyebrow">阅读时长 · 8 分钟</div>
        </div>
        <h1 className="mech-h1 f-display">
          一个对谁会夺冠<span style={{color:"var(--accent)"}}>毫无立场</span>的协议。
        </h1>
        <p className="mech-lede">
          FOOTBALL 是建在 BSC 上的闭环锦标赛市场。FOOTBALL 代币进，国家与球员代币出。
          192 条联合曲线没有治理、没有管理员、没有升级路径 —— 它们不挑选赢家。
          代币 4% 的交易税单独流入金库，自动回购 FOOTBALL，并把分红发还给买过包的人。
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

      <MechSection id="token" num="01" title="代币" subtitle="FOOTBALL · BEP-20 · flap.sh 发射">
        <div className="mech-cols">
          <div>
            <p>
              <span className="f-mono" style={{color:"var(--accent)"}}>FOOTBALL</span> 是协议唯一接受的资产，
              通过 <span className="f-mono">flap.sh</span> 启动板发射 —— 总量固定 10 亿枚，没有增发函数、
              没有团队预留、没有解锁计划。供应量在发射时一次性铸造完毕。
            </p>
            <p>
              FOOTBALL 是一个 4/4 税代币：在 flap 内盘联合曲线、以及毕业后的 PancakeSwap 上，
              每笔买入与卖出各收 4% 税，自动换成 BNB 打进金库合约（见 <code className="inline-code">04 · 金库与分红</code>）。
              钱包之间的普通转账、以及转入本协议合约（买包、曲线交易）<span className="f-display-it" style={{color:"var(--fg)"}}>不收税</span>。
            </p>
            <p>
              作用于供应量的唯一力量是销毁。FOOTBALL 一旦被转入销毁地址便无法重建 —— 这条曲线单调、单向。
            </p>
          </div>
          <div className="mech-spec">
            <SpecRow label="总供应量"  value="1,000,000,000 FOOTBALL" mono />
            <SpecRow label="发射方式"  value="flap.sh 启动板" mono />
            <SpecRow label="小数位"    value="18" mono />
            <SpecRow label="标准"      value="BEP-20" mono />
            <SpecRow label="交易税"    value="买 4% / 卖 4% → BNB → 金库" mono accent="accent" />
            <SpecRow label="普通转账"  value="免税（转账 / 买包 / 曲线交易）" mono />
            <SpecRow label="增发函数"  value="无" mono accent="fire" />
            <SpecRow label="团队预留"  value="0" mono accent="accent" />
            <SpecRow label="销毁地址"  value="0x…dEaD（转入即销毁）" mono accent="fire" />
            <SpecRow label="网络"      value="BSC 主网 · chainId 56" mono />
          </div>
        </div>
      </MechSection>

      <MechSection id="phases" num="02" title="两个阶段，互不重叠" subtitle="开包窗口 → 曲线交易">
        <p className="mech-prose">
          协议对每个国家以两个严格顺序的阶段运行。开包窗口用 FOOTBALL 分发初始供应，
          每国最多 18,000 个国家包、每包铸造 1 枚国家代币。只要开包仍在进行，曲线就无法交易。
          阶段边界由 <code className="inline-code">activateCountry()</code> 在链上强制执行 ——
          满 18,000 包、或开窗满 7 天后，任何人都可调用它把该国翻入第二阶段。
        </p>
        <PhaseDiagram />
      </MechSection>

      <MechSection id="curve" num="03" title="联合曲线" subtitle="虚拟储备 XYK · 192 条独立合约">
        <div className="mech-cols">
          <div>
            <p>
              192 条曲线是 192 个<span className="f-display-it" style={{color:"var(--fg)"}}>独立部署</span>的合约
              —— 48 条国家曲线 + 144 条球员曲线（48 国 × 队长/巨星/新星）。
              每条都是带硬性渐近线的虚拟储备 XYK，价格函数为
              <code className="inline-code">P = (虚拟储备 + 真实储备) / (渐近线 − 流通量)</code>。
            </p>
            <p>
              渐近线 <code className="inline-code">A</code> 是代币数量上限：国家代币 20,000，
              球员代币队长 / 巨星 / 新星分别为 1,500 / 500 / 2,500。
              虚拟储备 = <code className="inline-code">A × k</code>，把开盘价精确固定在开包等价。
              此后价格随流通量单调上升，当流通量 → A 时趋于无穷 —— 渐近线在数学上不可达。
            </p>
            <p>
              每一笔曲线买入与卖出都收 <code className="inline-code">5%</code> 手续费，
              这笔 FOOTBALL 直接转入销毁地址。买入 95% 的净额进入曲线储备并铸造代币；
              卖出则销毁曲线代币、按储备返还 FOOTBALL。
            </p>
          </div>
          <CurveDiagram />
        </div>
      </MechSection>

      <MechSection id="treasury" num="04" title="金库与分红" subtitle="4% 交易税 → 回购 + 分红" highlight>
        <div className="mech-cols">
          <div>
            <p>
              FOOTBALL 代币 4% 的交易税自动换成 BNB，打进
              <code className="inline-code">PitchTreasury</code> 金库合约（金库已部署在 BSC 主网）。
              任何人都可调用 <code className="inline-code">distribute()</code>，把每一笔进账拆成两份：
            </p>
            <ul className="mech-list">
              <li>
                <span className="f-mono" style={{color:"var(--bull)"}}>50% · 冠军储备</span> ——
                用于回购 FOOTBALL：内盘（flap Portal）、外盘（PancakeSwap）或手动兜底通道。
                买回的 FOOTBALL 留在金库。
              </li>
              <li>
                <span className="f-mono" style={{color:"var(--accent)"}}>50% · 持包人分红</span> ——
                按每个地址买过的国家包数量加权（MasterChef 会计），BNB 随时可在金库
                <code className="inline-code">claim()</code> 领取。
              </li>
            </ul>
            <p>
              分红那一份里会先扣一小撮（默认 1%、上限 5%）给球员包的 Chainlink VRF 充值 ——
              consumer 的 BNB 余额达标后自动停扣。还没有人买包时，这部分分红并入冠军储备，不浪费。
            </p>
            <p>
              金库的紧急取款受 <code className="inline-code">24 小时冷却</code>约束：
              dev 发起后须等满 24 小时才能执行 —— 给所有人留出反应时间。
            </p>
          </div>
          <TaxFlowDiagram />
        </div>

        <div className="hook-spec">
          <SpecRow label="金库合约" value="PitchTreasury · BSC 已部署" mono accent="accent" />
          <SpecRow label="税收入" value="FOOTBALL 4% 交易税 → BNB" mono />
          <SpecRow label="冠军储备" value="50% → 回购 FOOTBALL（内盘 / 外盘）" mono />
          <SpecRow label="分红" value="50% → 买包人，按包数加权" mono accent="accent" />
          <SpecRow label="VRF 滴灌" value="分红中扣 1%（上限 5%）充值 VRF" mono />
          <SpecRow label="分红领取" value="claim() · BNB 随时可领" mono accent="accent" />
        </div>
      </MechSection>

      <MechSection id="burn" num="05" title="销毁飞轮" subtitle="每笔交易都减少总供应量">
        <p className="mech-prose">
          销毁是系统中唯一的通缩力量。它有两个来源：买国家包时立即销毁包价的 5%；
          以及 192 条曲线上的每一笔买入 / 卖出，都把流入 FOOTBALL 的 5% 转入销毁地址。
          随着时间推移，流通供应量 <span className="f-display-it" style={{color:"var(--fg)"}}>单调递减</span>。
        </p>
        <FlywheelDiagram />
      </MechSection>

      <MechSection id="vrf" num="06" title="球员包随机性" subtitle="Chainlink VRF v2.5 · 直接付费">
        <p className="mech-prose">
          球员包从每国 150 队长、50 巨星、250 新星的受限池中抽取 —— 共 450 包。
          角色通过单个 VRF 随机字在链上选定，配额在领取时原子扣减。每包铸造 10 枚球员代币。
          VRF 采用 <code className="inline-code">v2.5 直接付费</code>模式：合约用自身 BNB 余额付费，
          无需订阅、无需管理 LINK —— 这笔 BNB 由金库分红滴灌持续补充。
          代币不在 VRF 回调里铸造，而在用户调用 <code className="inline-code">claim()</code> 时铸造，
          这既防止回调重入，也让卡住的请求可在 24 小时后安全取回国家代币。
        </p>
        <VRFDiagram />
      </MechSection>

      <section className="mech-footer-cta">
        <div>
          <div className="eyebrow">机制说明完</div>
          <h2 className="f-display" style={{fontSize:56, lineHeight:1, margin:"12px 0 24px", letterSpacing:"-0.02em"}}>
            准备好开一包了吗？
          </h2>
        </div>
        <div style={{display:"flex", gap:12}}>
          <button className="btn btn-primary" onClick={()=>setRoute({name:"pack"})}>开一包</button>
          <button className="btn" onClick={()=>setRoute({name:"markets"})}>浏览市场</button>
        </div>
      </section>

      <Footer setRoute={setRoute} />
    </main>
  );
};

const SECTIONS = [
  { id: "token",    label: "代币（FOOTBALL）" },
  { id: "phases",   label: "两个阶段" },
  { id: "curve",    label: "联合曲线" },
  { id: "treasury", label: "金库与分红" },
  { id: "burn",     label: "销毁飞轮" },
  { id: "vrf",      label: "球员 VRF" },
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
          <span className="eyebrow">阶段 I</span>
          <span className="pill accent"><span className="pill-dot"/>进行中</span>
        </div>
        <div className="phase-diagram-segment-title f-display">开包窗口</div>
        <ul className="phase-diagram-bullets">
          <li>每国最多 18,000 个国家包 · 48 国共 864,000 包</li>
          <li>每个国家包用 FOOTBALL 购买，铸造 1 枚国家代币</li>
          <li>包价 5% 立即销毁，95% 注入该国曲线储备</li>
          <li>封盘后每国 450 个球员包，用国家代币支付</li>
          <li>窗口逐国关闭：满 18,000 包 或 开窗满 7 天</li>
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
          <span className="eyebrow">阶段 II</span>
          <span className="pill bull"><span className="pill-dot"/>逐国</span>
        </div>
        <div className="phase-diagram-segment-title f-display">曲线交易</div>
        <ul className="phase-diagram-bullets">
          <li>192 条联合曲线逐国激活，开放买卖</li>
          <li>P = (虚拟储备 + 真实储备) / (渐近线 − 流通量)</li>
          <li>开包窗口注入的 FOOTBALL 成为曲线初始储备</li>
          <li>每笔买入 / 卖出销毁 5% 流入的 FOOTBALL</li>
          <li>无到期。曲线永久运行，直到流通量 → 渐近线</li>
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
      <text x={xs(100)-4} y={PAD+12} textAnchor="end" className="curve-axis-fire">A = 20,000 · 渐近线</text>
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2"/>
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="6" opacity="0.18"/>
      <text x={PAD} y={H-12} className="curve-axis">流通量 →</text>
      <text x={PAD} y={PAD-12} className="curve-axis">价格</text>
      <text x={xs(18)} y={ys((VIRT + 18*6.555)/(A-18))-8} className="curve-label">开包窗口封盘</text>
      <text x={xs(85)} y={ys((VIRT + 85*6.555)/(A-85))-10} className="curve-label">抛物线区</text>
    </svg>
  );
};

const TaxFlowDiagram = () => (
  <div className="hook-diagram">
    <div className="hook-node hook-node-user">
      <div className="eyebrow">交易者</div>
      <div className="hook-node-label f-mono">买 / 卖 FOOTBALL</div>
    </div>
    <div className="hook-arrow"><span>1</span></div>
    <div className="hook-node hook-node-pm">
      <div className="eyebrow">FOOTBALL 代币</div>
      <div className="hook-node-label f-mono">收 4% 税 → 换成 BNB</div>
    </div>
    <div className="hook-arrow"><span>2</span></div>
    <div className="hook-node hook-node-hook">
      <div className="eyebrow">PitchTreasury 金库</div>
      <div className="hook-node-label f-display" style={{fontSize:18}}>distribute()</div>
      <div className="hook-node-sub f-mono">回购 + 分红</div>
      <div className="hook-burn-glow" />
    </div>
    <div className="hook-arrow hook-arrow-down"><span>3</span></div>
    <div className="hook-node hook-node-burn">
      <div className="eyebrow" style={{color:"var(--accent)"}}>50% 冠军回购 · 50% 持包人分红</div>
      <div className="hook-node-label f-mono">分红按买包数量加权发放</div>
    </div>
  </div>
);

const FlywheelDiagram = () => (
  <div className="flywheel">
    {[
      { label: "交易",      sub: "买包 / 曲线买卖",      color: "var(--accent)" },
      { label: "收 5%",     sub: "包价或曲线流入的 5%",   color: "var(--fg)" },
      { label: "销毁",      sub: "FOOTBALL 转入销毁地址", color: "var(--fire)" },
      { label: "稀缺度 ↑",  sub: "流通 FOOTBALL 下降",    color: "var(--bull)" },
      { label: "需求 ↑",    sub: "曲线价格上涨",          color: "var(--accent)" },
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
    {["openPlayerPacks()", "请求 VRF v2.5", "fulfillRandomWords", "claim() 抽取角色", "铸造 10 枚/包"].map((step, i) => (
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
