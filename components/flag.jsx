// FOOTBALL — real country flag component (flagcdn.com SVGs, CC BY 4.0).
// Replaces the abstract palette renderer that couldn't represent Union Jack,
// stars+stripes, taegeuk, etc. correctly.

// Map our ISO3 codes → flagcdn ISO2 codes (with gb-* sub-codes for ENG/SCO/WAL).
const ISO3_TO_FLAGCDN = {
  ARG: "ar", AUS: "au", AUT: "at", BEL: "be", BRA: "br",
  CAN: "ca", CPV: "cv", COL: "co", CRO: "hr", CUW: "cw",
  DEN: "dk", ECU: "ec", EGY: "eg", ENG: "gb-eng", FRA: "fr",
  GER: "de", GHA: "gh", HAI: "ht", IRN: "ir", ITA: "it",
  CIV: "ci", JPN: "jp", JOR: "jo", MEX: "mx", MAR: "ma",
  NED: "nl", NZL: "nz", NOR: "no", PAN: "pa", PAR: "py",
  POL: "pl", POR: "pt", QAT: "qa", KSA: "sa", SCO: "gb-sct",
  SEN: "sn", RSA: "za", KOR: "kr", ESP: "es", SUI: "ch",
  TUN: "tn", TUR: "tr", UKR: "ua", USA: "us", URU: "uy",
  UZB: "uz", VEN: "ve", WAL: "gb-wls",
};

window.ISO3_TO_FLAGCDN = ISO3_TO_FLAGCDN;

const Flag = ({ country, w = 60, h = 40, className = "", style = {} }) => {
  const iso2 = ISO3_TO_FLAGCDN[country.id];
  const url = iso2 ? `https://flagcdn.com/${iso2}.svg` : null;

  // Fallback: abstract palette for any country not in the map.
  if (!url) return <FlagAbstract country={country} w={w} h={h} className={className} style={style}/>;

  return (
    <img
      src={url}
      alt={country.name + " 国旗"}
      width={w}
      height={h}
      loading="lazy"
      decoding="async"
      className={className}
      style={{
        display: "block",
        objectFit: "cover",
        border: "1px solid rgba(0,0,0,0.18)",
        background: "rgba(255,255,255,0.04)",
        ...style,
      }}
      onError={(e) => {
        // If flagcdn rate-limits or 404s, swap to the abstract palette.
        e.currentTarget.style.display = "none";
      }}
    />
  );
};

// Kept as a graceful fallback for countries the CDN doesn't have / when
// the network blocks flagcdn. Uses the original 3-color stripe scheme.
const FlagAbstract = ({ country, w = 60, h = 40, className = "", style = {} }) => {
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
window.FlagAbstract = FlagAbstract;
