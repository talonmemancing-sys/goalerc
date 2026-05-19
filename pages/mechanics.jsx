// GOAL — Mechanics page (editorial protocol document)
const Mechanics = ({ setRoute }) => {
  return (
    <main className="match-page mech">

      <section className="mech-hero">
        <div className="mech-hero-top">
          <div className="eyebrow">Mechanics · v1.0 · last updated 18 May 2026</div>
          <div className="eyebrow">Read time · 8 min</div>
        </div>
        <h1 className="mech-h1 f-display">
          A protocol with <span style={{color:"var(--accent)"}}>no view</span> on who wins.
        </h1>
        <p className="mech-lede">
          GOAL is a closed-loop tournament market. One token in, one token out. Every swap
          burns 5% of the inbound GOAL. There is no governance, no admin, no upgrade path.
          The protocol does not pick winners — it only enforces that every trade is final.
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

      <MechSection id="token" num="01" title="The token" subtitle="GOAL · ERC-20 · Burnable">
        <div className="mech-cols">
          <div>
            <p>
              <span className="f-mono" style={{color:"var(--accent)"}}>GOAL</span> is the only
              asset the protocol accepts. It is an ERC-20 with no mint function — the entire 960,000
              supply is minted in the constructor. There is no team allocation, no vesting schedule,
              and no admin key. The protocol can issue more GOAL only in the literal sense that
              the operation is impossible.
            </p>
            <p>
              The only force acting on supply is the burn hook. Once a token is destroyed it cannot
              be recreated. The curve is monotonic and one-directional.
            </p>
          </div>
          <div className="mech-spec">
            <SpecRow label="Total supply"  value="960,000 GOAL" mono />
            <SpecRow label="Decimals"      value="18" mono />
            <SpecRow label="Standard"      value="ERC-20 + Burnable + Permit" mono />
            <SpecRow label="Permit"        value="EIP-2612 (gasless approve)" mono />
            <SpecRow label="Mint function" value="—" mono accent="fire" />
            <SpecRow label="Team allocation" value="0 (deployer → V4 LP)" mono accent="accent" />
            <SpecRow label="Owner"         value="renounced" mono accent="fire" />
            <SpecRow label="Base pool"     value="GOAL/ETH · V4 · 1% fee" mono />
            <SpecRow label="Launch FDV"    value="6 ETH (~$15k)" mono />
            <SpecRow label="Network"       value="Ethereum mainnet · 1" mono />
          </div>
        </div>
      </MechSection>

      <MechSection id="phases" num="02" title="Two phases, no overlap" subtitle="Pack window → curve trading">
        <p className="mech-prose">
          The protocol operates in two strictly sequential phases per country. The pack window
          distributes initial supply at <code className="inline-code">6.9 GOAL/pack</code> for up
          to 18,000 packs. The curve cannot trade while packs are still open. The phase boundary
          is enforced on-chain via <code className="inline-code">activateCountry()</code>.
        </p>
        <PhaseDiagram />
      </MechSection>

      <MechSection id="curve" num="03" title="The bonding curve" subtitle="Virtual reserve XYK">
        <div className="mech-cols">
          <div>
            <p>
              Each of the 192 curves is a virtual-reserve XYK with a hard asymptote. The price
              function is <code className="inline-code">P = (VIRTUAL + reserve) / (A − S)</code>,
              where <code className="inline-code">VIRTUAL = 20,000</code> seeds the initial price
              and <code className="inline-code">A</code> is the asymptote — 20,000 for country
              tokens, 1,500 / 500 / 2,500 for captain / best / rookie player tokens.
            </p>
            <p>
              No K calibration needed — virtual reserve fixes the opening price at exactly the
              pack equivalent (6.9 GOAL/token at sealing). From there, price rises monotonically
              with supply and approaches infinity as S → A. The asymptote is mathematically
              unreachable. Most countries will stop somewhere between 18,000 and 19,000.
            </p>
          </div>
          <CurveDiagram />
        </div>
      </MechSection>

      <MechSection id="hook" num="04" title="The V4 hook" subtitle="beforeSwap · afterSwap · zero router round-trips" highlight>
        <div className="mech-cols">
          <div>
            <p>
              The 192 curves are not separate contracts. They are 192 pools registered against a single
              Uniswap V4 hook contract — <code className="inline-code">GoalCurveHook</code>. The hook owns
              the curve math, the burn logic, and the seal/calibrate state for every pool. Pool managers
              call into it on every swap.
            </p>
            <p>
              The critical move: the burn lives inside the swap. When a user trades, <code className="inline-code">beforeSwap</code> extracts the 5% fee
              from the swap delta and immediately invokes <code className="inline-code">GOAL.burn()</code>.
              No router hop. No second transaction. No keeper. The deflation is atomic with the trade.
            </p>
            <p>
              This is what V4 enables that V2/V3 could not. In earlier AMMs, a protocol fee had to be
              extracted by an external contract after the swap — usually accumulated in a treasury and
              burned in periodic batches. Here the fee never leaves the swap atom. The trade and the
              burn are the same event.
            </p>
          </div>
          <HookDiagram />
        </div>

        <div className="hook-spec">
          <SpecRow label="Hook permissions" value="beforeSwap · beforeAddLiquidity · afterInitialize" mono />
          <SpecRow label="Per-swap overhead" value="≈21,000 gas" mono />
          <SpecRow label="Fee delta encoding" value="BeforeSwapDelta (Q.96 fixed)" mono />
          <SpecRow label="Liquidity additions" value="reverted — only hook adds curve liquidity" mono accent="fire" />
          <SpecRow label="Pool init" value="locked to GOAL / token pair" mono />
          <SpecRow label="Fee distribution" value="100% → GOAL.burn()" mono accent="accent" />
        </div>

        <div className="code-block" style={{marginTop:32}}>
          <div className="code-block-bar">
            <span className="f-mono" style={{color:"var(--fg-3)", fontSize:11}}>GoalCurveHook.sol</span>
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

    // Atomic deflation. No treasury, no router round-trip.
    GOAL.burn(fee);
    emit Burned(id, fee, block.timestamp);

    BeforeSwapDelta delta = toBeforeSwapDelta(
        int128(int256(fee)),                              // take from input
        int128(0)
    );

    return (BaseHook.beforeSwap.selector, delta, 0);
}`}
          </pre>
        </div>
      </MechSection>

      <MechSection id="burn" num="05" title="The flywheel" subtitle="Every trade reduces total supply">
        <p className="mech-prose">
          Burn is the only deflationary force in the system. There is no buyback. There is no
          locked supply. Every trade across every one of the 192 curves contributes 5% of its
          inbound GOAL to the burn. Over time, the circulating supply <span className="f-display-it" style={{color:"var(--fg)"}}>monotonically
          decreases</span> toward zero.
        </p>
        <FlywheelDiagram />
      </MechSection>

      <MechSection id="vrf" num="06" title="Player pack randomness" subtitle="Chainlink VRF v2.5 · three-stage settlement">
        <p className="mech-prose">
          Player packs draw from a constrained pool of 150 captains, 50 best players, and 250
          rookies per country. The role is selected on-chain via a single VRF word, with quotas
          decremented atomically in the callback. Tokens are not minted in the callback — they
          are minted on the user's <code className="inline-code">claim()</code> call, which prevents
          callback-based reentrancy and lets unfilled requests be safely retried.
        </p>
        <VRFDiagram />
      </MechSection>

      <section className="mech-footer-cta">
        <div>
          <div className="eyebrow">End of mechanics</div>
          <h2 className="f-display" style={{fontSize:56, lineHeight:1, margin:"12px 0 24px", letterSpacing:"-0.02em"}}>
            Ready to open a pack?
          </h2>
        </div>
        <div style={{display:"flex", gap:12}}>
          <button className="btn btn-primary" onClick={()=>setRoute({name:"pack"})}>Open a Pack</button>
          <button className="btn" onClick={()=>setRoute({name:"markets"})}>Browse Markets</button>
        </div>
      </section>

      <Footer setRoute={setRoute} />
    </main>
  );
};

const SECTIONS = [
  { id: "token",  label: "The token (GOAL)" },
  { id: "phases", label: "Two phases" },
  { id: "curve",  label: "The bonding curve" },
  { id: "hook",   label: "The V4 hook" },
  { id: "burn",   label: "The burn flywheel" },
  { id: "vrf",    label: "Player VRF" },
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
          <span className="eyebrow">Phase I</span>
          <span className="pill accent"><span className="pill-dot"/>Active</span>
        </div>
        <div className="phase-diagram-segment-title f-display">Pack Window</div>
        <ul className="phase-diagram-bullets">
          <li>1,000 country packs / nation × 48 nations = 48,000 packs</li>
          <li>10 GOAL per country pack → 15 country tokens minted</li>
          <li>450 player packs / nation, paid in 1 country token each</li>
          <li>VRF allocates captain / best / rookie by quota</li>
          <li>Window closes per nation: 7 days OR sell-out</li>
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
          <span className="eyebrow">Phase II</span>
          <span className="pill bull"><span className="pill-dot"/>Per-Country</span>
        </div>
        <div className="phase-diagram-segment-title f-display">Curve Trading</div>
        <ul className="phase-diagram-bullets">
          <li>192 bonding curves activate via activateCountry()</li>
          <li>P = (VIRTUAL + reserve) / (A − S) — asymptotic</li>
          <li>~118k GOAL reserve seeds each fully-filled country curve</li>
          <li>5% of inbound GOAL burns on every buy/sell</li>
          <li>No expiry. Curves run forever or until S → A.</li>
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
      <text x={xs(100)-4} y={PAD+12} textAnchor="end" className="curve-axis-fire">A = 20,000 · asymptote</text>
      {/* curve */}
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2"/>
      {/* glow */}
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="6" opacity="0.18"/>
      {/* labels */}
      <text x={PAD} y={H-12} className="curve-axis">supply →</text>
      <text x={PAD} y={PAD-12} className="curve-axis">price</text>
      <text x={xs(18)} y={ys((VIRT + 18*6.555)/(A-18))-8} className="curve-label">pack-window seal</text>
      <text x={xs(85)} y={ys((VIRT + 85*6.555)/(A-85))-10} className="curve-label">parabolic zone</text>
    </svg>
  );
};

const HookDiagram = () => (
  <div className="hook-diagram">
    <div className="hook-node hook-node-user">
      <div className="eyebrow">User</div>
      <div className="hook-node-label f-mono">swap(GOAL → CTRY)</div>
    </div>
    <div className="hook-arrow"><span>1</span></div>
    <div className="hook-node hook-node-pm">
      <div className="eyebrow">Pool Manager</div>
      <div className="hook-node-label f-mono">unlock + swap</div>
    </div>
    <div className="hook-arrow"><span>2</span></div>
    <div className="hook-node hook-node-hook">
      <div className="eyebrow">Hook · 0xC0DE…BURN</div>
      <div className="hook-node-label f-display" style={{fontSize:18}}>beforeSwap()</div>
      <div className="hook-node-sub f-mono">extract 5% → GOAL.burn()</div>
      <div className="hook-burn-glow" />
    </div>
    <div className="hook-arrow hook-arrow-down"><span>3</span></div>
    <div className="hook-node hook-node-burn">
      <div className="hook-burn-icon">▲</div>
      <div className="eyebrow" style={{color:"var(--fire)"}}>Atomic burn</div>
      <div className="hook-node-label f-mono">−5% GOAL supply</div>
    </div>
  </div>
);

const FlywheelDiagram = () => (
  <div className="flywheel">
    {[
      { label: "Trade",           sub: "5% of GOAL input", color: "var(--accent)" },
      { label: "Hook intercepts", sub: "beforeSwap()",      color: "var(--fg)" },
      { label: "Burn",            sub: "−fee from supply",  color: "var(--fire)" },
      { label: "Scarcity ↑",      sub: "Remaining GOAL rises", color: "var(--bull)" },
      { label: "Demand ↑",        sub: "Curves price up",     color: "var(--accent)" },
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
    {["openPack()", "request VRF", "fulfillRandomWords", "decrement quota", "user claim() → mint"].map((step, i) => (
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
