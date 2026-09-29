import { useState } from "react";
import { useStore } from "../lib/store";
import Button from "./Button";
import Field from "./Field";
import LockedPanel from "./LockedPanel";

// Create/copy/revoke your own passkey, and redeem your partner's, per
// FEATURES_AND_FLOWS.md §3. Gated behind an active link.
export function ShareMyJournalCard({ onGoToLinking }) {
  const { state, actions } = useStore();
  const { partner } = state.link;
  const { mine, viewers, confirm, revoked } = state.passkeys;

  if (!partner) return <LockedPanel title="Share my journal" onGoToLinking={onGoToLinking} />;

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Share my journal</h3>
      {!mine ? (
        <>
          <p className="sub">
            {revoked.length ? "Your last passkey was revoked. Nobody can use it any more." : `@${partner} can't read your journal yet.`}
          </p>
          <Button variant="primary" onClick={actions.createPasskey}>Create passkey</Button>
        </>
      ) : (
        <>
          <p className="sub">Send this to @{partner}. It gives read-only access until you revoke it.</p>
          <p className="hand" style={{ fontSize: 24, padding: "10px 14px", border: "2px dashed var(--rule-strong)", display: "inline-block", borderRadius: 4 }}>{mine}</p>
          <div className="row">
            <Button onClick={() => { navigator.clipboard?.writeText(mine).then(() => actions.toast("Passkey copied")).catch(() => actions.toast("Copy blocked here. Select the passkey and copy it by hand.")); }}>
              Copy passkey
            </Button>
          </div>
          {viewers.length
            ? viewers.map((v) => <p key={v} className="sub">👁 {v} · read only</p>)
            : <p className="sub">Not used yet.</p>}
          {confirm ? (
            <>
              <p className="msg bad">Revoke this passkey? @{partner} loses access right away. You can create a new one later.</p>
              <div className="row" style={{ marginBottom: 0 }}>
                <Button variant="danger" onClick={actions.revokePasskey}>Revoke passkey</Button>
                <Button onClick={actions.keepPasskey}>Keep passkey</Button>
              </div>
            </>
          ) : (
            <Button variant="danger" onClick={actions.askRevoke}>Revoke passkey</Button>
          )}
        </>
      )}
    </div>
  );
}

export function OpenSharedJournalCard({ onGoToLinking }) {
  const { state, actions } = useStore();
  const { partner } = state.link;
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState(null);

  if (!partner) return <LockedPanel title="Open a shared journal" onGoToLinking={onGoToLinking} />;

  const submit = (e) => {
    e.preventDefault();
    const res = actions.redeemPasskey(code);
    setMsg(res);
    if (res.ok) actions.markPasskeyUsed();
  };

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Open a shared journal</h3>
      <form onSubmit={submit} noValidate>
        <Field
          label={`Passkey from @${partner}`}
          placeholder="MAPLE-1234-RIVER"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        {msg && <p className={"msg " + (msg.ok ? "good" : "bad")} role="status">{msg.msg}</p>}
        <div className="row" style={{ marginBottom: 0 }}>
          <Button type="submit" variant="primary">Open journal</Button>
        </div>
        {state.passkeys.partnerDemoCode && (
          <p className="sub" style={{ marginTop: 14 }}>
            Demo: @{partner}'s passkey is <code>{state.passkeys.partnerDemoCode}</code>
          </p>
        )}
      </form>
    </div>
  );
}
