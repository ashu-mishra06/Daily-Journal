export default function Tabs({ tabs, active, onChange }) {
  const onKeyDown = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = tabs.indexOf(active);
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    onChange(next);
  };
  return (
    <div className="tabs" role="tablist" onKeyDown={onKeyDown}>
      {tabs.map((t) => (
        <button
          key={t}
          role="tab"
          type="button"
          className="tab"
          aria-selected={active === t}
          tabIndex={active === t ? 0 : -1}
          onClick={() => onChange(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
