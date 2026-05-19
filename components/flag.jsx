// MATCH — Abstract flag SVG component
// Renders a stylized 3-color block per country. No real flag designs.

const Flag = ({ country, w = 60, h = 40, className = "", style = {} }) => {
  const [a, b, c] = country.colors;
  const s = country.stripe;
  return (
    <svg width={w} height={h} viewBox="0 0 60 40" className={className} style={{display:"block", ...style}} preserveAspectRatio="none">
      <rect width="60" height="40" fill={a} />
      {s === "h1" && <rect x="0" y="14" width="60" height="12" fill={b} />}
      {s === "h2" && (<>
        <rect x="0" y="0"  width="60" height="20" fill={a} />
        <rect x="0" y="20" width="60" height="20" fill={b} />
      </>)}
      {s === "h3" && (<>
        <rect x="0" y="0"  width="60" height="13.33" fill={a} />
        <rect x="0" y="13.33" width="60" height="13.34" fill={b} />
        <rect x="0" y="26.67" width="60" height="13.33" fill={c} />
      </>)}
      {s === "h5" && (<>
        <rect x="0" y="0" width="60" height="8" fill={a} />
        <rect x="0" y="8" width="60" height="8" fill={b} />
        <rect x="0" y="16" width="60" height="8" fill={a} />
        <rect x="0" y="24" width="60" height="8" fill={b} />
        <rect x="0" y="32" width="60" height="8" fill={a} />
      </>)}
      {s === "v2" && (<>
        <rect x="0"  y="0" width="30" height="40" fill={a} />
        <rect x="30" y="0" width="30" height="40" fill={b} />
      </>)}
      {s === "v3" && (<>
        <rect x="0"  y="0" width="20" height="40" fill={a} />
        <rect x="20" y="0" width="20" height="40" fill={b} />
        <rect x="40" y="0" width="20" height="40" fill={c} />
      </>)}
      {s === "diag" && (<>
        <polygon points="0,0 60,0 0,40" fill={b} />
        <polygon points="60,40 60,0 0,40" fill={c} />
      </>)}
      {s === "cross" && (<>
        <rect x="20" y="0" width="8" height="40" fill={b} />
        <rect x="0" y="16" width="60" height="8" fill={b} />
      </>)}
      {s === "circle" && (<>
        <circle cx="30" cy="20" r="9" fill={b} />
      </>)}
      {s === "quad" && (<>
        <rect x="30" y="0"  width="30" height="20" fill={b} />
        <rect x="0"  y="20" width="30" height="20" fill={b} />
        <rect x="30" y="20" width="30" height="20" fill={c} />
      </>)}
      <rect x="0" y="0" width="60" height="40" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="0.5" />
    </svg>
  );
};

window.Flag = Flag;
