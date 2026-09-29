import { useState } from "react";
import { useStore } from "../lib/store";
import Tabs from "../components/Tabs";
import Field from "../components/Field";
import Button from "../components/Button";

const CATS = [
  { key: "hobby", label: "Hobbies", add: "Add a hobby" },
  { key: "favourite", label: "Favourites", add: "Add a favourite" },
  { key: "trigger", label: "Triggers", add: "Add a trigger" },
  { key: "other", label: "Other", add: "Add a note" },
];

// Private notes about your partner. Always private — see FEATURES_AND_FLOWS.md §7.
export default function NotesPage() {
  const { state, actions } = useStore();
  const [active, setActive] = useState(CATS[0].label);
  const [text, setText] = useState("");
  const cat = CATS.find((c) => c.label === active);
  const items = state.partnerNotes[cat.key];

  return (
    <div className="card" style={{ maxWidth: 640 }}>
      <p className="lockline"><span aria-hidden="true">🔒</span>Only you can see these notes.</p>
      <Tabs tabs={CATS.map((c) => c.label)} active={active} onChange={setActive} />
      <div className="row">
        {items.length ? (
          items.map((t, i) => (
            <span key={t + i} className={"tag" + (cat.key === "trigger" ? " trig" : "")}>
              {t}
              <button type="button" aria-label={`Remove ${t}`} onClick={() => actions.removePartnerNote(cat.key, i)}>×</button>
            </span>
          ))
        ) : (
          <span className="hand sub">Nothing here yet. Add the first one below.</span>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          actions.addPartnerNote(cat.key, text);
          setText("");
        }}
        style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <Field label={cat.add} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <Button type="submit">Add note</Button>
      </form>
    </div>
  );
}
