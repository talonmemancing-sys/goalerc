// FOOTBALL — real EIP-1193 + EIP-6963 wallet connector (BSC mainnet)
// Discovers injected wallets, opens them, tracks account/chain changes, reads
// real BNB + FOOTBALL balances. No simulators.

(function () {
  const cfg = window.FOOTBALL_CONFIG;
  const MAINNET_CHAIN_ID = "0x38"; // BSC mainnet (chainId 56)
  const MAINNET_DECIMAL = 56;

  const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];

  // ── State & notify must be declared BEFORE the EIP-6963 listener wiring
  //    below, because injected wallets respond synchronously to our
  //    requestProvider dispatch and the handler calls notify() right away.
  let state = {
    connected: false,
    address: null,
    chainId: null,
    onMainnet: false,
    ethBalance: 0,    // native BNB balance (field name kept for API compatibility)
    goalBalance: 0,   // FOOTBALL token balance (field name kept for API compatibility)
    balanceFetchedAt: 0,  // unix ms; 0 = never fetched a real balance
    providerInfo: null,
    connecting: false,
    error: null,
  };
  const listeners = new Set();
  function notify() { listeners.forEach((fn) => { try { fn(state); } catch (e) { console.error(e); } }); }

  // Branded providers shown in the modal.
  const BRANDED = [
    { id: "metamask",    name: "MetaMask",        rdns: "io.metamask",       isFlag: "isMetaMask",     install: "https://metamask.io/download/" },
    { id: "okx",         name: "OKX Wallet",      rdns: "com.okex.wallet",   isFlag: "isOkxWallet",    install: "https://www.okx.com/web3" },
    { id: "binance",     name: "Binance Wallet",  rdns: "com.binance.wallet",isFlag: "isBinance",      install: "https://www.binance.com/en/web3wallet" },
    { id: "tokenpocket", name: "TokenPocket",     rdns: "pro.tokenpocket",   isFlag: "isTokenPocket",  install: "https://www.tokenpocket.pro/" },
  ];

  // EIP-6963 discovery — modern, multi-wallet-safe.
  const announced = []; // [{ info: {uuid, name, icon, rdns}, provider }]
  window.addEventListener("eip6963:announceProvider", (e) => {
    if (!e.detail || !e.detail.info || !e.detail.provider) return;
    const exists = announced.find((p) => p.info.uuid === e.detail.info.uuid);
    if (!exists) {
      announced.push(e.detail);
      notify();
    }
  });
  window.dispatchEvent(new Event("eip6963:requestProvider"));

  let activeProvider = null;

  function resolveProvider(brandId) {
    // 1) EIP-6963 by rdns
    const brand = BRANDED.find((b) => b.id === brandId);
    if (brand) {
      const found = announced.find((p) => p.info.rdns === brand.rdns);
      if (found) return { provider: found.provider, info: found.info };
      // 2) window.ethereum isXxx flag
      if (window.ethereum && brand.isFlag && window.ethereum[brand.isFlag]) {
        return { provider: window.ethereum, info: { name: brand.name, rdns: brand.rdns, icon: null } };
      }
      // 3) Multi-provider window.ethereum.providers[]
      if (window.ethereum && Array.isArray(window.ethereum.providers)) {
        const match = window.ethereum.providers.find((p) => brand.isFlag && p[brand.isFlag]);
        if (match) return { provider: match, info: { name: brand.name, rdns: brand.rdns, icon: null } };
      }
      return null;
    }
    // "injected" fallback
    if (brandId === "injected") {
      if (announced[0]) return { provider: announced[0].provider, info: announced[0].info };
      if (window.ethereum) return { provider: window.ethereum, info: { name: "Browser wallet", rdns: null, icon: null } };
    }
    return null;
  }

  async function connect(brandId) {
    const resolved = resolveProvider(brandId);
    if (!resolved) {
      const brand = BRANDED.find((b) => b.id === brandId);
      if (brand) { window.open(brand.install, "_blank", "noopener,noreferrer"); }
      state.error = "Wallet not installed";
      notify();
      return;
    }
    return _attach(resolved, brandId);
  }

  // Connect using a raw EIP-6963 announcement (used for "Detected" list).
  async function connectAnnounced(announcedEntry) {
    if (!announcedEntry?.provider) return;
    return _attach({ provider: announcedEntry.provider, info: announcedEntry.info }, null);
  }

  async function _attach(resolved, brandId) {
    state.connecting = true;
    state.error = null;
    notify();
    try {
      const accounts = await resolved.provider.request({ method: "eth_requestAccounts" });
      if (!accounts || !accounts.length) throw new Error("No account returned");
      const chainIdHex = await resolved.provider.request({ method: "eth_chainId" });
      activeProvider = resolved.provider;
      state.address = accounts[0];
      state.chainId = chainIdHex;
      state.onMainnet = chainIdHex === MAINNET_CHAIN_ID;
      state.providerInfo = resolved.info;
      state.connected = true;
      state.connecting = false;

      activeProvider.on?.("accountsChanged", onAccountsChanged);
      activeProvider.on?.("chainChanged", onChainChanged);
      activeProvider.on?.("disconnect", onDisconnect);

      try { localStorage.setItem("football_wallet_rdns", resolved.info?.rdns || ""); } catch {}
      if (brandId) { try { localStorage.setItem("football_wallet_brand", brandId); } catch {} }

      notify();
      refreshBalances();
    } catch (e) {
      state.connecting = false;
      state.error = e?.message || "Connection rejected";
      notify();
    }
  }

  function disconnect() {
    if (activeProvider) {
      try {
        activeProvider.removeListener?.("accountsChanged", onAccountsChanged);
        activeProvider.removeListener?.("chainChanged", onChainChanged);
        activeProvider.removeListener?.("disconnect", onDisconnect);
        // Best-effort: not all wallets support revokePermissions
        activeProvider.request?.({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        }).catch(() => {});
      } catch {}
    }
    activeProvider = null;
    state.connected = false;
    state.address = null;
    state.chainId = null;
    state.onMainnet = false;
    state.ethBalance = 0;
    state.goalBalance = 0;
    state.providerInfo = null;
    try { localStorage.removeItem("football_wallet_rdns"); localStorage.removeItem("football_wallet_brand"); } catch {}
    notify();
  }

  function onAccountsChanged(accts) {
    if (!accts || !accts.length) { disconnect(); return; }
    state.address = accts[0];
    notify();
    refreshBalances();
  }
  function onChainChanged(chainIdHex) {
    state.chainId = chainIdHex;
    state.onMainnet = chainIdHex === MAINNET_CHAIN_ID;
    notify();
    refreshBalances();
  }
  function onDisconnect() { disconnect(); }

  async function switchToMainnet() {
    if (!activeProvider) return;
    try {
      await activeProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MAINNET_CHAIN_ID }],
      });
    } catch (e) {
      // 4902 = chain not added to the wallet yet. Add BSC, then retry switch.
      if (e?.code === 4902 || /Unrecognized chain|wallet_addEthereumChain/i.test(e?.message || "")) {
        try {
          await activeProvider.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: MAINNET_CHAIN_ID, // 0x38
              chainName: "BNB Smart Chain",
              nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
              rpcUrls: ["https://bsc-dataseed.bnbchain.org"],
              blockExplorerUrls: ["https://bscscan.com"],
            }],
          });
          return;
        } catch (addErr) {
          state.error = addErr?.message || "Failed to add BNB Smart Chain";
          notify();
          return;
        }
      }
      state.error = e?.message || "Chain switch rejected";
      notify();
    }
  }

  async function refreshBalances() {
    if (!state.connected || !state.address) return;
    // BNB balance via wallet provider (always available when connected).
    try {
      const balHex = await activeProvider.request({
        method: "eth_getBalance",
        params: [state.address, "latest"],
      });
      state.ethBalance = Number(BigInt(balHex)) / 1e18;
    } catch (e) { state.ethBalance = 0; }

    // FOOTBALL balance — prefer wallet's own provider when on BSC mainnet
    // (zero CORS, zero dependence on public-RPC availability). Fall back to
    // CHAIN public RPC if wallet read fails.
    let read = false;
    if (state.onMainnet && cfg.football) {
      try {
        const browser = new ethers.BrowserProvider(activeProvider);
        const football = new ethers.Contract(cfg.football, ERC20_ABI, browser);
        const bal = await football.balanceOf(state.address);
        state.goalBalance = Number(ethers.formatEther(bal));
        read = true;
      } catch (e) { /* try CHAIN below */ }
    }
    if (!read && cfg.football) {
      try {
        if (window.CHAIN && window.CHAIN._provider) {
          const football = new ethers.Contract(cfg.football, ERC20_ABI, window.CHAIN._provider);
          const bal = await football.balanceOf(state.address);
          state.goalBalance = Number(ethers.formatEther(bal));
          read = true;
        }
      } catch (e) { /* keep previous balance rather than clobber to 0 */ }
    }
    if (read) state.balanceFetchedAt = Date.now();
    notify();
  }

  // Send a generic tx through the user's wallet.
  async function sendTransaction(tx) {
    if (!activeProvider || !state.connected) throw new Error("Wallet not connected");
    if (!state.onMainnet) {
      await switchToMainnet();
      if (!state.onMainnet) throw new Error("Please switch to BNB Smart Chain");
    }
    const txHash = await activeProvider.request({
      method: "eth_sendTransaction",
      params: [{ from: state.address, ...tx }],
    });
    return txHash;
  }

  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  window.WALLET = {
    get state() { return state; },
    get announced() { return announced; },
    get _provider() { return activeProvider; },
    branded: BRANDED,
    subscribe,
    connect,
    connectAnnounced,
    disconnect,
    switchToMainnet,
    refreshBalances,
    sendTransaction,
    isInstalled(brandId) { return !!resolveProvider(brandId); },
  };

  // Refresh balances periodically while connected
  setInterval(() => { if (state.connected) refreshBalances(); }, 30_000);

  // Try silent reconnect if we previously had a connection (no prompt).
  setTimeout(async () => {
    try {
      const rdns = localStorage.getItem("football_wallet_rdns");
      const brand = localStorage.getItem("football_wallet_brand");
      let provider = null, info = null;
      if (rdns) {
        const found = announced.find((p) => p.info.rdns === rdns);
        if (found) { provider = found.provider; info = found.info; }
      }
      if (!provider && window.ethereum) { provider = window.ethereum; info = { name: "Browser wallet", rdns: null, icon: null }; }
      if (!provider) return;
      const accounts = await provider.request({ method: "eth_accounts" }); // doesn't prompt
      if (!accounts || !accounts.length) return;
      const chainIdHex = await provider.request({ method: "eth_chainId" });
      activeProvider = provider;
      state.address = accounts[0];
      state.chainId = chainIdHex;
      state.onMainnet = chainIdHex === MAINNET_CHAIN_ID;
      state.providerInfo = info;
      state.connected = true;
      activeProvider.on?.("accountsChanged", onAccountsChanged);
      activeProvider.on?.("chainChanged", onChainChanged);
      activeProvider.on?.("disconnect", onDisconnect);
      notify();
      refreshBalances();
    } catch {}
  }, 600); // give EIP-6963 announcements a moment to land
})();
