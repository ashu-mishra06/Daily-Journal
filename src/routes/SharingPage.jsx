import { useStore } from "../lib/store";
import { ShareMyJournalCard, OpenSharedJournalCard } from "../components/PasskeyCard";

// Passkey creation and redemption, plus what a read-only view looks like.
export default function SharingPage({ goTo }) {
  const { state } = useStore();
  return (
    <div>
      <div className="two-col">
        <div className="card"><ShareMyJournalCard onGoToLinking={() => goTo("link")} /></div>
        <div className="card"><OpenSharedJournalCard onGoToLinking={() => goTo("link")} /></div>
      </div>
      <h3>When you're reading your partner's journal</h3>
      <p className="sub">Read-only is always visible: a banner, their pen colour, and no edit controls.</p>
      <div className="card" style={{ borderColor: "var(--ink-b)", borderWidth: 2 }}>
        <p style={{ margin: 0 }}>👁 <b>Reading your partner's journal.</b> You can read entries but not change them.</p>
      </div>
      <div className="card" style={{ borderLeft: "4px solid var(--ink-b)" }}>
        <p style={{ fontSize: 14, color: "var(--ink-b)", fontWeight: 600, margin: "0 0 8px" }}>
          @{state.link.partner || "your partner"} · yesterday evening
        </p>
        <p style={{ color: "var(--ink-b)", margin: 0 }}>Long day of meetings, but the walk home fixed it. Bought the good bread.</p>
      </div>
    </div>
  );
}
