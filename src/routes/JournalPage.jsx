import { useStore } from "../lib/store";
import QuestionCard from "../components/QuestionCard";

// The guided daily entry, plus a live timeline of what's been answered.
// See FEATURES_AND_FLOWS.md §6.
export default function JournalPage() {
  const { state, today, questions, actions } = useStore();
  const entry = state.entries[today];
  const answered = entry?.answers?.filter((a) => a.answer.trim()) || [];

  return (
    <div className="two-col">
      <div className="card">
        <QuestionCard
          questions={questions}
          entry={entry}
          onSave={(answers) => actions.saveEntry(answers)}
          onEdit={actions.editEntry}
          onReset={actions.resetEntry}
        />
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Your day so far</h3>
        {answered.length ? (
          <ul className="tl">
            {answered.map((a) => (
              <li key={a.tag} className="has"><b>{a.tag}</b><br />{a.answer}</li>
            ))}
          </ul>
        ) : (
          <p className="hand sub">Nothing written yet today.</p>
        )}
      </div>
    </div>
  );
}
