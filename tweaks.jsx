// FOOTBALL — Tweaks panel
// Exposes the polish dials the user can flip live.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#6868FF",
  "fire": "#E2570C",
  "displayFont": "Geist",
  "sansFont": "Geist",
  "monoFont": "Geist Mono",
  "background": "#0A0807",
  "grain": true,
  "tickerOn": true,
  "burnHeroSize": 1,
  "countryGridCols": 6,
  "showV4Hook": true,
  "headlineMode": "two-line"
}/*EDITMODE-END*/;

function MatchTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Live apply tokens
  React.useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--accent", t.accent);
    r.setProperty("--accent-glow", hexA(t.accent, 0.18));
    r.setProperty("--accent-soft", hexA(t.accent, 0.08));
    r.setProperty("--fire", t.fire);
    r.setProperty("--fire-glow", hexA(t.fire, 0.22));
    r.setProperty("--bg", t.background);
    r.setProperty("--f-display", `"${t.displayFont}", -apple-system, system-ui, sans-serif`);
    r.setProperty("--f-sans",    `"${t.sansFont}", -apple-system, system-ui, sans-serif`);
    r.setProperty("--f-mono",    `"${t.monoFont}", ui-monospace, "SF Mono", monospace`);
    document.body.classList.toggle("grain", !!t.grain);
    document.body.classList.toggle("tweak-no-ticker", !t.tickerOn);
    document.body.classList.toggle("tweak-no-v4", !t.showV4Hook);
    document.body.classList.toggle("tweak-headline-single", t.headlineMode === "single");
    document.body.style.setProperty("--burn-hero-scale", t.burnHeroSize);
    document.body.style.setProperty("--country-cols", t.countryGridCols);
  }, [t]);

  return (
    <TweaksPanel title="FOOTBALL · Tweaks">
      <TweakSection label="Brand color"/>
      <TweakColor label="Accent" value={t.accent}
        options={["#6868FF","#7B8CFF","#34D2A1","#F5A623","#E84393","#FFFFFF"]}
        onChange={v => setTweak("accent", v)}/>
      <TweakColor label="Burn" value={t.fire}
        options={["#E2570C","#FF3D00","#FF6E40","#C9A04A","#F58A2E","#FF1C1C"]}
        onChange={v => setTweak("fire", v)}/>
      <TweakColor label="Background" value={t.background}
        options={["#0A0807","#000000","#0E0D14","#0A0E14","#101010","#FAFAF7"]}
        onChange={v => setTweak("background", v)}/>

      <TweakSection label="Typography"/>
      <TweakSelect label="Display" value={t.displayFont}
        options={["Geist","Bricolage Grotesque","Onest","Fraunces","Newsreader","Instrument Serif"]}
        onChange={v => setTweak("displayFont", v)}/>
      <TweakSelect label="Body" value={t.sansFont}
        options={["Geist","Onest","Bricolage Grotesque","Inter Tight"]}
        onChange={v => setTweak("sansFont", v)}/>
      <TweakSelect label="Mono" value={t.monoFont}
        options={["Geist Mono","JetBrains Mono","IBM Plex Mono","Space Mono"]}
        onChange={v => setTweak("monoFont", v)}/>
      <TweakRadio label="Headline" value={t.headlineMode}
        options={["two-line","single"]}
        onChange={v => setTweak("headlineMode", v)}/>

      <TweakSection label="Surface"/>
      <TweakToggle label="Grain overlay" value={t.grain} onChange={v => setTweak("grain", v)}/>
      <TweakToggle label="Ticker tape"  value={t.tickerOn} onChange={v => setTweak("tickerOn", v)}/>
      <TweakToggle label="Treasury callout" value={t.showV4Hook} onChange={v => setTweak("showV4Hook", v)}/>

      <TweakSection label="Layout"/>
      <TweakRadio label="Country grid" value={String(t.countryGridCols)}
        options={["4","6","8"]}
        onChange={v => setTweak("countryGridCols", Number(v))}/>
      <TweakSlider label="Burn hero scale" value={t.burnHeroSize} min={0.7} max={1.4} step={0.05}
        onChange={v => setTweak("burnHeroSize", v)}/>
    </TweaksPanel>
  );
}

// hex utilities
function hexA(hex, a) {
  if (!hex || !hex.startsWith("#")) return hex;
  const h = hex.slice(1);
  const x = h.length === 3 ? h.split("").map(c=>c+c).join("") : h;
  const r = parseInt(x.slice(0,2),16), g = parseInt(x.slice(2,4),16), b = parseInt(x.slice(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}

// Mount the tweaks panel as a sibling root
(function mountTweaks() {
  const host = document.createElement("div");
  host.id = "match-tweaks-root";
  document.body.appendChild(host);
  ReactDOM.createRoot(host).render(<MatchTweaks/>);

  // Tweak-driven body classes
  const sheet = document.createElement("style");
  sheet.textContent = `
    body.tweak-no-ticker .ticker { display: none; }
    body.tweak-no-v4 .home-v4 { display: none; }
    body.tweak-headline-single .home-hero-headline { flex-direction: row; gap: 0.3em; }
    body.tweak-headline-single .home-hero-headline .line-2 { align-self: auto; margin-top: 0; }
    .burn-hero-num { transform: scale(var(--burn-hero-scale, 1)); transform-origin: left; }
    .home-countries-grid { grid-template-columns: repeat(var(--country-cols, 6), 1fr); }
    @media (max-width: 1200px) { .home-countries-grid { grid-template-columns: repeat(min(var(--country-cols, 6), 4), 1fr); } }
    @media (max-width: 800px)  { .home-countries-grid { grid-template-columns: repeat(2, 1fr); } }
  `;
  document.head.appendChild(sheet);
})();
