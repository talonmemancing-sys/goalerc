// FOOTBALL — 合约地址横幅：从 config 读 CA，可复制，链接 BscScan
const CABanner = () => {
  const CA = (window.FOOTBALL_CONFIG && window.FOOTBALL_CONFIG.football) || "";
  const [copied, setCopied] = React.useState(false);

  // CA 还没创建 —— 不显示横幅（代币发射后填 config.football 即自动出现）
  if (!CA) return null;

  const short = `${CA.slice(0, 8)}…${CA.slice(-6)}`;
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(CA);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="ca-banner">
      <div className="ca-banner-inner">
        <span className="ca-banner-label eyebrow">$FOOTBALL 合约</span>
        <span className="ca-banner-divider" />
        <span className="ca-banner-addr f-mono" title={CA}>
          <span className="ca-banner-addr-full">{CA}</span>
          <span className="ca-banner-addr-short">{short}</span>
        </span>
        <button className="ca-banner-btn" onClick={handleCopy} aria-label="复制合约地址">
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path d="M2 6.5 L5 9.5 L10 3.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
              </svg>
              <span>已复制</span>
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <rect x="2" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <path d="M4 2 V0.5 H10 V7 H8.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
              </svg>
              <span>复制</span>
            </>
          )}
        </button>
        <a
          className="ca-banner-btn"
          href={`https://bscscan.com/token/${CA}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M5 8 L8 5 M5 5 H8 V8" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" strokeWidth="1.2" fill="none" />
          </svg>
          <span>BscScan</span>
        </a>
      </div>
    </div>
  );
};

window.CABanner = CABanner;
