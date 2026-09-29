import { useState } from "react";
import { useStore } from "../lib/store";
import Button from "../components/Button";
import Field from "../components/Field";

// Sign up / sign in, email verification, and username claim.
// See FEATURES_AND_FLOWS.md §1.
export default function AuthPage({ goTo }) {
  const { state, actions } = useStore();
  const { auth } = state;
  const [email, setEmail] = useState(auth.email);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState("");
  const [unMsg, setUnMsg] = useState("3 to 20 characters. Lowercase letters, numbers and underscores.");
  const [suggestions, setSuggestions] = useState([]);

  if (auth.user) {
    return (
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Signed in as @{auth.user.username}</h3>
        <p className="sub">You're all set. Head to Link to connect with your partner, or jump straight to the dashboard.</p>
        <div className="row" style={{ marginBottom: 0 }}>
          <Button variant="primary" onClick={() => goTo("link")}>Go to linking</Button>
          <Button variant="quiet" onClick={actions.signOut}>Sign out</Button>
        </div>
      </div>
    );
  }

  if (auth.step === 1) {
    return (
      <div className="card">
        <p className="sub">Step 2 of 4: Verify</p>
        <p>We sent a 6-digit code to <b>{auth.email}</b>.</p>
        <p className="sub">Demo: the code is 123456.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const err = actions.verifyEmail(code);
            setMsg(err || "");
          }}
        >
          <Field label="Verification code" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} />
          {msg && <p className="msg bad" role="alert">{msg}</p>}
          <div className="row" style={{ marginBottom: 0 }}>
            <Button type="submit" variant="primary">Verify email</Button>
            <Button variant="quiet" onClick={actions.resendCode}>Send a new code</Button>
          </div>
        </form>
      </div>
    );
  }

  if (auth.step === 2) {
    const onInput = (v) => {
      const clean = v.toLowerCase().replace(/[^a-z0-9_]/g, "");
      setUsername(clean);
      setSuggestions([]);
      if (!clean) return setUnMsg("3 to 20 characters. Lowercase letters, numbers and underscores.");
      if (!/^[a-z][a-z0-9_]{2,19}$/.test(clean)) return setUnMsg("Start with a letter, at least 3 characters.");
      setUnMsg("Looks good.");
    };
    return (
      <div className="card">
        <p className="sub">Step 3 of 4: Username</p>
        <p>Choose a username. Your partner uses it to find you, so it has to be unique.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const err = actions.claimUsername(username);
            if (err === "TAKEN") {
              setUnMsg(`@${username} is taken.`);
              setSuggestions(actions.usernameSuggestions(username));
            } else if (err) {
              setUnMsg(err);
            }
          }}
        >
          <Field label="Username" value={username} onChange={(e) => onInput(e.target.value)} />
          <p className="msg">{unMsg}</p>
          {suggestions.length > 0 && (
            <div className="row">
              {suggestions.map((s) => (
                <Button key={s} variant="quiet" onClick={() => onInput(s)}>@{s}</Button>
              ))}
            </div>
          )}
          <div className="row" style={{ marginBottom: 0 }}>
            <Button type="submit" variant="primary">Claim username</Button>
          </div>
        </form>
      </div>
    );
  }

  // step 0: sign in / sign up
  return (
    <div className="card">
      <div className="tabs" role="tablist">
        <button className="tab" role="tab" aria-selected={auth.mode === "signin"} onClick={() => actions.setAuthMode("signin")}>Sign in</button>
        <button className="tab" role="tab" aria-selected={auth.mode === "signup"} onClick={() => actions.setAuthMode("signup")}>Create account</button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const err = auth.mode === "signup" ? actions.signUp({ email, password }) : actions.signIn({ email, password });
          setMsg(err || "");
        }}
      >
        <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Password" type="password" autoComplete={auth.mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} hint={auth.mode === "signup" ? "At least 8 characters." : undefined} />
        {msg && <p className="msg bad" role="alert">{msg}</p>}
        <div className="row" style={{ marginBottom: 0 }}>
          <Button type="submit" variant="primary">{auth.mode === "signup" ? "Create account" : "Sign in"}</Button>
        </div>
      </form>
    </div>
  );
}
