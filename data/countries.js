// GOAL — 48 country roster aligned to mainnet contract countryIndex (0-47).
// Each country has 3 players: CPT (Captain), BST (Best), RKE (Rookie).
// Stripe codes match Flag SVG patterns; colors are abstract palettes (not flag replicas).

window.COUNTRIES = [
  { id: "ARG", name: "Argentina",     conf: "CONMEBOL",  colors: ["#75AADB","#FFFFFF","#FCBF49"], stripe: "h3" },
  { id: "AUS", name: "Australia",     conf: "AFC",       colors: ["#012169","#E4002B","#FFFFFF"], stripe: "diag" },
  { id: "AUT", name: "Austria",       conf: "UEFA",      colors: ["#ED2939","#FFFFFF","#ED2939"], stripe: "h3" },
  { id: "BEL", name: "Belgium",       conf: "UEFA",      colors: ["#1A1A1A","#FAE042","#ED2939"], stripe: "v3" },
  { id: "BRA", name: "Brazil",        conf: "CONMEBOL",  colors: ["#009C3B","#FFDF00","#012169"], stripe: "diag" },
  { id: "CAN", name: "Canada",        conf: "CONCACAF",  colors: ["#FF0000","#FFFFFF","#FF0000"], stripe: "v3" },
  { id: "CPV", name: "Cape Verde",    conf: "CAF",       colors: ["#003893","#FFFFFF","#CF2027"], stripe: "h3" },
  { id: "COL", name: "Colombia",      conf: "CONMEBOL",  colors: ["#FCBF49","#0033A0","#CE1126"], stripe: "h3" },
  { id: "CRO", name: "Croatia",       conf: "UEFA",      colors: ["#FF0000","#FFFFFF","#171796"], stripe: "h3" },
  { id: "CUW", name: "Curacao",       conf: "CONCACAF",  colors: ["#002B7F","#F9E814","#FFFFFF"], stripe: "h3" },
  { id: "DEN", name: "Denmark",       conf: "UEFA",      colors: ["#C8102E","#FFFFFF","#C8102E"], stripe: "cross" },
  { id: "ECU", name: "Ecuador",       conf: "CONMEBOL",  colors: ["#FFCE00","#003893","#CE1126"], stripe: "h3" },
  { id: "EGY", name: "Egypt",         conf: "CAF",       colors: ["#CE1126","#FFFFFF","#1A1A1A"], stripe: "h3" },
  { id: "ENG", name: "England",       conf: "UEFA",      colors: ["#CE1124","#FFFFFF","#1E1E1E"], stripe: "cross" },
  { id: "FRA", name: "France",        conf: "UEFA",      colors: ["#0055A4","#FFFFFF","#EF4135"], stripe: "v3" },
  { id: "GER", name: "Germany",       conf: "UEFA",      colors: ["#1A1A1A","#DD0000","#FFCE00"], stripe: "h3" },
  { id: "GHA", name: "Ghana",         conf: "CAF",       colors: ["#CE1126","#FCD116","#006B3F"], stripe: "h3" },
  { id: "HAI", name: "Haiti",         conf: "CONCACAF",  colors: ["#00209F","#FFFFFF","#D21034"], stripe: "h2" },
  { id: "IRN", name: "Iran",          conf: "AFC",       colors: ["#239F40","#FFFFFF","#DA0000"], stripe: "h3" },
  { id: "ITA", name: "Italy",         conf: "UEFA",      colors: ["#008C45","#F4F5F0","#CD212A"], stripe: "v3" },
  { id: "CIV", name: "Ivory Coast",   conf: "CAF",       colors: ["#F77F00","#FFFFFF","#009E60"], stripe: "v3" },
  { id: "JPN", name: "Japan",         conf: "AFC",       colors: ["#FFFFFF","#BC002D","#FFFFFF"], stripe: "circle" },
  { id: "JOR", name: "Jordan",        conf: "AFC",       colors: ["#000000","#FFFFFF","#007A3D"], stripe: "h3" },
  { id: "MEX", name: "Mexico",        conf: "CONCACAF",  colors: ["#006847","#FFFFFF","#CE1126"], stripe: "v3" },
  { id: "MAR", name: "Morocco",       conf: "CAF",       colors: ["#C1272D","#006233","#C1272D"], stripe: "emblem" },
  { id: "NED", name: "Netherlands",   conf: "UEFA",      colors: ["#AE1C28","#FFFFFF","#21468B"], stripe: "h3" },
  { id: "NZL", name: "New Zealand",   conf: "OFC",       colors: ["#012169","#FFFFFF","#CC142B"], stripe: "diag" },
  { id: "NOR", name: "Norway",        conf: "UEFA",      colors: ["#EF2B2D","#FFFFFF","#002868"], stripe: "cross" },
  { id: "PAN", name: "Panama",        conf: "CONCACAF",  colors: ["#005AA7","#FFFFFF","#D21034"], stripe: "quad" },
  { id: "PAR", name: "Paraguay",      conf: "CONMEBOL",  colors: ["#D52B1E","#FFFFFF","#0038A8"], stripe: "h3" },
  { id: "POL", name: "Poland",        conf: "UEFA",      colors: ["#FFFFFF","#DC143C","#1A1A1A"], stripe: "h2" },
  { id: "POR", name: "Portugal",      conf: "UEFA",      colors: ["#006600","#FF0000","#FFCC00"], stripe: "v2" },
  { id: "QAT", name: "Qatar",         conf: "AFC",       colors: ["#8D1B3D","#FFFFFF","#8D1B3D"], stripe: "v2" },
  { id: "KSA", name: "Saudi Arabia",  conf: "AFC",       colors: ["#006C35","#FFFFFF","#006C35"], stripe: "h1" },
  { id: "SCO", name: "Scotland",      conf: "UEFA",      colors: ["#0065BD","#FFFFFF","#0065BD"], stripe: "cross" },
  { id: "SEN", name: "Senegal",       conf: "CAF",       colors: ["#00853F","#FDEF42","#E31B23"], stripe: "v3" },
  { id: "RSA", name: "South Africa",  conf: "CAF",       colors: ["#007A4D","#FFB915","#DE3831"], stripe: "diag" },
  { id: "KOR", name: "South Korea",   conf: "AFC",       colors: ["#FFFFFF","#003478","#CD2E3A"], stripe: "circle" },
  { id: "ESP", name: "Spain",         conf: "UEFA",      colors: ["#AA151B","#F1BF00","#AA151B"], stripe: "h3" },
  { id: "SUI", name: "Switzerland",   conf: "UEFA",      colors: ["#FF0000","#FFFFFF","#FF0000"], stripe: "cross" },
  { id: "TUN", name: "Tunisia",       conf: "CAF",       colors: ["#E70013","#FFFFFF","#E70013"], stripe: "emblem" },
  { id: "TUR", name: "Turkey",        conf: "UEFA",      colors: ["#E30A17","#FFFFFF","#E30A17"], stripe: "emblem" },
  { id: "UKR", name: "Ukraine",       conf: "UEFA",      colors: ["#0057B7","#FFD700","#FFD700"], stripe: "h2" },
  { id: "USA", name: "United States", conf: "CONCACAF",  colors: ["#B22234","#FFFFFF","#3C3B6E"], stripe: "h5" },
  { id: "URU", name: "Uruguay",       conf: "CONMEBOL",  colors: ["#7CB7E0","#FFFFFF","#FCBF49"], stripe: "h5" },
  { id: "UZB", name: "Uzbekistan",    conf: "AFC",       colors: ["#1EB53A","#FFFFFF","#0099B5"], stripe: "h3" },
  { id: "VEN", name: "Venezuela",     conf: "CONMEBOL",  colors: ["#FFCC00","#00247D","#CF142B"], stripe: "h3" },
  { id: "WAL", name: "Wales",         conf: "UEFA",      colors: ["#FFFFFF","#D30731","#1A5A1F"], stripe: "h2" },
];

// Player roles — visceral rarity tier
window.PLAYER_ROLES = {
  CPT: { id: "CPT", label: "Captain", rarity: "Wide",   max: 1500, packs: 150, color: "var(--rare-captain)" },
  BST: { id: "BST", label: "Best",    rarity: "Rare",   max:  500, packs:  50, color: "var(--rare-best)"    },
  RKE: { id: "RKE", label: "Rookie",  rarity: "Common", max: 2500, packs: 250, color: "var(--rare-rookie)"  },
};

// Pack window economics (mainnet)
window.PACK_PRICE        = 6.9;
window.PACK_BURN         = 0.345;
window.PACK_TO_CURVE     = 6.555;
window.PACKS_PER_COUNTRY = 18000;
window.COUNTRY_ASYMPTOTE = 20000;
window.VIRTUAL_PITCH     = 20000;
window.FEE_BPS           = 500;
window.TOTAL_SUPPLY      = 960000;

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
