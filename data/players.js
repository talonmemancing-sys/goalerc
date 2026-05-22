// GOAL — 144 player roster mapped to 48 countries × 3 roles
// roles: c=Captain, b=Best, r=Rookie. initials shown on the jersey center.
// Each role carries a Chinese name + an English (Latin-alphabet) name:
//   c/b/r   = 中文名
//   ce/be/re = English name
window.PLAYERS = [
  { iso:"ARG", c:"克里斯蒂安·罗梅罗",   ce:"Cristian Romero",      b:"利昂内尔·梅西",        be:"Lionel Messi",          r:"尼科·帕斯",              re:"Nico Paz",                  initials:["CR","LM","NP"] },
  { iso:"AUS", c:"哈里·苏塔尔",         ce:"Harry Souttar",        b:"马修·瑞安",            be:"Mathew Ryan",           r:"加朗·库奥尔",            re:"Garang Kuol",               initials:["HS","MR","GK"] },
  { iso:"AUT", c:"马塞尔·扎比策尔",     ce:"Marcel Sabitzer",      b:"大卫·阿拉巴",          be:"David Alaba",           r:"奥盖内泰吉里·阿德杰努胡雷", re:"Oghenetejiri Adejenughure", initials:["MS","DA","OA"] },
  { iso:"BEL", c:"罗梅卢·卢卡库",       ce:"Romelu Lukaku",        b:"凯文·德布劳内",        be:"Kevin De Bruyne",       r:"米卡·戈茨",              re:"Mika Godts",                initials:["RL","KB","MG"] },
  { iso:"BRA", c:"马尔基尼奥斯",         ce:"Marquinhos",           b:"维尼修斯·儒尼奥尔",    be:"Vinícius Júnior",       r:"埃斯特旺",                re:"Estêvão",                   initials:["MQ","VJ","ES"] },
  { iso:"CAN", c:"乔纳森·戴维",         ce:"Jonathan David",       b:"阿方索·戴维斯",        be:"Alphonso Davies",       r:"卢克·德富热罗勒",        re:"Luc de Fougerolles",        initials:["JD","AD","LF"] },
  { iso:"CPV", c:"罗伯托·洛佩斯",       ce:"Roberto Lopes",        b:"瑞安·门德斯",          be:"Ryan Mendes",           r:"威利·塞梅多",            re:"Willy Semedo",              initials:["RL","RM","WS"] },
  { iso:"COL", c:"哈梅斯·罗德里格斯",   ce:"James Rodríguez",      b:"路易斯·迪亚斯",        be:"Luis Díaz",             r:"亚塞尔·阿斯普里利亚",    re:"Yáser Asprilla",            initials:["JR","LD","YA"] },
  { iso:"CRO", c:"约什科·格瓦迪奥尔",   ce:"Joško Gvardiol",       b:"卢卡·莫德里奇",        be:"Luka Modrić",           r:"卢卡·武什科维奇",        re:"Luka Vušković",             initials:["JG","LM","LV"] },
  { iso:"CUW", c:"莱安德罗·巴库纳",     ce:"Leandro Bacuna",       b:"塔伊斯·钟",            be:"Tahith Chong",          r:"谢雷尔·弗洛拉努斯",      re:"Shurandy Florius",          initials:["LB","TC","SF"] },
  { iso:"DEN", c:"西蒙·克亚尔",         ce:"Simon Kjær",           b:"克里斯蒂安·埃里克森",  be:"Christian Eriksen",     r:"康拉德·哈德",            re:"Conrad Harder",             initials:["SK","CE","CH"] },
  { iso:"ECU", c:"恩纳·巴伦西亚",       ce:"Enner Valencia",       b:"莫伊塞斯·凯塞多",      be:"Moisés Caicedo",        r:"肯德里·帕埃斯",          re:"Kendry Páez",               initials:["EV","MC","KP"] },
  { iso:"EGY", c:"艾哈迈德·赫加齐",     ce:"Ahmed Hegazi",         b:"穆罕默德·萨拉赫",      be:"Mohamed Salah",         r:"奥马尔·法伊德",          re:"Omar Fayed",                initials:["AH","MS","OF"] },
  { iso:"ENG", c:"哈里·凯恩",           ce:"Harry Kane",           b:"裘德·贝林厄姆",        be:"Jude Bellingham",       r:"伊森·恩瓦内里",          re:"Ethan Nwaneri",             initials:["HK","JB","EN"] },
  { iso:"FRA", c:"奥雷利安·楚阿梅尼",   ce:"Aurélien Tchouaméni",  b:"基利安·姆巴佩",        be:"Kylian Mbappé",         r:"沃伦·扎伊尔-埃梅里",     re:"Warren Zaïre-Emery",        initials:["AT","KM","WE"] },
  { iso:"GER", c:"约书亚·基米希",       ce:"Joshua Kimmich",       b:"弗洛里安·维尔茨",      be:"Florian Wirtz",         r:"布拉扬·格鲁达",          re:"Brajan Gruda",              initials:["JK","FW","BG"] },
  { iso:"GHA", c:"安德烈·阿尤",         ce:"André Ayew",           b:"穆罕默德·库杜斯",      be:"Mohammed Kudus",        r:"埃内斯特·努阿马",        re:"Ernest Nuamah",             initials:["AA","MK","EN"] },
  { iso:"HAI", c:"达肯斯·纳松",         ce:"Duckens Nazon",        b:"弗朗茨迪·皮埃罗",      be:"Frantzdy Pierrot",      r:"唐·迪德森·路易修斯",     re:"Don Deedson Louicius",      initials:["DN","FP","DL"] },
  { iso:"IRN", c:"埃赫桑·哈伊萨菲",     ce:"Ehsan Hajsafi",        b:"迈赫迪·塔雷米",        be:"Mehdi Taremi",          r:"阿米尔·侯赛因·侯赛因扎德", re:"Amirhossein Hosseinzadeh",  initials:["EH","MT","AH"] },
  { iso:"ITA", c:"贾尼路易吉·多纳鲁马", ce:"Gianluigi Donnarumma", b:"费德里科·基耶萨",      be:"Federico Chiesa",       r:"切萨雷·卡萨德伊",        re:"Cesare Casadei",            initials:["GD","FC","CC"] },
  { iso:"CIV", c:"塞尔日·奥里耶",       ce:"Serge Aurier",         b:"塞巴斯蒂安·阿勒",      be:"Sébastien Haller",      r:"卡里姆·科纳特",          re:"Karim Konaté",              initials:["SA","SH","KK"] },
  { iso:"JPN", c:"远藤航",               ce:"Wataru Endō",          b:"久保建英",             be:"Takefusa Kubo",         r:"铃木唯人",                re:"Yuito Suzuki",              initials:["WE","TK","YS"] },
  { iso:"JOR", c:"埃赫桑·哈达德",       ce:"Ehsan Haddad",         b:"穆萨·塔马里",          be:"Mousa Al-Tamari",       r:"阿里·奥尔万",            re:"Ali Olwan",                 initials:["EH","MT","AO"] },
  { iso:"MEX", c:"埃德森·阿尔瓦雷斯",   ce:"Edson Álvarez",        b:"圣地亚哥·希门尼斯",    be:"Santiago Giménez",      r:"吉尔伯托·莫拉",          re:"Gilberto Mora",             initials:["EA","SG","GM"] },
  { iso:"MAR", c:"哈基姆·齐耶赫",       ce:"Hakim Ziyech",         b:"阿什拉夫·哈基米",      be:"Achraf Hakimi",         r:"埃利斯·本·塞吉尔",       re:"Eliesse Ben Seghir",        initials:["HZ","AH","EB"] },
  { iso:"NED", c:"弗伦基·德容",         ce:"Frenkie de Jong",      b:"维吉尔·范戴克",        be:"Virgil van Dijk",       r:"约雷尔·哈托",            re:"Jorrel Hato",               initials:["FJ","VD","JH"] },
  { iso:"NZL", c:"克里斯·伍德",         ce:"Chris Wood",           b:"马尔科·斯塔梅尼奇",    be:"Marko Stamenić",        r:"本·奥尔德",              re:"Ben Old",                   initials:["CW","MS","BO"] },
  { iso:"NOR", c:"马丁·厄德高",         ce:"Martin Ødegaard",      b:"埃尔林·哈兰德",        be:"Erling Haaland",        r:"辛德雷·瓦勒·埃格利",     re:"Sindre Walle Egeli",        initials:["MO","EH","SE"] },
  { iso:"PAN", c:"阿尼瓦尔·戈多伊",     ce:"Aníbal Godoy",         b:"阿达尔贝托·卡拉斯基利亚", be:"Adalberto Carrasquilla", r:"塞西利奥·沃特曼",        re:"Cecilio Waterman",          initials:["AG","AC","CW"] },
  { iso:"PAR", c:"古斯塔沃·戈麦斯",     ce:"Gustavo Gómez",        b:"米格尔·阿尔米隆",      be:"Miguel Almirón",        r:"迭戈·戈麦斯",            re:"Diego Gómez",               initials:["GG","MA","DG"] },
  { iso:"POL", c:"彼得·齐林斯基",       ce:"Piotr Zieliński",      b:"罗伯特·莱万多夫斯基",  be:"Robert Lewandowski",    r:"卡佩尔·乌尔班斯基",      re:"Kacper Urbański",           initials:["PZ","RL","KU"] },
  { iso:"POR", c:"鲁本·迪亚斯",         ce:"Rúben Dias",           b:"C罗",                  be:"Cristiano Ronaldo",     r:"罗德里戈·莫拉",          re:"Rodrigo Mora",              initials:["RD","CR","RM"] },
  { iso:"QAT", c:"哈桑·海多斯",         ce:"Hassan Al-Haydos",     b:"阿克拉姆·阿菲夫",      be:"Akram Afif",            r:"阿尔莫埃兹·阿里",        re:"Almoez Ali",                initials:["HH","AA","AA"] },
  { iso:"KSA", c:"萨利姆·道萨里",       ce:"Salem Al-Dawsari",     b:"绍德·阿卜杜勒哈米德",  be:"Saud Abdulhamid",       r:"萨阿德·纳塞里",          re:"Saad Al-Nasser",            initials:["SD","SA","SN"] },
  { iso:"SCO", c:"安迪·罗伯逊",         ce:"Andy Robertson",       b:"斯科特·麦克托米奈",    be:"Scott McTominay",       r:"伦农·米勒",              re:"Lennon Miller",             initials:["AR","SM","LM"] },
  { iso:"SEN", c:"卡利杜·库利巴利",     ce:"Kalidou Koulibaly",    b:"萨迪奥·马内",          be:"Sadio Mané",            r:"阿马拉·迪乌夫",          re:"Amara Diouf",               initials:["KK","SM","AD"] },
  { iso:"RSA", c:"龙文·威廉姆斯",       ce:"Ronwen Williams",      b:"莱尔·福斯特",          be:"Lyle Foster",           r:"姆杜杜齐·沙巴拉拉",      re:"Mduduzi Shabalala",         initials:["RW","LF","MS"] },
  { iso:"KOR", c:"李刚仁",               ce:"Lee Kang-in",          b:"孙兴慜",               be:"Son Heung-min",         r:"梁玟赫",                  re:"Yang Min-hyeok",            initials:["LK","SH","YM"] },
  { iso:"ESP", c:"罗德里",               ce:"Rodri",                b:"拉明·亚马尔",          be:"Lamine Yamal",          r:"保·库巴尔西",            re:"Pau Cubarsí",               initials:["RD","LY","PC"] },
  { iso:"SUI", c:"格拉尼特·扎卡",       ce:"Granit Xhaka",         b:"曼努埃尔·阿坎吉",      be:"Manuel Akanji",         r:"阿尔东·亚沙里",          re:"Ardon Jashari",             initials:["GX","MA","AJ"] },
  { iso:"TUN", c:"费尔贾尼·萨西",       ce:"Ferjani Sassi",        b:"汉尼拔·梅杰布里",      be:"Hannibal Mejbri",       r:"埃利亚斯·萨德",          re:"Elias Saâd",                initials:["FS","HM","ES"] },
  { iso:"TUR", c:"哈坎·恰尔汗奥卢",     ce:"Hakan Çalhanoğlu",     b:"阿尔达·居莱尔",        be:"Arda Güler",            r:"詹·乌尊",                re:"Can Uzun",                  initials:["HC","AG","CU"] },
  { iso:"UKR", c:"奥莱克桑德尔·津琴科", ce:"Oleksandr Zinchenko",  b:"米哈伊洛·穆德里克",    be:"Mykhailo Mudryk",       r:"赫奥尔吉·苏达科夫",      re:"Heorhiy Sudakov",           initials:["OZ","MM","HS"] },
  { iso:"USA", c:"泰勒·亚当斯",         ce:"Tyler Adams",          b:"克里斯蒂安·普利西奇",  be:"Christian Pulisic",     r:"卡万·沙利文",            re:"Cavan Sullivan",            initials:["TA","CP","CS"] },
  { iso:"URU", c:"费德里科·巴尔韦德",   ce:"Federico Valverde",    b:"达尔文·努涅斯",        be:"Darwin Núñez",          r:"卢西亚诺·罗德里格斯",    re:"Luciano Rodríguez",         initials:["FV","DN","LR"] },
  { iso:"UZB", c:"埃尔多尔·绍穆罗多夫", ce:"Eldor Shomurodov",     b:"阿博斯别克·法伊祖拉耶夫", be:"Abbosbek Fayzullaev",   r:"霍吉马特·埃尔基诺夫",    re:"Khojimat Erkinov",          initials:["ES","AF","KE"] },
  { iso:"VEN", c:"托马斯·林孔",         ce:"Tomás Rincón",         b:"萨洛蒙·隆东",          be:"Salomón Rondón",        r:"特拉斯科·塞戈维亚",      re:"Telasco Segovia",           initials:["TR","SR","TS"] },
  { iso:"WAL", c:"本·戴维斯",           ce:"Ben Davies",           b:"哈里·威尔逊",          be:"Harry Wilson",          r:"鲁宾·科尔威尔",          re:"Rubin Colwill",             initials:["BD","HW","RC"] },
];

// Build lookups: PLAYER_NAMES[iso].CPT/BST/RKE and INITIALS[iso].CPT/BST/RKE
// PLAYER_NAMES holds { zh, en } pairs so playerName() can switch by language.
window.PLAYER_NAMES = {};
window.PLAYER_INITIALS = {};
for (const p of window.PLAYERS) {
  window.PLAYER_NAMES[p.iso]    = {
    CPT: { zh: p.c, en: p.ce },
    BST: { zh: p.b, en: p.be },
    RKE: { zh: p.r, en: p.re },
  };
  window.PLAYER_INITIALS[p.iso] = { CPT: p.initials[0], BST: p.initials[1], RKE: p.initials[2] };
}

window.playerName = function(iso, role) {
  const entry = window.PLAYER_NAMES[iso] && window.PLAYER_NAMES[iso][role];
  if (!entry) return `${iso} ${role}`;
  return window.LANG === "en" ? (entry.en || entry.zh) : (entry.zh || entry.en);
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
