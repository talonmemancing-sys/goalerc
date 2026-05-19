// MATCH — Animated number that counts toward its target value.
// Always renders the current value (no flash from 0).
const AnimatedNumber = ({ value, decimals = 0, duration = 1100, prefix = "", suffix = "", className = "" }) => {
  const target = Number(value) || 0;
  const [v, setV] = React.useState(target);
  const prevTarget = React.useRef(target);
  const rafRef = React.useRef();

  React.useEffect(() => {
    if (target === prevTarget.current && v === target) return;
    cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    const from = v;
    const goal = target;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const nv = from + (goal - from) * eased;
      setV(nv);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else setV(goal);
    };
    rafRef.current = requestAnimationFrame(tick);
    prevTarget.current = target;
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line
  }, [target]);

  const formatted = v.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return <span className={"numeric " + className}>{prefix}{formatted}{suffix}</span>;
};
window.AnimatedNumber = AnimatedNumber;
