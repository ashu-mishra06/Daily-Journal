import { useEffect, useState } from "react";
import { useStore } from "../lib/store";
import { fmtShort } from "../lib/cycleEngine";
import Button from "./Button";
import Field from "./Field";
import LockedPanel from "./LockedPanel";

// The full "thinking of your partner" panel — prompt, answer, share/skip,
// and a feed of what's been shared in both directions. See §8.
export default function ThoughtCard({ onGoToLinking }) {
  const { state, actions } = useStore();
  const { partner } = state.link;
  const [prompt, setPrompt] = useState(null);
  const [answer, setAnswer] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (partner && !prompt) setPrompt(actions.rollPrompt());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partner, prompt]);

  if (!partner) return <LockedPanel title="Thinking of your partner" onGoToLinking={onGoToLinking} />;

  const freq = state.comfort.thoughtFrequency;
  const recent = [...state.thoughts].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);

  const handleShare = () => {
    const err = actions.shareThought(answer, prompt);
    if (err) return setMsg(err);
    setAnswer("");
    setMsg("");
    setPrompt(actions.rollPrompt());
  };
  const handleSkip = () => {
    setAnswer("");
    setMsg("");
    setPrompt(actions.rollPrompt());
  };

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>A question about @{partner}</h3>
      {freq === "off" ? (
        <p className="sub">Prompts are turned off. Turn them on in Comfort settings for an occasional question.</p>
      ) : (
        <>
          <p className="q">{prompt}</p>
          <Field
            as="textarea"
            label="A few words are plenty. Nothing here is required."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          {msg && <p className="msg bad" role="alert">{msg}</p>}
          <div className="row">
            <Button variant="primary" onClick={handleShare}>Share with @{partner}</Button>
            <Button variant="quiet" onClick={handleSkip}>Ask something else</Button>
          </div>
        </>
      )}
      <h3>Recent</h3>
      {recent.length ? (
        <ul className="tl">
          {recent.map((t) => (
            <li key={t.id} className="has">
              <b>{t.direction === "sent" ? `You, about @${partner}` : `From @${partner}`} · {fmtShort(t.date)}</b>
              <br />{t.question}
              <br />{t.answer}
            </li>
          ))}
        </ul>
      ) : (
        <p className="hand sub">Nothing shared yet.</p>
      )}
    </div>
  );
}
