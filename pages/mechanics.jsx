// FOOTBALL — Mechanics page (editorial protocol document)
const Mechanics = ({ setRoute }) => {
  return (
    <main className="match-page mech">

      <section className="mech-hero">
        <div className="mech-hero-top">
          <div className="eyebrow">机制 · v1.0 · 最后更新 2026 年 5 月 18 日</div>
          <div className="eyebrow">阅读时长 · 8 分钟</div>
        </div>
        <h1 className="mech-h1 f-display">
          一个对谁会夺冠<span style={{color:"var(--accent)"}}>毫无立场</span>的协议。
        </h1>
        <p className="mech-lede">
          FOOTBALL 是一个闭环锦标赛市场。一种代币进，一种代币出。每笔 swap 销毁 5% 流入的 FOOTBALL。
          没有治理、没有管理员、没有升级路径。协议不挑选赢家 — 它只确保每笔交易都是终局。
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

      <MechSection id="token" num="01" title="代币" subtitle="FOOTBALL · BEP-20 · 可销毁">
        <div className="mech-cols">
          <div>
            <p>
              <span className="f-mono" style={{color:"var(--accent)"}}>FOOTBALL</span> 是协议唯一接受的资产。
              它是一个没有增发函数的 BEP-20 代币 — 全部 960,000 供应量在构造函数中一次性铸造。没有团队份额、
              没有解锁计划、没有管理员密钥。协议「能增发更多 FOOTBALL」只在一种意义上成立：那就是这个操作根本不可能。
            </p>
            <p>
              作用于供应量的唯一力量就是销毁 hook。代币一旦被销毁便无法重建。这条曲线单调、单向。
            </p>
          </div>
          <div className="mech-spec">
            <SpecRow label="总供应量"  value="960,000 FOOTBALL" mono />
            <SpecRow label="小数位"      value="18" mono />
            <SpecRow label="标准"      value="BEP-20 + 可销毁 + Permit" mono />
            <SpecRow label="Permit"        value="EIP-2612（免 gas 授权）" mono />
            <SpecRow label="增发函数" value="—" mono accent="fire" />
            <SpecRow label="团队份额" value="0（部署者 → PancakeSwap LP）" mono accent="accent" />
            <SpecRow label="所有权"         value="已放弃" mono accent="fire" />
            <SpecRow label="基础池"     value="FOOTBALL/BNB · PancakeSwap · 1% 费率" mono />
            <SpecRow label="上线 FDV"    value="6 BNB（约 $15k）" mono />
            <SpecRow label="网络"       value="BSC 主网 · 56" mono />
          </div>
        </div>
      </MechSection>

      <MechSection id="phases" num="02" title="两个阶段，互不重叠" subtitle="开包窗口 → 曲线交易">
        <p className="mech-prose">
          协议对每个国家以两个严格顺序的阶段运行。开包窗口以
          <code className="inline-code">6.9 FOOTBALL/包</code> 分发初始供应，最多 18,000 包。
          只要开包仍在进行，曲线就无法交易。阶段边界由
          <code className="inline-code">activateCountry()</code> 在链上强制执行。
        </p>
        <PhaseDiagram />
      </MechSection>

      <MechSection id="curve" num="03" title="联合曲线" subtitle="虚拟储备 XYK">
        <div className="mech-cols">
          <div>
            <p>
              192 条曲线每一条都是带有硬性渐近线的虚拟储备 XYK。价格函数为
              <code className="inline-code">P = (VIRTUAL + reserve) / (A − S)</code>，
              其中 <code className="inline-code">VIRTUAL = 20,000</code> 设定初始价格，
              <code className="inline-code">A</code> 为渐近线 — 国家代币为 20,000，
              队长 / 巨星 / 新星球员代币分别为 1,500 / 500 / 2,500。
            </p>
            <p>
              无需校准 K — 虚拟储备将开盘价精确固定在开包等价（封盘时 6.9 FOOTBALL/枚）。
              此后价格随供应量单调上升，当 S → A 时趋于无穷。渐近线在数学上不可达。
              大多数国家会在 18,000 到 19,000 之间的某处停下。
            </p>
          </div>
          <CurveDiagram />
        </div>
      </MechSection>

      <MechSection id="hook" num="04" title="PancakeSwap hook" subtitle="beforeSwap · afterSwap · 零路由往返" highlight>
        <div className="mech-cols">
          <div>
            <p>
              这 192 条曲线不是分散的合约。它们是注册在单个 PancakeSwap hook 合约
              <code className="inline-code">FootballCurveHook</code> 上的 192 个池。
              该 hook 掌管每个池的曲线数学、销毁逻辑以及封盘/校准状态。池管理器在每笔 swap 时调用它。
            </p>
            <p>
              关键之处：销毁就发生在交易内部。当用户交易时，<code className="inline-code">beforeSwap</code> 从 swap delta 中提取 5% 手续费，
              并立即调用 <code className="inline-code">FOOTBALL.burn()</code>。
              没有路由跳转。没有第二笔交易。没有 keeper。通缩与交易原子完成。
            </p>
            <p>
              这正是 PancakeSwap 的 hook 机制所能实现、而旧版 AMM 做不到的。在早期 AMM 中，
              协议费必须在 swap 之后由外部合约提取 — 通常累积进国库，再定期批量销毁。
              而在这里，手续费从不离开 swap 这个原子。交易与销毁是同一个事件。
            </p>
          </div>
          <HookDiagram />
        </div>

        <div className="hook-spec">
          <SpecRow label="Hook 权限" value="beforeSwap · beforeAddLiquidity · afterInitialize" mono />
          <SpecRow label="单笔 swap 开销" value="约 21,000 gas" mono />
          <SpecRow label="手续费 delta 编码" value="BeforeSwapDelta（Q.96 定点）" mono />
          <SpecRow label="添加流动性" value="被回滚 — 仅 hook 可向曲线注入流动性" mono accent="fire" />
          <SpecRow label="池初始化" value="锁定为 FOOTBALL / 代币 交易对" mono />
          <SpecRow label="手续费去向" value="100% → FOOTBALL.burn()" mono accent="accent" />
        </div>

        <div className="code-block" style={{marginTop:32}}>
          <div className="code-block-bar">
            <span className="f-mono" style={{color:"var(--fg-3)", fontSize:11}}>FootballCurveHook.sol</span>
            <span className="f-mono" style={{color:"var(--fg-4)", fontSize:11}}>solidity 0.8.24 · cyfrin / spearbit</span>
          </div>
          <pre className="code-block-pre">
{`function beforeSwap(
    address sender,
    PoolKey calldata key,
    IPoolManager.SwapParams calldata params,
    bytes calldata
) external override poolManagerOnly returns (
    bytes4, BeforeSwapDelta, uint24
) {
    PoolId id = key.toId();
    if (!_isOpen(id)) revert CurveSealed();

    uint256 amountIn = uint256(-params.amountSpecified);
    uint256 fee      = (amountIn * FEE_BPS) / 10_000;     // 5%

    // 原子通缩。无国库，无路由往返。
    FOOTBALL.burn(fee);
    emit Burned(id, fee, block.timestamp);

    BeforeSwapDelta delta = toBeforeSwapDelta(
        int128(int256(fee)),                              // 从输入中扣取
        int128(0)
    );

    return (BaseHook.beforeSwap.selector, delta, 0);
}`}
          </pre>
        </div>
      </MechSection>

      <MechSection id="burn" num="05" title="飞轮" subtitle="每笔交易都减少总供应量">
        <p className="mech-prose">
          销毁是系统中唯一的通缩力量。没有回购。没有锁仓供应。192 条曲线上的每一笔交易，
          都会把 5% 流入的 FOOTBALL 投入销毁。随着时间推移，流通供应量
          <span className="f-display-it" style={{color:"var(--fg)"}}>单调递减</span>，
          趋向于零。
        </p>
        <FlywheelDiagram />
      </MechSection>

      <MechSection id="vrf" num="06" title="球员包随机性" subtitle="Chainlink VRF v2.5 · 三阶段结算">
        <p className="mech-prose">
          球员包从每国 150 队长、50 巨星、250 新星的受限池中抽取。角色通过单个 VRF 随机字在链上选定，
          配额在回调中原子扣减。代币不在回调中铸造 — 它们在用户调用
          <code className="inline-code">claim()</code> 时铸造，这既防止了基于回调的重入攻击，
          也让未完成的请求可以安全重试。
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
  { id: "token",  label: "代币（FOOTBALL）" },
  { id: "phases", label: "两个阶段" },
  { id: "curve",  label: "联合曲线" },
  { id: "hook",   label: "PancakeSwap hook" },
  { id: "burn",   label: "销毁飞轮" },
  { id: "vrf",    label: "球员 VRF" },
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
          <li>每国 1,000 个国家包 × 48 国 = 48,000 包</li>
          <li>每个国家包 10 FOOTBALL → 铸造 15 枚国家代币</li>
          <li>每国 450 个球员包，每个用 1 枚国家代币支付</li>
          <li>VRF 按配额分配 队长 / 巨星 / 新星</li>
          <li>窗口逐国关闭：满 7 天 或 售罄</li>
        </ul>
      </div>

      <div className="phase-diagram-divider">
        <div className="phase-diagram-divider-line" />
        <div className="phase-diagram-divider-label f-mono">
          seal()
          <br />
          + calibrate(K)
        </div>
      </div>

      <div className="phase-diagram-segment phase-2">
        <div className="phase-diagram-segment-head">
          <span className="eyebrow">阶段 II</span>
          <span className="pill bull"><span className="pill-dot"/>逐国</span>
        </div>
        <div className="phase-diagram-segment-title f-display">曲线交易</div>
        <ul className="phase-diagram-bullets">
          <li>192 条联合曲线通过 activateCountry() 激活</li>
          <li>P = (VIRTUAL + reserve) / (A − S) — 渐近式</li>
          <li>约 118k FOOTBALL 储备注入每条填满的国家曲线</li>
          <li>每笔买入/卖出销毁 5% 流入的 FOOTBALL</li>
          <li>无到期。曲线永久运行，直到 S → A。</li>
        </ul>
      </div>
    </div>
  </div>
);

const CurveDiagram = () => {
  // P = (VIRTUAL + reserve) / (A - S) — virtual-reserve XYK
  // Modeled with A = 100 supply units, VIRTUAL = 100, reserve growing linearly.
  const A = 100, VIRT = 100;
  const pts = [];
  for (let s = 0; s <= 98; s += 0.5) {
    // reserve scales with supply (each unit deposits ~ pack-equivalent into reserve)
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
      {/* grid */}
      {[0.25, 0.5, 0.75].map(t => (
        <line key={"h"+t} x1={PAD} y1={PAD + t*(H-2*PAD)} x2={W-PAD} y2={PAD + t*(H-2*PAD)} stroke="var(--line)" strokeDasharray="2 4"/>
      ))}
      {/* axes */}
      <line x1={PAD} y1={H-PAD} x2={W-PAD} y2={H-PAD} stroke="var(--line-2)"/>
      <line x1={PAD} y1={PAD} x2={PAD} y2={H-PAD} stroke="var(--line-2)"/>
      {/* asymptote */}
      <line x1={xs(100)} y1={PAD} x2={xs(100)} y2={H-PAD} stroke="var(--fire)" strokeDasharray="3 3" opacity="0.6"/>
      <text x={xs(100)-4} y={PAD+12} textAnchor="end" className="curve-axis-fire">A = 20,000 · 渐近线</text>
      {/* curve */}
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2"/>
      {/* glow */}
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="6" opacity="0.18"/>
      {/* labels */}
      <text x={PAD} y={H-12} className="curve-axis">供应量 →</text>
      <text x={PAD} y={PAD-12} className="curve-axis">价格</text>
      <text x={xs(18)} y={ys((VIRT + 18*6.555)/(A-18))-8} className="curve-label">开包窗口封盘</text>
      <text x={xs(85)} y={ys((VIRT + 85*6.555)/(A-85))-10} className="curve-label">抛物线区</text>
    </svg>
  );
};

const HookDiagram = () => (
  <div className="hook-diagram">
    <div className="hook-node hook-node-user">
      <div className="eyebrow">用户</div>
      <div className="hook-node-label f-mono">swap(FOOTBALL → CTRY)</div>
    </div>
    <div className="hook-arrow"><span>1</span></div>
    <div className="hook-node hook-node-pm">
      <div className="eyebrow">池管理器</div>
      <div className="hook-node-label f-mono">unlock + swap</div>
    </div>
    <div className="hook-arrow"><span>2</span></div>
    <div className="hook-node hook-node-hook">
      <div className="eyebrow">Hook · 0xC0DE…BURN</div>
      <div className="hook-node-label f-display" style={{fontSize:18}}>beforeSwap()</div>
      <div className="hook-node-sub f-mono">提取 5% → FOOTBALL.burn()</div>
      <div className="hook-burn-glow" />
    </div>
    <div className="hook-arrow hook-arrow-down"><span>3</span></div>
    <div className="hook-node hook-node-burn">
      <div className="hook-burn-icon">▲</div>
      <div className="eyebrow" style={{color:"var(--fire)"}}>原子销毁</div>
      <div className="hook-node-label f-mono">−5% FOOTBALL 供应量</div>
    </div>
  </div>
);

const FlywheelDiagram = () => (
  <div className="flywheel">
    {[
      { label: "交易",       sub: "5% 的 FOOTBALL 输入", color: "var(--accent)" },
      { label: "Hook 拦截",  sub: "beforeSwap()",        color: "var(--fg)" },
      { label: "销毁",       sub: "从供应量中扣除手续费",  color: "var(--fire)" },
      { label: "稀缺度 ↑",   sub: "剩余 FOOTBALL 上升",   color: "var(--bull)" },
      { label: "需求 ↑",     sub: "曲线价格上涨",         color: "var(--accent)" },
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
    {["openPack()", "请求 VRF", "fulfillRandomWords", "扣减配额", "用户 claim() → 铸造"].map((step, i) => (
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
