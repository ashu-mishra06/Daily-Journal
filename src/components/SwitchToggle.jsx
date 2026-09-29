export default function SwitchToggle({ checked, onChange, disabled, children }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className="switch"
      onClick={() => onChange(!checked)}
    >
      <span className="trk" />
      <span>{children}</span>
    </button>
  );
}
