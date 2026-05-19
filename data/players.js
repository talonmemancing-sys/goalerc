// GOAL — 144 player roster mapped to 48 countries × 3 roles
// roles: c=Captain, b=Best, r=Rookie. initials shown on the jersey center.
window.PLAYERS = [
  { iso:"ARG", c:"Cristian Romero",      b:"Lionel Messi",          r:"Nico Paz",                  initials:["CR","LM","NP"] },
  { iso:"AUS", c:"Harry Souttar",        b:"Mathew Ryan",           r:"Garang Kuol",               initials:["HS","MR","GK"] },
  { iso:"AUT", c:"Marcel Sabitzer",      b:"David Alaba",           r:"Oghenetejiri Adejenughure", initials:["MS","DA","OA"] },
  { iso:"BEL", c:"Romelu Lukaku",        b:"Kevin De Bruyne",       r:"Mika Godts",                initials:["RL","KB","MG"] },
  { iso:"BRA", c:"Marquinhos",           b:"Vinícius Júnior",       r:"Estêvão",                   initials:["MQ","VJ","ES"] },
  { iso:"CAN", c:"Jonathan David",       b:"Alphonso Davies",       r:"Luc de Fougerolles",        initials:["JD","AD","LF"] },
  { iso:"CPV", c:"Roberto Lopes",        b:"Ryan Mendes",           r:"Willy Semedo",              initials:["RL","RM","WS"] },
  { iso:"COL", c:"James Rodríguez",      b:"Luis Díaz",             r:"Yáser Asprilla",            initials:["JR","LD","YA"] },
  { iso:"CRO", c:"Joško Gvardiol",       b:"Luka Modrić",           r:"Luka Vušković",             initials:["JG","LM","LV"] },
  { iso:"CUW", c:"Leandro Bacuna",       b:"Tahith Chong",          r:"Sherel Floranus",           initials:["LB","TC","SF"] },
  { iso:"DEN", c:"Simon Kjær",           b:"Christian Eriksen",     r:"Conrad Harder",             initials:["SK","CE","CH"] },
  { iso:"ECU", c:"Enner Valencia",       b:"Moisés Caicedo",        r:"Kendry Páez",               initials:["EV","MC","KP"] },
  { iso:"EGY", c:"Ahmed Hegazi",         b:"Mohamed Salah",         r:"Omar Faied",                initials:["AH","MS","OF"] },
  { iso:"ENG", c:"Harry Kane",           b:"Jude Bellingham",       r:"Ethan Nwaneri",             initials:["HK","JB","EN"] },
  { iso:"FRA", c:"Aurélien Tchouaméni",  b:"Kylian Mbappé",         r:"Warren Zaïre-Emery",        initials:["AT","KM","WE"] },
  { iso:"GER", c:"Joshua Kimmich",       b:"Florian Wirtz",         r:"Brajan Gruda",              initials:["JK","FW","BG"] },
  { iso:"GHA", c:"André Ayew",           b:"Mohammed Kudus",        r:"Ernest Nuamah",             initials:["AA","MK","EN"] },
  { iso:"HAI", c:"Duckens Nazon",        b:"Frantzdy Pierrot",      r:"Don Deedson Louicius",      initials:["DN","FP","DL"] },
  { iso:"IRN", c:"Ehsan Hajsafi",        b:"Mehdi Taremi",          r:"Amir Hossein Hosseinzadeh", initials:["EH","MT","AH"] },
  { iso:"ITA", c:"Gianluigi Donnarumma", b:"Federico Chiesa",       r:"Cesare Casadei",            initials:["GD","FC","CC"] },
  { iso:"CIV", c:"Serge Aurier",         b:"Sébastien Haller",      r:"Karim Konaté",              initials:["SA","SH","KK"] },
  { iso:"JPN", c:"Wataru Endo",          b:"Takefusa Kubo",         r:"Yuito Suzuki",              initials:["WE","TK","YS"] },
  { iso:"JOR", c:"Ehsan Haddad",         b:"Musa Al-Taamari",       r:"Ali Olwan",                 initials:["EH","MT","AO"] },
  { iso:"MEX", c:"Edson Álvarez",        b:"Santiago Giménez",      r:"Gilberto Mora",             initials:["EA","SG","GM"] },
  { iso:"MAR", c:"Hakim Ziyech",         b:"Achraf Hakimi",         r:"Eliesse Ben Seghir",        initials:["HZ","AH","EB"] },
  { iso:"NED", c:"Frenkie de Jong",      b:"Virgil van Dijk",       r:"Jorrel Hato",               initials:["FJ","VD","JH"] },
  { iso:"NZL", c:"Chris Wood",           b:"Marko Stamenić",        r:"Ben Old",                   initials:["CW","MS","BO"] },
  { iso:"NOR", c:"Martin Ødegaard",      b:"Erling Haaland",        r:"Sindre Walle Egeli",        initials:["MO","EH","SE"] },
  { iso:"PAN", c:"Aníbal Godoy",         b:"Adalberto Carrasquilla",r:"Cecilio Waterman",          initials:["AG","AC","CW"] },
  { iso:"PAR", c:"Gustavo Gómez",        b:"Miguel Almirón",        r:"Diego Gómez",               initials:["GG","MA","DG"] },
  { iso:"POL", c:"Piotr Zieliński",      b:"Robert Lewandowski",    r:"Kacper Urbański",           initials:["PZ","RL","KU"] },
  { iso:"POR", c:"Rúben Dias",           b:"Cristiano Ronaldo",     r:"Rodrigo Mora",              initials:["RD","CR","RM"] },
  { iso:"QAT", c:"Hassan Al-Haydos",     b:"Akram Afif",            r:"Almoez Ali",                initials:["HH","AA","AA"] },
  { iso:"KSA", c:"Salem Al-Dawsari",     b:"Saud Abdulhamid",       r:"Saad Al-Naseri",            initials:["SD","SA","SN"] },
  { iso:"SCO", c:"Andy Robertson",       b:"Scott McTominay",       r:"Lennon Miller",             initials:["AR","SM","LM"] },
  { iso:"SEN", c:"Kalidou Koulibaly",    b:"Sadio Mané",            r:"Amara Diouf",               initials:["KK","SM","AD"] },
  { iso:"RSA", c:"Ronwen Williams",      b:"Lyle Foster",           r:"Mduduzi Shabalala",         initials:["RW","LF","MS"] },
  { iso:"KOR", c:"Lee Kang-in",          b:"Son Heung-min",         r:"Yang Min-hyuk",             initials:["LK","SH","YM"] },
  { iso:"ESP", c:"Rodri",                b:"Lamine Yamal",          r:"Pau Cubarsí",               initials:["RD","LY","PC"] },
  { iso:"SUI", c:"Granit Xhaka",         b:"Manuel Akanji",         r:"Ardon Jashari",             initials:["GX","MA","AJ"] },
  { iso:"TUN", c:"Ferjani Sassi",        b:"Hannibal Mejbri",       r:"Elias Saad",                initials:["FS","HM","ES"] },
  { iso:"TUR", c:"Hakan Çalhanoğlu",     b:"Arda Güler",            r:"Can Uzun",                  initials:["HC","AG","CU"] },
  { iso:"UKR", c:"Oleksandr Zinchenko",  b:"Mykhailo Mudryk",       r:"Heorhii Sudakov",           initials:["OZ","MM","HS"] },
  { iso:"USA", c:"Tyler Adams",          b:"Christian Pulisic",     r:"Cavan Sullivan",            initials:["TA","CP","CS"] },
  { iso:"URU", c:"Federico Valverde",    b:"Darwin Núñez",          r:"Luciano Rodríguez",         initials:["FV","DN","LR"] },
  { iso:"UZB", c:"Eldor Shomurodov",     b:"Abbosbek Fayzullaev",   r:"Khojimat Erkinov",          initials:["ES","AF","KE"] },
  { iso:"VEN", c:"Tomás Rincón",         b:"Salomón Rondón",        r:"Telasco Segovia",           initials:["TR","SR","TS"] },
  { iso:"WAL", c:"Ben Davies",           b:"Harry Wilson",          r:"Rubin Colwill",             initials:["BD","HW","RC"] },
];

// Build lookups: PLAYER_NAMES[iso].CPT/BST/RKE and INITIALS[iso].CPT/BST/RKE
window.PLAYER_NAMES = {};
window.PLAYER_INITIALS = {};
for (const p of window.PLAYERS) {
  window.PLAYER_NAMES[p.iso]    = { CPT: p.c,           BST: p.b,           RKE: p.r };
  window.PLAYER_INITIALS[p.iso] = { CPT: p.initials[0], BST: p.initials[1], RKE: p.initials[2] };
}

window.playerName = function(iso, role) {
  return (window.PLAYER_NAMES[iso] && window.PLAYER_NAMES[iso][role]) || `${iso} ${role}`;
};
window.playerInitials = function(iso, role) {
  return (window.PLAYER_INITIALS[iso] && window.PLAYER_INITIALS[iso][role]) || iso;
};
// Symbol shown on jersey under initials (uppercase surname-ish abbreviation)
window.playerHandle = function(iso, role) {
  const name = window.playerName(iso, role);
  // last word, uppercase, strip accents
  const parts = name.split(/[\s-]+/);
  const last = parts[parts.length - 1] || iso;
  return last.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
};
