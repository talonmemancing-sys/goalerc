// FOOTBALL — BSC mainnet config
//
// 地址中枢。⏳ 标记的字段等 flap 创建 FOOTBALL 代币 + Deploy1~4 后回填。
// PitchTreasury 已部署，treasury 字段已填。
window.FOOTBALL_CONFIG = {
  network: "BSC",
  chainId: 56,

  // WalletConnect
  walletConnectProjectId: "233a3f8b3ae863d29643c7e656dc85d3",

  // ─── 经济参数 —— 毕业当天按真实 BNB 价回填（= BscParams 的 k）──────────────
  bnbPriceUsd:        0, // 部署当天填
  footballPriceUsd:   0, // 部署当天填
  packPriceFootball:  0, // 国家包价（FOOTBALL 计价）= BscParams.PACK_PRICE
  totalSupply:        1_000_000_000, // FOOTBALL 总量 10 亿（flap 固定）

  // ─── 外部基础设施（BSC）────────────────────────────────────────────────────
  pancakeRouter: "0x10ED43C718714eb63d5aA57B78B54704E256024E", // PancakeSwap V2 router
  wbnb:          "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
  flapPortal:    "0xe2cE6ab80874Fa9Fa2aAE65D277Dd6B8e65C9De0", // flap 内盘 Portal
  vrfWrapper:    "0x471506e6ADED0b9811D05B8cAc8Db25eE839Ac94", // Chainlink VRF v2.5 wrapper

  // ─── 已部署合约 ───────────────────────────────────────────────────────────
  treasury: "0xf4b795db84e1fce31396e8ab31f323498b1b997a", // ✅ PitchTreasury（4% 税金库）

  // ⏳ 等 flap 创建 FOOTBALL 代币后回填：
  football: "", // FOOTBALL 代币 CA（flap 发射）

  // ⏳ 等 Deploy1~4 后回填：
  countryFactory:    "",
  playerFactory:     "",
  countryPackOpener: "",
  playerPackOpener:  "",
  registry:          "",

  // ⏳ FOOTBALL 毕业后回填 —— PancakeSwap 上的 FOOTBALL/WBNB 交易对，用于读价格：
  footballWbnbPair: "",

  // 浏览器
  explorerBase: "https://bscscan.com",

  // 主 RPC（BSC 公共节点；用户可在 localStorage 覆盖 "football_rpc"）
  primaryRpc: "https://bsc-dataseed.bnbchain.org",
};

// 向后兼容别名 —— chain.js / tx.js 等暂时仍引用 window.GOAL_CONFIG，
// 逐文件改造时会换成 FOOTBALL_CONFIG。
window.GOAL_CONFIG = window.FOOTBALL_CONFIG;
