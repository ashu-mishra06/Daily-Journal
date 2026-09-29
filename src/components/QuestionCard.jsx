import { useState } from "react";
import Button from "./Button";
import Field from "./Field";

// One guided journal question at a time. Up to five, all skippable, at
// least one answer required to save. See FEATURES_AND_FLOWS.md §6.
export default function QuestionCard({ questions, entry, onSave, onEdit, onReset }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState(
    entry?.answers?.map((a) => a.answer) || questions.map(() => "")
  );

  if (entry?.done) {
    return (
      <div>
        <h3 style={{ marginTop: 0 }}>Entry saved</h3>
        <p>Today's entry is in your journal. Take a breath, that's enough for today.</p>
        <div className="row" style={{ marginBottom: 0 }}>
          <Button onClick={onEdit}>Edit entry</Button>
          <Button variant="quiet" onClick={onReset}>Start a blank entry</Button>
        </div>
      </div>
    );
  }

  const q = questions[i];
  const last = i === questions.length - 1;
  const any = answers.some((a) => a.trim());

  const setAnswer = (v) => setAnswers((prev) => prev.map((a, k) => (k === i ? v : a)));
  const handleSave = () => {
    const payload = questions.map((qq, k) => ({ tag: qq.tag, question: qq.question, answer: answers[k] }));
    onSave(payload);
  };

  return (
    <div>
      <div className="row" style={{ gap: 4, marginBottom: 8 }} aria-hidden="true">
        {questions.map((_, k) => (
          <span key={k} style={{ flex: 1, height: 3, background: k <= i ? "var(--ink-a)" : "var(--rule-strong)" }} />
        ))}
      </div>
      <p className="sub" style={{ margin: 0 }}>Question {i + 1} of {questions.length}</p>
      <p className="q">{q.question}</p>
      <Field
        as="textarea"
        label={q.hint}
        value={answers[i]}
        onChange={(e) => setAnswer(e.target.value)}
        style={{ minHeight: 100 }}
      />
      <div className="row" style={{ marginBottom: 0 }}>
        <Button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>Back</Button>
        {last ? (
          <Button variant="primary" onClick={handleSave} disabled={!any}>Save entry</Button>
        ) : (
          <Button variant="primary" onClick={() => setI(i + 1)}>Next question</Button>
        )}
        {!last && <Button variant="quiet" onClick={() => setI(i + 1)}>Skip</Button>}
      </div>
      {last && !any && <p className="msg">Answer at least one question to save.</p>}
    </div>
  );
}
