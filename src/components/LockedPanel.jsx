import Button from "./Button";

// The consistent way to show a partner-dependent feature before linking:
// explain what's missing in one line, and link to the linking flow —
// never just hide the feature. See DESIGN_SYSTEM.md.
export default function LockedPanel({ title, onGoToLinking }) {
  return (
    <div className="locked">
      {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
      <p className="lockline">
        <span aria-hidden="true">🔒</span>
        This is available once you're linked with your partner.
      </p>
      <Button variant="quiet" onClick={onGoToLinking}>Go to linking</Button>
    </div>
  );
}
