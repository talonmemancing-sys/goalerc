// GOAL — Contract Address banner: prominent, copyable, links to Etherscan
const CABanner = () => {
  const CA = "0x01D758b1C6d4EA88230A70c61a200C3A75A9F9F2";
  const short = `${CA.slice(0, 8)}…${CA.slice(-6)}`;
  const [copied, setCopied] = React.useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(CA);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="ca-banner">
      <div className="ca-banner-inner">
        <span className="ca-banner-label eyebrow">$GOAL Contract</span>
        <span className="ca-banner-divider"/>
        <span className="ca-banner-addr f-mono" title={CA}>
          <span className="ca-banner-addr-full">{CA}</span>
          <span className="ca-banner-addr-short">{short}</span>
        </span>
        <button className="ca-banner-btn" onClick={handleCopy} aria-label="Copy contract address">
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6.5 L5 9.5 L10 3.5" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>
              <span>Copied</span>
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M4 2 V0.5 H10 V7 H8.5" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
              <span>Copy</span>
            </>
          )}
        </button>
        <a className="ca-banner-btn" href={`https://etherscan.io/token/${CA}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M5 8 L8 5 M5 5 H8 V8" stroke="currentColor" strokeWidth="1.2" fill="none"/><rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
          <span>Etherscan</span>
        </a>
      </div>
    </div>
  );
};

window.CABanner = CABanner;
