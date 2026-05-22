// FOOTBALL — 双语 i18n。
// 用法:JSX 文本里 {L("中文","English")};属性/表达式里 L("中文","English")。
// 默认中文,localStorage 记忆,切换时通知 App 整树重渲染。
(function () {
  const KEY = "football_lang";
  let lang = "zh";
  try {
    const s = localStorage.getItem(KEY);
    if (s === "en" || s === "zh") lang = s;
  } catch {}
  window.LANG = lang;

  const subs = new Set();

  // 主翻译函数 —— 按当前语言返回。en 缺省时回退中文。
  window.L = function (zh, en) {
    return window.LANG === "en" ? (en == null ? zh : en) : zh;
  };

  window.setLang = function (l) {
    if (l !== "en" && l !== "zh") return;
    window.LANG = l;
    try { localStorage.setItem(KEY, l); } catch {}
    document.documentElement.lang = l === "en" ? "en" : "zh-CN";
    subs.forEach((fn) => { try { fn(l); } catch {} });
  };

  window.toggleLang = function () {
    window.setLang(window.LANG === "en" ? "zh" : "en");
  };

  // 订阅语言变化 —— App 用它触发整树重渲染。返回取消订阅函数。
  window.onLangChange = function (fn) {
    subs.add(fn);
    return function () { subs.delete(fn); };
  };

  document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
})();
