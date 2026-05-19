// GOAL — Ethereum mainnet config (deployed 2026-05-19)
window.GOAL_CONFIG = {
  network: "Ethereum",
  chainId: 1,

  // WalletConnect / RainbowKit
  walletConnectProjectId: "233a3f8b3ae863d29643c7e656dc85d3",

  // FDV
  fdvEth: 6,
  ethPriceUsd: 2500,
  fdvUsd: 15000,
  pitchPriceUsd: 15000 / 960000, // ≈ $0.0156

  // V4
  poolManager:     "0x000000000004444c5dc75cB358380D2e3dE08A90",
  positionManager: "0xbD216513d74C8cf14cf4747E6AaA6420FF64ee9e",
  permit2:         "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  vrfCoordinator:  "0xD7f86b4b8Cae7D942340FF628F82735b7a20893a",
  vrfKeyHash:      "0x9fe0eebf5e446e3c998ec9bb19951541aee00bb90ea201ae456421a2ded86805",

  // GOAL protocol deployments (mainnet)
  goal:              "0x01d758b1c6d4ea88230a70c61a200c3a75a9f9f2",
  countryFactory:    "0xc8ce91a0ee969fa5fe5b26858e833e6b573877cc",
  playerFactory:     "0x75d93A16151A13D1881C5d269ebd021baaD94deE",
  countryPackOpener: "0x8b8cbc86118371c28b86c5e8b75b01d388a1930a",
  playerPackOpener:  "0xc015FbC5c5585517A5c86f9010F11AEa1b9127fA",
  registry:          "0xf860c9A07062c9C1fEd15a6fb07dc63296268383",

  // V4 GOAL/ETH pool — 1% fee, matches Base PITCH original
  pool: {
    currency0:   "0x0000000000000000000000000000000000000000",
    currency1:   "0x01d758b1c6d4ea88230a70c61a200c3a75a9f9f2",
    fee:         10000,   // 1%
    tickSpacing: 200,
    hooks:       "0x0000000000000000000000000000000000000000",
  },

  // Etherscan
  etherscanBase: "https://etherscan.io",
};
