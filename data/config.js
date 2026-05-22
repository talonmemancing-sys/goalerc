// FOOTBALL — BSC mainnet config
//
// 地址中枢。⏳ 标记的字段等 flap 创建 FOOTBALL 代币 + Deploy1~4 后回填。
// PitchTreasury 已部署，treasury 字段已填。
window.FOOTBALL_CONFIG = {
  network: "BSC",
  chainId: 56,

  // WalletConnect
  walletConnectProjectId: "233a3f8b3ae863d29643c7e656dc85d3",

  // ─── 经济参数 —— 2026-05-22 部署日定值（k = 510，详见 BscParams.sol）─────────
  bnbPriceUsd:        656.89,       // Chainlink BNB/USD @ 部署
  footballPriceUsd:   0.0000472964, // = 7.2e-8 × BNB_USD（flap 毕业价）
  packPriceFootball:  3519,         // 国家包价（FOOTBALL 计价）= BscParams.PACK_PRICE
  totalSupply:        1_000_000_000, // FOOTBALL 总量 10 亿（flap 固定）

  // ─── 外部基础设施（BSC）────────────────────────────────────────────────────
  pancakeRouter: "0x10ED43C718714eb63d5aA57B78B54704E256024E", // PancakeSwap V2 router
  wbnb:          "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
  flapPortal:    "0xe2cE6ab80874Fa9Fa2aAE65D277Dd6B8e65C9De0", // flap 内盘 Portal
  vrfWrapper:    "0x471506e6ADED0b9811D05B8cAc8Db25eE839Ac94", // Chainlink VRF v2.5 wrapper

  // ─── 已部署合约（BSC 主网）────────────────────────────────────────────────
  treasury:          "0xf4b795db84e1fce31396e8ab31f323498b1b997a", // PitchTreasury（4% 税金库）
  football:          "0x019de8e5ad884c016113e24b985cb524fab07777", // FOOTBALL 代币（flap 发射）
  countryFactory:    "0xd596480eCdbFDE554022B0d87c6952C33121777D",
  playerFactory:     "0xBc6BB3226947962391328E556B44b9a66B9b49Ac", // 修复版:渐近线留余量
  countryPackOpener: "0x70f826A599f16fEf8aACeBC107502519D3Eae756",
  playerPackOpener:  "0x7333F2DF7B225a10e5b95BA6b5D8d9dbFe0902cd", // 修复版
  registry:          "0x26Fd13370eAc39d939E5ac2458b8836D292b34C7",

  // 球员代币 1:1 兑换 —— 旧(卡死)代币换成新(可交易)代币
  playerMigrator: "0x5e6CCA452993204960b91c1BD3620aF8Fd33ba65",
  legacyPlayers: [
    { id: "ARG-CPT", name: "阿根廷 队长", nameEn: "Argentina Captain", old: "0x62308bAe9F306d13123D0BB432667f559c4CC42F" },
    { id: "ARG-BST", name: "阿根廷 巨星", nameEn: "Argentina Best",    old: "0x11d50C38485F7851D8AA190a85B2778BcEe02E5B" },
    { id: "ARG-RKE", name: "阿根廷 新星", nameEn: "Argentina Rookie",  old: "0x1845EE2Ed2efCAAad8Bd44c3d7a353F5374509d7" },
  ],

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
