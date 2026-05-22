// FOOTBALL — 48 国家阵容，countryIndex 与链上合约一致（0-47）。
// 每个国家 3 名球员：CPT（队长）、BST（巨星）、RKE（新星）。
// stripe 代码对应 Flag SVG 图案；colors 为抽象配色（非国旗复刻）。

window.COUNTRIES = [
  { id: "ARG", get name() { return window.L("阿根廷", "Argentina"); },     conf: "CONMEBOL",  colors: ["#75AADB","#FFFFFF","#FCBF49"], stripe: "h3" },
  { id: "AUS", get name() { return window.L("澳大利亚", "Australia"); },   conf: "AFC",       colors: ["#012169","#E4002B","#FFFFFF"], stripe: "diag" },
  { id: "AUT", get name() { return window.L("奥地利", "Austria"); },     conf: "UEFA",      colors: ["#ED2939","#FFFFFF","#ED2939"], stripe: "h3" },
  { id: "BEL", get name() { return window.L("比利时", "Belgium"); },     conf: "UEFA",      colors: ["#1A1A1A","#FAE042","#ED2939"], stripe: "v3" },
  { id: "BRA", get name() { return window.L("巴西", "Brazil"); },       conf: "CONMEBOL",  colors: ["#009C3B","#FFDF00","#012169"], stripe: "diag" },
  { id: "CAN", get name() { return window.L("加拿大", "Canada"); },     conf: "CONCACAF",  colors: ["#FF0000","#FFFFFF","#FF0000"], stripe: "v3" },
  { id: "CPV", get name() { return window.L("佛得角", "Cape Verde"); },     conf: "CAF",       colors: ["#003893","#FFFFFF","#CF2027"], stripe: "h3" },
  { id: "COL", get name() { return window.L("哥伦比亚", "Colombia"); },   conf: "CONMEBOL",  colors: ["#FCBF49","#0033A0","#CE1126"], stripe: "h3" },
  { id: "CRO", get name() { return window.L("克罗地亚", "Croatia"); },   conf: "UEFA",      colors: ["#FF0000","#FFFFFF","#171796"], stripe: "h3" },
  { id: "CUW", get name() { return window.L("库拉索", "Curaçao"); },     conf: "CONCACAF",  colors: ["#002B7F","#F9E814","#FFFFFF"], stripe: "h3" },
  { id: "DEN", get name() { return window.L("丹麦", "Denmark"); },       conf: "UEFA",      colors: ["#C8102E","#FFFFFF","#C8102E"], stripe: "cross" },
  { id: "ECU", get name() { return window.L("厄瓜多尔", "Ecuador"); },   conf: "CONMEBOL",  colors: ["#FFCE00","#003893","#CE1126"], stripe: "h3" },
  { id: "EGY", get name() { return window.L("埃及", "Egypt"); },       conf: "CAF",       colors: ["#CE1126","#FFFFFF","#1A1A1A"], stripe: "h3" },
  { id: "ENG", get name() { return window.L("英格兰", "England"); },     conf: "UEFA",      colors: ["#CE1124","#FFFFFF","#1E1E1E"], stripe: "cross" },
  { id: "FRA", get name() { return window.L("法国", "France"); },       conf: "UEFA",      colors: ["#0055A4","#FFFFFF","#EF4135"], stripe: "v3" },
  { id: "GER", get name() { return window.L("德国", "Germany"); },       conf: "UEFA",      colors: ["#1A1A1A","#DD0000","#FFCE00"], stripe: "h3" },
  { id: "GHA", get name() { return window.L("加纳", "Ghana"); },       conf: "CAF",       colors: ["#CE1126","#FCD116","#006B3F"], stripe: "h3" },
  { id: "HAI", get name() { return window.L("海地", "Haiti"); },       conf: "CONCACAF",  colors: ["#00209F","#FFFFFF","#D21034"], stripe: "h2" },
  { id: "IRN", get name() { return window.L("伊朗", "Iran"); },       conf: "AFC",       colors: ["#239F40","#FFFFFF","#DA0000"], stripe: "h3" },
  { id: "ITA", get name() { return window.L("意大利", "Italy"); },     conf: "UEFA",      colors: ["#008C45","#F4F5F0","#CD212A"], stripe: "v3" },
  { id: "CIV", get name() { return window.L("科特迪瓦", "Côte d'Ivoire"); },   conf: "CAF",       colors: ["#F77F00","#FFFFFF","#009E60"], stripe: "v3" },
  { id: "JPN", get name() { return window.L("日本", "Japan"); },       conf: "AFC",       colors: ["#FFFFFF","#BC002D","#FFFFFF"], stripe: "circle" },
  { id: "JOR", get name() { return window.L("约旦", "Jordan"); },       conf: "AFC",       colors: ["#000000","#FFFFFF","#007A3D"], stripe: "h3" },
  { id: "MEX", get name() { return window.L("墨西哥", "Mexico"); },     conf: "CONCACAF",  colors: ["#006847","#FFFFFF","#CE1126"], stripe: "v3" },
  { id: "MAR", get name() { return window.L("摩洛哥", "Morocco"); },     conf: "CAF",       colors: ["#C1272D","#006233","#C1272D"], stripe: "emblem" },
  { id: "NED", get name() { return window.L("荷兰", "Netherlands"); },     conf: "UEFA",      colors: ["#AE1C28","#FFFFFF","#21468B"], stripe: "h3" },
  { id: "NZL", get name() { return window.L("新西兰", "New Zealand"); },     conf: "OFC",       colors: ["#012169","#FFFFFF","#CC142B"], stripe: "diag" },
  { id: "NOR", get name() { return window.L("挪威", "Norway"); },       conf: "UEFA",      colors: ["#EF2B2D","#FFFFFF","#002868"], stripe: "cross" },
  { id: "PAN", get name() { return window.L("巴拿马", "Panama"); },     conf: "CONCACAF",  colors: ["#005AA7","#FFFFFF","#D21034"], stripe: "quad" },
  { id: "PAR", get name() { return window.L("巴拉圭", "Paraguay"); },     conf: "CONMEBOL",  colors: ["#D52B1E","#FFFFFF","#0038A8"], stripe: "h3" },
  { id: "POL", get name() { return window.L("波兰", "Poland"); },       conf: "UEFA",      colors: ["#FFFFFF","#DC143C","#1A1A1A"], stripe: "h2" },
  { id: "POR", get name() { return window.L("葡萄牙", "Portugal"); },     conf: "UEFA",      colors: ["#006600","#FF0000","#FFCC00"], stripe: "v2" },
  { id: "QAT", get name() { return window.L("卡塔尔", "Qatar"); },     conf: "AFC",       colors: ["#8D1B3D","#FFFFFF","#8D1B3D"], stripe: "v2" },
  { id: "KSA", get name() { return window.L("沙特阿拉伯", "Saudi Arabia"); }, conf: "AFC",       colors: ["#006C35","#FFFFFF","#006C35"], stripe: "h1" },
  { id: "SCO", get name() { return window.L("苏格兰", "Scotland"); },     conf: "UEFA",      colors: ["#0065BD","#FFFFFF","#0065BD"], stripe: "cross" },
  { id: "SEN", get name() { return window.L("塞内加尔", "Senegal"); },   conf: "CAF",       colors: ["#00853F","#FDEF42","#E31B23"], stripe: "v3" },
  { id: "RSA", get name() { return window.L("南非", "South Africa"); },       conf: "CAF",       colors: ["#007A4D","#FFB915","#DE3831"], stripe: "diag" },
  { id: "KOR", get name() { return window.L("韩国", "South Korea"); },       conf: "AFC",       colors: ["#FFFFFF","#003478","#CD2E3A"], stripe: "circle" },
  { id: "ESP", get name() { return window.L("西班牙", "Spain"); },     conf: "UEFA",      colors: ["#AA151B","#F1BF00","#AA151B"], stripe: "h3" },
  { id: "SUI", get name() { return window.L("瑞士", "Switzerland"); },       conf: "UEFA",      colors: ["#FF0000","#FFFFFF","#FF0000"], stripe: "cross" },
  { id: "TUN", get name() { return window.L("突尼斯", "Tunisia"); },     conf: "CAF",       colors: ["#E70013","#FFFFFF","#E70013"], stripe: "emblem" },
  { id: "TUR", get name() { return window.L("土耳其", "Türkiye"); },     conf: "UEFA",      colors: ["#E30A17","#FFFFFF","#E30A17"], stripe: "emblem" },
  { id: "UKR", get name() { return window.L("乌克兰", "Ukraine"); },     conf: "UEFA",      colors: ["#0057B7","#FFD700","#FFD700"], stripe: "h2" },
  { id: "USA", get name() { return window.L("美国", "United States"); },       conf: "CONCACAF",  colors: ["#B22234","#FFFFFF","#3C3B6E"], stripe: "h5" },
  { id: "URU", get name() { return window.L("乌拉圭", "Uruguay"); },     conf: "CONMEBOL",  colors: ["#7CB7E0","#FFFFFF","#FCBF49"], stripe: "h5" },
  { id: "UZB", get name() { return window.L("乌兹别克斯坦", "Uzbekistan"); }, conf: "AFC",     colors: ["#1EB53A","#FFFFFF","#0099B5"], stripe: "h3" },
  { id: "VEN", get name() { return window.L("委内瑞拉", "Venezuela"); },   conf: "CONMEBOL",  colors: ["#FFCC00","#00247D","#CF142B"], stripe: "h3" },
  { id: "WAL", get name() { return window.L("威尔士", "Wales"); },     conf: "UEFA",      colors: ["#FFFFFF","#D30731","#1A5A1F"], stripe: "h2" },
];

// Player roles — visceral rarity tier
window.PLAYER_ROLES = {
  CPT: { id: "CPT", get label() { return window.L("队长", "Captain"); }, rarity: "Wide",   max: 1500, packs: 150, color: "var(--rare-captain)" },
  BST: { id: "BST", get label() { return window.L("巨星", "Best"); }, rarity: "Rare",   max:  500, packs:  50, color: "var(--rare-best)"    },
  RKE: { id: "RKE", get label() { return window.L("新星", "Rookie"); }, rarity: "Common", max: 2500, packs: 250, color: "var(--rare-rookie)"  },
};

// 开包窗口经济参数 —— 国家包价按部署日 BNB 价回填（= 合约 BscParams 的 k）。
// 参考场景 BNB=$600、k≈558：国家包价 3,850 FOOTBALL。合约填好 config.packPriceFootball 后全站自动同步。
window.PACK_PRICE        = (window.FOOTBALL_CONFIG && window.FOOTBALL_CONFIG.packPriceFootball) || 3850;
window.PACK_BURN         = +(window.PACK_PRICE * 0.05).toFixed(2);   // 包价 5% 永久销毁
window.PACK_TO_CURVE     = +(window.PACK_PRICE * 0.95).toFixed(2);   // 包价 95% 注入国家曲线储备
window.PACKS_PER_COUNTRY = 18000;        // 每国国家包上限（1 包铸造 1 枚国家代币）
window.COUNTRY_ASYMPTOTE = 20000;        // 国家曲线渐近线（代币数）
window.VIRTUAL_PITCH     = Math.round(20000 * window.PACK_PRICE / 6.9); // 国家曲线虚拟储备 = 20,000 × k
window.FEE_BPS           = 500;          // 曲线买/卖手续费 5%
window.TOTAL_SUPPLY      = 1000000000;   // FOOTBALL 总量 10 亿（flap 固定，不可增发）

// Real on-chain state, sourced from data/chain.js (CHAIN cache).
// Before the first RPC response lands, returns a clean zero state — NOT demo.
window.EMPTY_COUNTRY_STATE = {
  packsSold: 0,
  sealed: false,
  curveOpen: false,
  supply: 0,
  reserve: 0,
  price: PACK_PRICE,
  burnedFromCurve: 0,
  unavailable: true,
};

window.countryState = function (c) {
  const cached = window.CHAIN && window.CHAIN.state && window.CHAIN.state.countries[c.id];
  if (cached) return cached;
  return window.EMPTY_COUNTRY_STATE;
};

window.countryName = function (c) { return c ? c.name : ""; };
