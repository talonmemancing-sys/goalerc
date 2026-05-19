// GOAL — top navigation with REAL EIP-1193 wallet connect (no simulator).
const Header = ({ route, setRoute, burned }) => {
  const items = [
    { id: "home",      label: "Home" },
    { id: "mechanics", label: "Mechanics" },
    { id: "pack",      label: "Pack" },
    { id: "markets",   label: "Markets" },
    { id: "players",   label: "Players" },
    { id: "portfolio", label: "Portfolio" },
    { id: "burn",      label: "Burn" },
  ];

  // Subscribe to live wallet state.
  const [wallet, setWallet] = React.useState(() => (window.WALLET ? { ...window.WALLET.state } : {}));
  React.useEffect(() => {
    if (!window.WALLET) return;
    setWallet({ ...window.WALLET.state });
    return window.WALLET.subscribe((s) => setWallet({ ...s }));
  }, []);

  const [menuOpen, setMenuOpen]   = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  React.useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setModalOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  const handleConnect = async (brandId) => {
    await window.WALLET.connect(brandId);
    if (window.WALLET.state.connected) setModalOpen(false);
  };

  const handleDisconnect = () => {
    window.WALLET.disconnect();
    setMenuOpen(false);
  };

  const handleCopy = () => {
    if (wallet.address) navigator.clipboard?.writeText(wallet.address);
    setMenuOpen(false);
  };

  const shortAddr = wallet.address
    ? `${wallet.address.slice(0, 6)}…${wallet.address.slice(-4)}`
    : "";

  return (
    <>
      <header className="match-header">
        <div className="match-header-inner">
          <button className="match-logo" onClick={() => setRoute({ name: "home" })}>
            <img className="goal-logo-mark" src="logo.png" alt="GOAL" width="28" height="28"/>
            <span className="f-display" style={{fontSize:22, letterSpacing:"-0.01em"}}>GOAL</span>
            <span className="match-logo-suffix f-mono">/ mainnet</span>
          </button>

          <nav className="match-nav">
            {items.map(item => (
              <button
                key={item.id}
                className={"match-nav-item " + (route.name === item.id ? "is-active" : "")}
                onClick={() => setRoute({ name: item.id })}
              >
                {item.label}
                {route.name === item.id && <span className="match-nav-dot" />}
              </button>
            ))}
          </nav>

          <div className="match-header-right">
            <SocialLinks />
            <PoolLiveBadge />

            <div className="match-supply">
              <span className="eyebrow">Supply</span>
              <span className="f-mono numeric">{(960_000 - burned).toLocaleString(undefined, {maximumFractionDigits:0})}</span>
              <span className="match-supply-burn">−{burned.toLocaleString()}</span>
            </div>

            {!wallet.connected ? (
              <button className="rk-connect-cta" onClick={() => setModalOpen(true)}>
                <span className="rk-connect-cta-bg"/>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <rect x="1.5" y="3.5" width="11" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4"/>
                  <circle cx="9.5" cy="7.5" r="0.9" fill="currentColor"/>
                </svg>
                Connect wallet
              </button>
            ) : (
              <div className="wallet-menu" ref={menuRef}>
                {!wallet.onMainnet && (
                  <button
                    className="rk-account-pill"
                    onClick={() => window.WALLET.switchToMainnet()}
                    style={{background:"rgba(255, 100, 60, 0.12)", borderColor:"rgba(255, 100, 60, 0.4)"}}
                    title="Wrong network — click to switch to Ethereum mainnet"
                  >
                    <span style={{color:"var(--fire)"}}>⚠ Wrong network</span>
                  </button>
                )}
                <button
                  className={"rk-account-pill " + (menuOpen ? "is-open" : "")}
                  onClick={() => setMenuOpen(o => !o)}
                >
                  <span className="rk-account-pill-icon">
                    {wallet.providerInfo?.icon
                      ? <img src={wallet.providerInfo.icon} alt="" className="wallet-icon-img"/>
                      : <span style={{display:"inline-block", width:20, height:20, borderRadius:6, background:"var(--accent)"}}/>}
                  </span>
                  <span className="rk-account-pill-addr">{shortAddr}</span>
                  <svg className="wallet-chevron" width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
                    <path d="M1.5 3.5 L4.5 6.5 L7.5 3.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
                  </svg>
                </button>

                {menuOpen && (
                  <WalletDropdown
                    wallet={wallet}
                    shortAddr={shortAddr}
                    onCopy={handleCopy}
                    onDisconnect={handleDisconnect}
                    onPortfolio={() => { setRoute({name:"portfolio"}); setMenuOpen(false); }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
        <div className="hairline" />
      </header>

      {modalOpen && (
        <ConnectModal
          wallet={wallet}
          onClose={() => setModalOpen(false)}
          onConnect={handleConnect}
        />
      )}
    </>
  );
};

/* ============================ Social links ============================ */
const SocialLinks = () => (
  <div className="match-socials">
    <a className="match-social-link" href="https://x.com/goal_erc" target="_blank" rel="noreferrer noopener" title="@goal_erc on X" aria-label="@goal_erc on X">
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2H21.5l-7.43 8.49L23 22h-6.74l-5.27-6.89L4.96 22H1.7l7.96-9.1L1.5 2h6.91l4.77 6.31L18.244 2zm-1.18 18h1.86L7.04 4H5.06l12.004 16z" fill="currentColor"/>
      </svg>
    </a>
  </div>
);
window.SocialLinks = SocialLinks;

/* Pool-live indicator — appears automatically when V4 GOAL/ETH pool initializes. */
const PoolLiveBadge = () => {
  const [pool, setPool] = React.useState(() => window.CHAIN?.state?.pool || { active: false });
  React.useEffect(() => {
    if (!window.CHAIN) return;
    setPool({ ...(window.CHAIN.state.pool || {}) });
    return window.CHAIN.subscribe((s) => setPool({ ...(s.pool || {}) }));
  }, []);
  if (!pool.active) return null;
  const goalAddr = window.GOAL_CONFIG?.goal;
  const uniHref = `https://app.uniswap.org/swap?inputCurrency=ETH&outputCurrency=${goalAddr}&chain=mainnet`;
  return (
    <a className="match-social-link"
       href={uniHref}
       target="_blank" rel="noreferrer noopener"
       title="Buy GOAL with ETH on Uniswap (V4 pool live)"
       style={{display:"inline-flex", alignItems:"center", gap:6, padding:"4px 10px",
               border:"1px solid var(--accent)", borderRadius:14, color:"var(--accent)"}}>
      <span style={{width:6, height:6, borderRadius:3, background:"var(--accent)", boxShadow:"0 0 6px var(--accent)"}}/>
      <span className="f-mono" style={{fontSize:11}}>Buy GOAL · V4</span>
    </a>
  );
};
window.PoolLiveBadge = PoolLiveBadge;

/* ============================ Connect modal ============================ */
const ConnectModal = ({ wallet, onClose, onConnect }) => {
  const [hovered, setHovered] = React.useState(null);
  const branded = (window.WALLET?.branded) || [];
  const announced = (window.WALLET?.announced) || [];
  // Filter announced down to those NOT already represented in branded (by rdns).
  const brandedRdns = new Set(branded.map((b) => b.rdns));
  const extraAnnounced = announced.filter((p) => !brandedRdns.has(p.info.rdns));

  const focusBrand = hovered ? branded.find((b) => b.id === hovered) : null;
  const isConnecting = !!wallet.connecting;

  return (
    <div className="rk-overlay" onClick={onClose}>
      <div className="rk-modal" onClick={e => e.stopPropagation()}>
        <aside className="rk-left">
          <div className="rk-left-head">
            <h3 className="rk-left-title">Connect a Wallet</h3>
          </div>
          <div className="rk-left-section-label">Popular</div>
          <div className="rk-wallet-list">
            {branded.map((b) => {
              const installed = window.WALLET?.isInstalled(b.id);
              return (
                <button
                  key={b.id}
                  className={
                    "rk-wallet-row " +
                    (isConnecting ? "is-connecting " : "") +
                    (hovered === b.id ? "is-active " : "")
                  }
                  onMouseEnter={() => !isConnecting && setHovered(b.id)}
                  onClick={() => !isConnecting && onConnect(b.id)}
                  disabled={isConnecting}
                >
                  <span className="rk-wallet-row-icon">
                    <img src={`assets/wallets/${b.id}.png`} alt="" className="wallet-icon-img"/>
                  </span>
                  <span className="rk-wallet-row-name">{b.name}</span>
                  {installed && <span className="rk-wallet-row-badge">Installed</span>}
                  {!installed && <span className="rk-wallet-row-badge" style={{opacity:0.5}}>Install</span>}
                </button>
              );
            })}
            {extraAnnounced.length > 0 && <div className="rk-left-section-label" style={{marginTop:14}}>Detected</div>}
            {extraAnnounced.map((p) => (
              <button
                key={p.info.uuid}
                className="rk-wallet-row"
                onClick={() => !isConnecting && window.WALLET?.connectAnnounced(p)}
                disabled={isConnecting}
              >
                <span className="rk-wallet-row-icon">
                  {p.info.icon
                    ? <img src={p.info.icon} alt="" className="wallet-icon-img"/>
                    : <span style={{display:"inline-block", width:24, height:24, borderRadius:8, background:"var(--accent)"}}/>}
                </span>
                <span className="rk-wallet-row-name">{p.info.name}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="rk-right">
          <button className="rk-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path d="M3 3 L11 11 M11 3 L3 11" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>

          {wallet.connecting ? (
            <ConnectingState providerName={(focusBrand?.name) || "wallet"} />
          ) : wallet.error ? (
            <ErrorState error={wallet.error} />
          ) : focusBrand ? (
            <ProviderDetail brand={focusBrand} onConnect={onConnect}/>
          ) : (
            <WhatIsAWallet />
          )}
        </section>
      </div>
    </div>
  );
};

const ConnectingState = ({ providerName }) => (
  <div className="rk-right-inner">
    <div className="rk-icon-large is-pulse">
      <div className="rk-icon-large-ring"/>
    </div>
    <h3 className="rk-right-title">Opening {providerName}</h3>
    <p className="rk-right-sub">Confirm the connection in your wallet…</p>
    <div className="rk-status-row">
      <span className="rk-status-dot is-pulse"/>
      <span className="f-mono" style={{fontSize:12, color:"var(--fg-3)"}}>Awaiting approval</span>
    </div>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="rk-right-inner">
    <div className="rk-icon-large" style={{color:"var(--fire)"}}>
      <svg width="36" height="36" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6"/>
        <line x1="12" y1="7" x2="12" y2="13" stroke="currentColor" strokeWidth="1.6"/>
        <circle cx="12" cy="16" r="0.8" fill="currentColor"/>
      </svg>
    </div>
    <h3 className="rk-right-title">Connection failed</h3>
    <p className="rk-right-sub">{error}</p>
  </div>
);

const ProviderDetail = ({ brand, onConnect }) => (
  <div className="rk-right-inner">
    <div className="rk-icon-large">
      <img src={`assets/wallets/${brand.id}.png`} alt="" className="wallet-icon-img"/>
    </div>
    <h3 className="rk-right-title">{brand.name}</h3>
    <p className="rk-right-sub">
      {brand.id === "metamask"    && "The most popular crypto wallet. Browser extension & mobile app."}
      {brand.id === "okx"         && "Multi-chain wallet & exchange, all-in-one."}
      {brand.id === "binance"     && "Self-custody wallet by Binance — secure & multi-chain."}
      {brand.id === "tokenpocket" && "Trusted by 30M+ users worldwide. Mobile-first."}
    </p>
    <button className="rk-connect-detail" onClick={() => onConnect(brand.id)}>
      {window.WALLET?.isInstalled(brand.id) ? `Connect with ${brand.name}` : `Install ${brand.name}`}
    </button>
  </div>
);

const WhatIsAWallet = () => (
  <div className="rk-right-inner">
    <div className="rk-edu-icons">
      <div className="rk-edu-icon">
        <svg width="28" height="28" viewBox="0 0 28 28">
          <rect x="4" y="8" width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="18" cy="15" r="2" fill="currentColor"/>
        </svg>
      </div>
      <div className="rk-edu-icon">
        <svg width="28" height="28" viewBox="0 0 28 28">
          <circle cx="14" cy="11" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M5 24 C6 19.5 9.5 17 14 17 C18.5 17 22 19.5 23 24" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
    </div>
    <h3 className="rk-right-title">What is a wallet?</h3>
    <div className="rk-edu-block">
      <div className="rk-edu-block-title">A home for your digital assets</div>
      <div className="rk-edu-block-text">Wallets let you store, send, and trade tokens like GOAL and ETH.</div>
    </div>
    <div className="rk-edu-block">
      <div className="rk-edu-block-title">A new way to log in</div>
      <div className="rk-edu-block-text">Instead of passwords, sign in to GOAL Protocol with a wallet.</div>
    </div>
  </div>
);

/* ============================ Wallet dropdown (connected) ============================ */
const WalletDropdown = ({ wallet, shortAddr, onCopy, onDisconnect, onPortfolio }) => (
  <div className="wallet-dropdown rk-account-card">
    <div className="rk-account-top">
      <div className="rk-account-avatar">
        <div className="rk-account-avatar-orb"/>
      </div>
      <div className="rk-account-addr-block">
        <div className="rk-account-addr f-display">{shortAddr}</div>
        <div className="rk-account-balance f-mono">
          {wallet.ethBalance.toFixed(4)} ETH · {wallet.goalBalance.toLocaleString(undefined, {maximumFractionDigits: 2})} GOAL
        </div>
      </div>
    </div>
    <button className="wallet-dropdown-copy" onClick={onCopy} style={{display:"flex", alignItems:"center", gap:6, padding:"8px 12px", width:"100%", border:"none", background:"transparent", color:"var(--fg-2)", cursor:"pointer", fontSize:13}}>
      <svg width="13" height="13" viewBox="0 0 12 12"><rect x="2" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M4 2 V0.5 H10 V7 H8.5" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
      Copy address
    </button>
    <a href={`https://etherscan.io/address/${wallet.address}`} target="_blank" rel="noreferrer noopener" style={{display:"flex", alignItems:"center", gap:6, padding:"8px 12px", color:"var(--fg-2)", textDecoration:"none", fontSize:13}}>
      <svg width="13" height="13" viewBox="0 0 12 12"><path d="M5 8 L8 5 M5 5 H8 V8" stroke="currentColor" strokeWidth="1.2" fill="none"/><rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
      View on Etherscan
    </a>
    <button className="wallet-dropdown-disconnect" onClick={onDisconnect}>
      <svg width="14" height="14" viewBox="0 0 14 14"><path d="M5 2 H2 V12 H5 M8 4 L11 7 L8 10 M11 7 H5" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg>
      Disconnect
    </button>
  </div>
);

window.Header = Header;
