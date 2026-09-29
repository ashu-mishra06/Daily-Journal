import { useState } from "react";
import { useStore } from "../lib/store";
import Button from "../components/Button";
import Field from "../components/Field";

// Linking two accounts by username, and unlinking. See §2.
export default function LinkPage({ goTo }) {
  const { state, actions } = useStore();
  const { link, auth } = state;
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState("");

  if (!auth.user) {
    return (
      <div className="card">
        <p className="sub">Sign in first to link with your partner.</p>
        <Button variant="primary" onClick={() => goTo("auth")}>Go to sign in</Button>
      </div>
    );
  }

  if (link.partner) {
    return (
      <div className="card">
        <h3 style={{ marginTop: 0 }}>You and @{link.partner} are linked</h3>
        <p className="sub">Passkeys and thought prompts are now available.</p>
        {link.confirmUnlink ? (
          <>
            <p className="msg bad">Unlink from @{link.partner}? Passkeys you shared stop working. Your journals stay yours.</p>
            <div className="row" style={{ marginBottom: 0 }}>
              <Button variant="danger" onClick={actions.unlink}>Unlink</Button>
              <Button onClick={actions.stayLinked}>Stay linked</Button>
            </div>
          </>
        ) : (
          <div className="row" style={{ marginBottom: 0 }}>
            <Button variant="primary" onClick={() => goTo("sharing")}>Set up passkeys</Button>
            <Button variant="quiet" onClick={actions.askUnlink}>Unlink</Button>
          </div>
        )}
      </div>
    );
  }

  if (link.incomingRequest) {
    return (
      <div className="card">
        <h3 style={{ marginTop: 0 }}>@{link.incomingRequest} wants to link with you</h3>
        <p className="sub">Linking lets you share passkeys later. It doesn't share anything by itself.</p>
        <div className="row" style={{ marginBottom: 0 }}>
          <Button variant="primary" onClick={actions.acceptIncoming}>Accept</Button>
          <Button variant="quiet" onClick={actions.declineIncoming}>Not now</Button>
        </div>
      </div>
    );
  }

  if (link.outgoingRequest) {
    return (
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Request sent to @{link.outgoingRequest}</h3>
        <p className="sub">They need to accept it in their app. Nothing is shared until they do.</p>
        <div className="row" style={{ marginBottom: 0 }}>
          <Button onClick={actions.confirmDemoLink}>Demo: @{link.outgoingRequest} accepts</Button>
          <Button variant="quiet" onClick={actions.cancelLinkRequest}>Cancel request</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Link with your partner</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const err = actions.sendLinkRequest(username);
          setMsg(err || "");
        }}
      >
        <Field label="Your partner's username" placeholder="sam" value={username} onChange={(e) => setUsername(e.target.value)} />
        {msg && <p className="msg bad" role="alert">{msg}</p>}
        <div className="row" style={{ marginBottom: 0 }}>
          <Button type="submit" variant="primary">Send link request</Button>
          <Button variant="quiet" onClick={actions.showIncomingDemo}>Show a request sent to me</Button>
        </div>
      </form>
    </div>
  );
}
