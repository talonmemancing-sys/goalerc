// GOAL — 144 player roster mapped to 48 countries × 3 roles
// roles: c=Captain, b=Best, r=Rookie. initials shown on the jersey center.
window.PLAYERS = [
  { iso:"ARG", c:"克里斯蒂安·罗梅罗",   b:"利昂内尔·梅西",        r:"尼科·帕斯",              initials:["CR","LM","NP"] },
  { iso:"AUS", c:"哈里·苏塔尔",         b:"马修·瑞安",            r:"加朗·库奥尔",            initials:["HS","MR","GK"] },
  { iso:"AUT", c:"马塞尔·扎比策尔",     b:"大卫·阿拉巴",          r:"奥盖内泰吉里·阿德杰努胡雷", initials:["MS","DA","OA"] },
  { iso:"BEL", c:"罗梅卢·卢卡库",       b:"凯文·德布劳内",        r:"米卡·戈茨",              initials:["RL","KB","MG"] },
  { iso:"BRA", c:"马尔基尼奥斯",         b:"维尼修斯·儒尼奥尔",    r:"埃斯特旺",                initials:["MQ","VJ","ES"] },
  { iso:"CAN", c:"乔纳森·戴维",         b:"阿方索·戴维斯",        r:"卢克·德富热罗勒",        initials:["JD","AD","LF"] },
  { iso:"CPV", c:"罗伯托·洛佩斯",       b:"瑞安·门德斯",          r:"威利·塞梅多",            initials:["RL","RM","WS"] },
  { iso:"COL", c:"哈梅斯·罗德里格斯",   b:"路易斯·迪亚斯",        r:"亚塞尔·阿斯普里利亚",    initials:["JR","LD","YA"] },
  { iso:"CRO", c:"约什科·格瓦迪奥尔",   b:"卢卡·莫德里奇",        r:"卢卡·武什科维奇",        initials:["JG","LM","LV"] },
  { iso:"CUW", c:"莱安德罗·巴库纳",     b:"塔伊斯·钟",            r:"谢雷尔·弗洛拉努斯",      initials:["LB","TC","SF"] },
  { iso:"DEN", c:"西蒙·克亚尔",         b:"克里斯蒂安·埃里克森",  r:"康拉德·哈德",            initials:["SK","CE","CH"] },
  { iso:"ECU", c:"恩纳·巴伦西亚",       b:"莫伊塞斯·凯塞多",      r:"肯德里·帕埃斯",          initials:["EV","MC","KP"] },
  { iso:"EGY", c:"艾哈迈德·赫加齐",     b:"穆罕默德·萨拉赫",      r:"奥马尔·法伊德",          initials:["AH","MS","OF"] },
  { iso:"ENG", c:"哈里·凯恩",           b:"裘德·贝林厄姆",        r:"伊森·恩瓦内里",          initials:["HK","JB","EN"] },
  { iso:"FRA", c:"奥雷利安·楚阿梅尼",   b:"基利安·姆巴佩",        r:"沃伦·扎伊尔-埃梅里",     initials:["AT","KM","WE"] },
  { iso:"GER", c:"约书亚·基米希",       b:"弗洛里安·维尔茨",      r:"布拉扬·格鲁达",          initials:["JK","FW","BG"] },
  { iso:"GHA", c:"安德烈·阿尤",         b:"穆罕默德·库杜斯",      r:"埃内斯特·努阿马",        initials:["AA","MK","EN"] },
  { iso:"HAI", c:"达肯斯·纳松",         b:"弗朗茨迪·皮埃罗",      r:"唐·迪德森·路易修斯",     initials:["DN","FP","DL"] },
  { iso:"IRN", c:"埃赫桑·哈伊萨菲",     b:"迈赫迪·塔雷米",        r:"阿米尔·侯赛因·侯赛因扎德", initials:["EH","MT","AH"] },
  { iso:"ITA", c:"贾尼路易吉·多纳鲁马", b:"费德里科·基耶萨",      r:"切萨雷·卡萨德伊",        initials:["GD","FC","CC"] },
  { iso:"CIV", c:"塞尔日·奥里耶",       b:"塞巴斯蒂安·阿勒",      r:"卡里姆·科纳特",          initials:["SA","SH","KK"] },
  { iso:"JPN", c:"远藤航",               b:"久保建英",             r:"铃木唯人",                initials:["WE","TK","YS"] },
  { iso:"JOR", c:"埃赫桑·哈达德",       b:"穆萨·塔马里",          r:"阿里·奥尔万",            initials:["EH","MT","AO"] },
  { iso:"MEX", c:"埃德森·阿尔瓦雷斯",   b:"圣地亚哥·希门尼斯",    r:"吉尔伯托·莫拉",          initials:["EA","SG","GM"] },
  { iso:"MAR", c:"哈基姆·齐耶赫",       b:"阿什拉夫·哈基米",      r:"埃利斯·本·塞吉尔",       initials:["HZ","AH","EB"] },
  { iso:"NED", c:"弗伦基·德容",         b:"维吉尔·范戴克",        r:"约雷尔·哈托",            initials:["FJ","VD","JH"] },
  { iso:"NZL", c:"克里斯·伍德",         b:"马尔科·斯塔梅尼奇",    r:"本·奥尔德",              initials:["CW","MS","BO"] },
  { iso:"NOR", c:"马丁·厄德高",         b:"埃尔林·哈兰德",        r:"辛德雷·瓦勒·埃格利",     initials:["MO","EH","SE"] },
  { iso:"PAN", c:"阿尼瓦尔·戈多伊",     b:"阿达尔贝托·卡拉斯基利亚",r:"塞西利奥·沃特曼",       initials:["AG","AC","CW"] },
  { iso:"PAR", c:"古斯塔沃·戈麦斯",     b:"米格尔·阿尔米隆",      r:"迭戈·戈麦斯",            initials:["GG","MA","DG"] },
  { iso:"POL", c:"彼得·齐林斯基",       b:"罗伯特·莱万多夫斯基",  r:"卡佩尔·乌尔班斯基",      initials:["PZ","RL","KU"] },
  { iso:"POR", c:"鲁本·迪亚斯",         b:"C罗",                  r:"罗德里戈·莫拉",          initials:["RD","CR","RM"] },
  { iso:"QAT", c:"哈桑·海多斯",         b:"阿克拉姆·阿菲夫",      r:"阿尔莫埃兹·阿里",        initials:["HH","AA","AA"] },
  { iso:"KSA", c:"萨利姆·道萨里",       b:"绍德·阿卜杜勒哈米德",  r:"萨阿德·纳塞里",          initials:["SD","SA","SN"] },
  { iso:"SCO", c:"安迪·罗伯逊",         b:"斯科特·麦克托米奈",    r:"伦农·米勒",              initials:["AR","SM","LM"] },
  { iso:"SEN", c:"卡利杜·库利巴利",     b:"萨迪奥·马内",          r:"阿马拉·迪乌夫",          initials:["KK","SM","AD"] },
  { iso:"RSA", c:"龙文·威廉姆斯",       b:"莱尔·福斯特",          r:"姆杜杜齐·沙巴拉拉",      initials:["RW","LF","MS"] },
  { iso:"KOR", c:"李刚仁",               b:"孙兴慜",               r:"梁玟赫",                  initials:["LK","SH","YM"] },
  { iso:"ESP", c:"罗德里",               b:"拉明·亚马尔",          r:"保·库巴尔西",            initials:["RD","LY","PC"] },
  { iso:"SUI", c:"格拉尼特·扎卡",       b:"曼努埃尔·阿坎吉",      r:"阿尔东·亚沙里",          initials:["GX","MA","AJ"] },
  { iso:"TUN", c:"费尔贾尼·萨西",       b:"汉尼拔·梅杰布里",      r:"埃利亚斯·萨德",          initials:["FS","HM","ES"] },
  { iso:"TUR", c:"哈坎·恰尔汗奥卢",     b:"阿尔达·居莱尔",        r:"詹·乌尊",                initials:["HC","AG","CU"] },
  { iso:"UKR", c:"奥莱克桑德尔·津琴科", b:"米哈伊洛·穆德里克",    r:"赫奥尔吉·苏达科夫",      initials:["OZ","MM","HS"] },
  { iso:"USA", c:"泰勒·亚当斯",         b:"克里斯蒂安·普利西奇",  r:"卡万·沙利文",            initials:["TA","CP","CS"] },
  { iso:"URU", c:"费德里科·巴尔韦德",   b:"达尔文·努涅斯",        r:"卢西亚诺·罗德里格斯",    initials:["FV","DN","LR"] },
  { iso:"UZB", c:"埃尔多尔·绍穆罗多夫", b:"阿博斯别克·法伊祖拉耶夫",r:"霍吉马特·埃尔基诺夫",   initials:["ES","AF","KE"] },
  { iso:"VEN", c:"托马斯·林孔",         b:"萨洛蒙·隆东",          r:"特拉斯科·塞戈维亚",      initials:["TR","SR","TS"] },
  { iso:"WAL", c:"本·戴维斯",           b:"哈里·威尔逊",          r:"鲁宾·科尔威尔",          initials:["BD","HW","RC"] },
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
