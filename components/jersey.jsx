// FOOTBALL — Country jersey SVG component
// Renders a stylized soccer jersey using the country's actual kit colors
// (where known) or flag colors as fallback. Shows only the number on the
// chest; the player name/initials are displayed by the parent card below.

// Real national-team home-kit color palettes for the well-known sides.
// `[body, secondary, accent]` — body is dominant. Falls back to country.colors
// (flag palette) when the iso isn't here.
const KIT_COLORS = {
  ARG: { colors: ["#75AADB", "#FFFFFF", "#FCBF49"], pattern: "vstripes" },     // light blue / white vertical stripes
  AUS: { colors: ["#FFD400", "#006A4E", "#FFFFFF"], pattern: "solid"     },     // socceroos yellow / green trim
  AUT: { colors: ["#ED2939", "#FFFFFF", "#FFFFFF"], pattern: "solid"     },     // red home
  BEL: { colors: ["#C8102E", "#000000", "#FCD116"], pattern: "solid"     },     // red devils
  BRA: { colors: ["#FFCD00", "#009C3B", "#012169"], pattern: "solid"     },     // canarinho yellow
  CAN: { colors: ["#FF0000", "#FFFFFF", "#FF0000"], pattern: "solid"     },     // red home
  CPV: { colors: ["#003893", "#FFFFFF", "#CF2027"], pattern: "solid"     },
  COL: { colors: ["#FCBF49", "#0033A0", "#CE1126"], pattern: "solid"     },     // yellow home
  CRO: { colors: ["#FFFFFF", "#CC2A36", "#171796"], pattern: "checker"   },     // famous red/white checkerboard
  CUW: { colors: ["#002B7F", "#F9E814", "#FFFFFF"], pattern: "solid"     },
  DEN: { colors: ["#C8102E", "#FFFFFF", "#FFFFFF"], pattern: "solid"     },     // red home
  ECU: { colors: ["#FFCE00", "#003893", "#CE1126"], pattern: "solid"     },     // yellow home
  EGY: { colors: ["#CE1126", "#FFFFFF", "#000000"], pattern: "solid"     },
  ENG: { colors: ["#FFFFFF", "#003C71", "#CE1124"], pattern: "solid"     },     // three lions white
  FRA: { colors: ["#0055A4", "#FFFFFF", "#EF4135"], pattern: "solid"     },     // les bleus
  GER: { colors: ["#FFFFFF", "#1A1A1A", "#DD0000"], pattern: "solid"     },     // die mannschaft white w/ black trim
  GHA: { colors: ["#FFFFFF", "#006B3F", "#FCD116"], pattern: "solid"     },     // black stars white home
  HAI: { colors: ["#00209F", "#FFFFFF", "#D21034"], pattern: "solid"     },
  IRN: { colors: ["#FFFFFF", "#239F40", "#DA0000"], pattern: "solid"     },     // team melli white
  ITA: { colors: ["#1565C0", "#FFFFFF", "#FFFFFF"], pattern: "solid"     },     // azzurri blue
  CIV: { colors: ["#F77F00", "#FFFFFF", "#009E60"], pattern: "solid"     },     // les éléphants orange
  JPN: { colors: ["#000080", "#FFFFFF", "#BC002D"], pattern: "solid"     },     // samurai blue
  JOR: { colors: ["#FFFFFF", "#007A3D", "#000000"], pattern: "solid"     },
  MEX: { colors: ["#006847", "#FFFFFF", "#CE1126"], pattern: "solid"     },     // el tri green
  MAR: { colors: ["#C1272D", "#006233", "#FFFFFF"], pattern: "solid"     },     // atlas lions red
  NED: { colors: ["#FF6600", "#FFFFFF", "#21468B"], pattern: "solid"     },     // oranje
  NZL: { colors: ["#FFFFFF", "#000000", "#000000"], pattern: "solid"     },     // all whites
  NOR: { colors: ["#EF2B2D", "#FFFFFF", "#002868"], pattern: "solid"     },
  PAN: { colors: ["#D21034", "#005AA7", "#FFFFFF"], pattern: "solid"     },
  PAR: { colors: ["#D52B1E", "#FFFFFF", "#0038A8"], pattern: "vstripes" },     // red & white vertical stripes
  POL: { colors: ["#FFFFFF", "#DC143C", "#FFFFFF"], pattern: "solid"     },     // biało-czerwoni white
  POR: { colors: ["#7A0019", "#006600", "#FFCC00"], pattern: "solid"     },     // dark red w/ green/gold
  QAT: { colors: ["#8D1B3D", "#FFFFFF", "#8D1B3D"], pattern: "solid"     },
  KSA: { colors: ["#FFFFFF", "#006C35", "#006C35"], pattern: "solid"     },     // green falcons white home
  SCO: { colors: ["#0065BD", "#FFFFFF", "#FFFFFF"], pattern: "solid"     },     // dark blue
  SEN: { colors: ["#FFFFFF", "#00853F", "#E31B23"], pattern: "solid"     },     // teranga lions white
  RSA: { colors: ["#FCD116", "#007A4D", "#000000"], pattern: "solid"     },     // bafana yellow
  KOR: { colors: ["#CD2E3A", "#003478", "#FFFFFF"], pattern: "solid"     },     // taegeuk red
  ESP: { colors: ["#AA151B", "#F1BF00", "#AA151B"], pattern: "solid"     },     // la roja
  SUI: { colors: ["#FF0000", "#FFFFFF", "#FFFFFF"], pattern: "solid"     },     // red home w/ white cross
  TUN: { colors: ["#E70013", "#FFFFFF", "#FFFFFF"], pattern: "solid"     },
  TUR: { colors: ["#E30A17", "#FFFFFF", "#FFFFFF"], pattern: "solid"     },
  UKR: { colors: ["#FFD700", "#0057B7", "#FFD700"], pattern: "solid"     },     // zhovto-blakytni yellow
  USA: { colors: ["#FFFFFF", "#002868", "#BF0A30"], pattern: "solid"     },     // white home
  URU: { colors: ["#7CB7E0", "#FFFFFF", "#000000"], pattern: "solid"     },     // celeste sky blue
  UZB: { colors: ["#FFFFFF", "#1EB53A", "#0099B5"], pattern: "solid"     },
  VEN: { colors: ["#7A0019", "#FFCC00", "#00247D"], pattern: "solid"     },     // vinotinto wine red
  WAL: { colors: ["#C8102E", "#FFFFFF", "#1A5A1F"], pattern: "solid"     },     // red dragons
};

const Jersey = ({ country, role = "CPT", number, initials, w = 80, h = 90, className = "", style = {} }) => {
  if (!country) return null;

  // Prefer real kit colors; fall back to flag palette.
  const kit = KIT_COLORS[country.id];
  const [a, b, c] = kit ? kit.colors : country.colors;
  const kitPattern = kit ? kit.pattern : null;
  const flagStripe = country.stripe;

  // Choose visual pattern: kit-specific overrides flag-stripe defaults.
  let body = a, sleeve = a, stripe1 = null, stripe2 = null, pattern = "solid";
  if (kitPattern === "vstripes") {
    body = a; sleeve = a; stripe1 = b; pattern = "vstripes";
  } else if (kitPattern === "checker") {
    body = a; sleeve = a; stripe1 = b; pattern = "checker";
  } else if (kit) {
    // Solid kit color (white body for England, red for Spain, etc.)
    body = a; sleeve = a; stripe1 = b; pattern = "solid-trim";
  } else {
    // Fall back to flag-derived stripe patterns (legacy behaviour).
    switch (flagStripe) {
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
  }

  // Role markers — captain has armband, best has gold trim, rookie is plain.
  const armband = role === "CPT";
  const goldTrim = role === "BST";

  // Automatic contrast for the number.
  const numberColor = isLight(body) ? "#0A0807" : "#FFFFFF";
  const numberStroke = isLight(body) ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";

  const clipId = `jclip-${country.id}-${role}`;

  return (
    <svg width={w} height={h} viewBox="0 0 100 110" className={className}
         style={{display:"block", ...style}} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
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

      <g clipPath={`url(#${clipId})`}>
        {/* base body */}
        <rect x="0" y="0" width="100" height="110" fill={body}/>

        {/* kit patterns */}
        {pattern === "vstripes" && (<>
          {[10, 30, 50, 70, 90].map((x, i) => (
            <rect key={i} x={x - 5} y="0" width="10" height="110" fill={i % 2 === 0 ? stripe1 : body}/>
          ))}
        </>)}
        {pattern === "checker" && (<>
          {/* 5×6 checkerboard */}
          {Array.from({length: 5}).map((_, col) =>
            Array.from({length: 6}).map((_, row) => {
              if ((col + row) % 2 === 0) return null;
              return <rect key={`${col}-${row}`} x={col * 20} y={row * 18.34} width="20" height="18.34" fill={stripe1}/>;
            })
          )}
        </>)}
        {pattern === "solid-trim" && stripe1 && stripe1 !== body && (<>
          {/* thin contrast trim across shoulders + waist */}
          <rect x="0" y="22" width="100" height="3" fill={stripe1} opacity="0.85"/>
          <rect x="0" y="100" width="100" height="5" fill={stripe1} opacity="0.85"/>
        </>)}

        {/* legacy flag-stripe patterns */}
        {pattern === "hband" && (<rect x="0" y="44" width="100" height="22" fill={stripe1}/>)}
        {pattern === "hbandbig" && (<rect x="0" y="55" width="100" height="55" fill={stripe1}/>)}
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
        {pattern === "half" && (<rect x="50" y="0" width="50" height="110" fill={sleeve}/>)}
        {pattern === "panels" && (<>
          <rect x="0"  y="0" width="33" height="110" fill={sleeve}/>
          <rect x="33" y="0" width="34" height="110" fill={body}/>
          <rect x="67" y="0" width="33" height="110" fill={stripe1}/>
        </>)}
        {pattern === "sash" && (<polygon points="0,30 30,0 100,80 100,110 60,110" fill={stripe1}/>)}
        {pattern === "cross" && (<>
          <rect x="38" y="0" width="14" height="110" fill={stripe1}/>
          <rect x="0" y="44" width="100" height="14" fill={stripe1}/>
        </>)}
        {pattern === "emblem" && (<circle cx="50" cy="55" r="18" fill={stripe1}/>)}
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

      {/* Number on the chest — single big, centered, legible glyph.
          (We no longer also overlay initials here; the parent card shows
          the full player name below the jersey.) */}
      {number !== undefined && number !== null && (
        <text x="50" y="78" textAnchor="middle"
              fontFamily="var(--f-display)" fontSize="44" fontWeight="800"
              fill={numberColor}
              stroke={numberStroke} strokeWidth="0.8" paintOrder="stroke"
              style={{letterSpacing:"-0.04em"}}>
          {number}
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

// Helper — is hex color "light"? Used to auto-contrast the number.
function isLight(hex) {
  if (!hex || !hex.startsWith("#")) return false;
  const h = hex.slice(1);
  const x = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const r = parseInt(x.slice(0, 2), 16);
  const g = parseInt(x.slice(2, 4), 16);
  const b = parseInt(x.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 165;
}

window.Jersey = Jersey;
window.KIT_COLORS = KIT_COLORS;
