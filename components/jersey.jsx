// GOAL — Country jersey SVG component
// Renders a stylized soccer jersey using the country's flag palette.
// Pattern matches the country's flag stripe direction.

const Jersey = ({ country, role = "CPT", number, initials, w = 80, h = 90, className = "", style = {} }) => {
  if (!country) return null;
  const [a, b, c] = country.colors;
  const s = country.stripe;

  // Pattern colors per stripe type — pick body/sleeve/accent
  let body = a, sleeve = a, stripe1 = null, stripe2 = null, pattern = "solid";
  switch (s) {
    case "h1": body = a; sleeve = a; stripe1 = b; pattern = "hband"; break;
    case "h2": body = a; sleeve = a; stripe1 = b; pattern = "hbandbig"; break;
    case "h3": body = b; sleeve = a; stripe1 = a; stripe2 = c; pattern = "tricolor"; break;
    case "h5": body = a; sleeve = a; stripe1 = b; pattern = "hstripes"; break;
    case "v2": body = a; sleeve = b; pattern = "half"; break;
    case "v3": body = b; sleeve = a; stripe1 = c; pattern = "panels"; break;
    case "diag": body = a; sleeve = b; stripe1 = c; pattern = "sash"; break;
    case "cross": body = a; sleeve = a; stripe1 = b; pattern = "cross"; break;
    case "circle": body = a; sleeve = a; stripe1 = b; pattern = "emblem"; break;
    case "quad": body = a; sleeve = b; stripe1 = c; pattern = "quad"; break;
    default: body = a; sleeve = a;
  }

  // Role tweak — captain has armband, rookie has plain, best has trim
  const armband = role === "CPT";
  const goldTrim = role === "BST";

  // Number color — auto contrast
  const numberColor = isLight(body) ? "#0A0807" : "#FFFFFF";

  return (
    <svg width={w} height={h} viewBox="0 0 100 110" className={className} style={{display:"block", ...style}} aria-hidden="true">
      {/* Jersey shape — body + sleeves */}
      <defs>
        <clipPath id={`jclip-${country.id}-${role}`}>
          <path d="
            M 30 12
            L 38 8
            Q 50 4 62 8
            L 70 12
            L 92 22
            L 86 42
            L 78 38
            L 78 100
            Q 78 105 73 105
            L 27 105
            Q 22 105 22 100
            L 22 38
            L 14 42
            L 8 22
            Z" />
        </clipPath>
      </defs>

      <g clipPath={`url(#jclip-${country.id}-${role})`}>
        {/* base body */}
        <rect x="0" y="0" width="100" height="110" fill={body}/>

        {/* PATTERN overlays */}
        {pattern === "hband" && (
          <rect x="0" y="44" width="100" height="22" fill={stripe1}/>
        )}
        {pattern === "hbandbig" && (
          <rect x="0" y="55" width="100" height="55" fill={stripe1}/>
        )}
        {pattern === "tricolor" && (<>
          <rect x="0" y="0"  width="100" height="36" fill={stripe1}/>
          <rect x="0" y="36" width="100" height="38" fill={body}/>
          <rect x="0" y="74" width="100" height="36" fill={stripe2}/>
        </>)}
        {pattern === "hstripes" && (<>
          <rect x="0" y="14" width="100" height="14" fill={stripe1}/>
          <rect x="0" y="42" width="100" height="14" fill={stripe1}/>
          <rect x="0" y="70" width="100" height="14" fill={stripe1}/>
          <rect x="0" y="98" width="100" height="14" fill={stripe1}/>
        </>)}
        {pattern === "half" && (
          <rect x="50" y="0" width="50" height="110" fill={sleeve}/>
        )}
        {pattern === "panels" && (<>
          <rect x="0"  y="0" width="33" height="110" fill={sleeve}/>
          <rect x="33" y="0" width="34" height="110" fill={body}/>
          <rect x="67" y="0" width="33" height="110" fill={stripe1}/>
        </>)}
        {pattern === "sash" && (
          <polygon points="0,30 30,0 100,80 100,110 60,110" fill={stripe1}/>
        )}
        {pattern === "cross" && (<>
          <rect x="38" y="0" width="14" height="110" fill={stripe1}/>
          <rect x="0" y="44" width="100" height="14" fill={stripe1}/>
        </>)}
        {pattern === "emblem" && (
          <circle cx="50" cy="55" r="18" fill={stripe1}/>
        )}
        {pattern === "quad" && (<>
          <rect x="50" y="0"  width="50" height="55" fill={stripe1}/>
          <rect x="0"  y="55" width="50" height="55" fill={stripe1}/>
        </>)}

        {/* collar V */}
        <path d="M 38 8 L 50 22 L 62 8 L 60 6 L 50 14 L 40 6 Z" fill="#0A0807" opacity="0.35"/>

        {/* gold trim for best */}
        {goldTrim && (<>
          <rect x="0" y="34" width="100" height="2" fill="#C9A04A" opacity="0.8"/>
          <rect x="0" y="74" width="100" height="2" fill="#C9A04A" opacity="0.8"/>
        </>)}
      </g>

      {/* outline */}
      <path d="
        M 30 12
        L 38 8
        Q 50 4 62 8
        L 70 12
        L 92 22
        L 86 42
        L 78 38
        L 78 100
        Q 78 105 73 105
        L 27 105
        Q 22 105 22 100
        L 22 38
        L 14 42
        L 8 22
        Z" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="1.2" strokeLinejoin="round"/>

      {/* number on chest */}
      {number !== undefined && number !== null && (
        <text x="50" y="78" textAnchor="middle"
              fontFamily="var(--f-display)" fontSize="32" fontWeight="700"
              fill={numberColor} style={{letterSpacing:"-0.04em"}}>
          {number}
        </text>
      )}

      {/* initials on chest (large center, like real jersey print) */}
      {initials && (
        <text x="50" y="60" textAnchor="middle"
              fontFamily="var(--f-display)" fontSize="22" fontWeight="700"
              fill={numberColor}
              stroke="rgba(0,0,0,0.4)" strokeWidth="0.6"
              style={{letterSpacing:"-0.03em"}}>
          {initials}
        </text>
      )}

      {/* captain armband */}
      {armband && (
        <g>
          <rect x="76" y="40" width="14" height="8" fill="#C9A04A" stroke="rgba(0,0,0,0.4)" strokeWidth="0.6"/>
          <text x="83" y="46" textAnchor="middle" fontFamily="var(--f-mono)" fontSize="6" fontWeight="700" fill="#0A0807">C</text>
        </g>
      )}
    </svg>
  );
};

// Helper — is hex color "light"?
function isLight(hex) {
  if (!hex || !hex.startsWith("#")) return false;
  const h = hex.slice(1);
  const x = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const r = parseInt(x.slice(0, 2), 16);
  const g = parseInt(x.slice(2, 4), 16);
  const b = parseInt(x.slice(4, 6), 16);
  // perceived luminance
  return (0.299 * r + 0.587 * g + 0.114 * b) > 165;
}

window.Jersey = Jersey;
