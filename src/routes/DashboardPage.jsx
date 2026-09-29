import { useState } from "react";
import { useStore } from "../lib/store";
import { cycleSummary } from "../lib/cycleEngine";
import CalendarGrid from "../components/CalendarGrid";
import DaySheet from "../components/DaySheet";
import Button from "../components/Button";

const TITLES = {
  today: "Today",
  calendar: "Calendar",
  cycle: "Your cycle",
  thought: "Thinking of your partner",
  notes: "Recent notes",
};

function TodayWidget({ goTo }) {
  const { state, today } = useStore();
  const done = !!state.entries[today]?.done;
  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  })();
  return (
    <div>
      <p className="sub">{greeting}. Your page is ready when you are.</p>
      <p className="hand" style={{ fontSize: 40 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
      <p className="sub">{done ? "Today's entry is written." : "Today's entry hasn't been written yet."}</p>
      <Button variant="primary" onClick={() => goTo("journal")}>Write today's entry</Button>
    </div>
  );
}

function CycleWidget({ goTo }) {
  const { stats } = useStore();
  const s = cycleSummary(stats);
  return (
    <div>
      <p className="hand" style={{ fontSize: 30 }}>{s.head}</p>
      <p>{s.body}</p>
      {s.basis && <p className="sub">{s.basis}</p>}
      <Button variant="primary" onClick={() => goTo("calendar")}>Open calendar</Button>
    </div>
  );
}

function NotesWidget() {
  const { state } = useStore();
  const dates = Object.keys(state.dayNotes).sort().reverse().slice(0, 3);
  if (!dates.length) return <p className="hand sub">No notes yet. Open the calendar to write one.</p>;
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {dates.map((d) => (
        <li key={d} style={{ borderBottom: "1px solid var(--edge)", padding: "8px 0" }}>
          <b style={{ display: "block", fontSize: 14, color: "var(--ink-soft)" }}>{d}</b>
          {state.dayNotes[d]}
        </li>
      ))}
    </ul>
  );
}

function ThoughtWidget({ goTo }) {
  const { state } = useStore();
  if (!state.link.partner) {
    return (
      <div>
        <p className="lockline"><span aria-hidden="true">🔒</span>Available once you're linked with your partner.</p>
        <Button variant="quiet" onClick={() => goTo("link")}>Go to linking</Button>
      </div>
    );
  }
  if (state.comfort.thoughtFrequency === "off") {
    return (
      <div>
        <p className="sub">Thought prompts are turned off.</p>
        <Button variant="quiet" onClick={() => goTo("settings")}>Turn on in Comfort</Button>
      </div>
    );
  }
  return (
    <div>
      <p className="sub">A small question about @{state.link.partner} is waiting.</p>
      <Button variant="primary" onClick={() => goTo("thoughts")}>Open</Button>
    </div>
  );
}

export default function DashboardPage({ goTo }) {
  const { state, today, stats, actions } = useStore();
  const [openDate, setOpenDate] = useState(null);
  const visible = state.layout.order.filter((id) => !state.layout.hidden.includes(id));

  const widgetBody = (id) => {
    if (id === "today") return <TodayWidget goTo={goTo} />;
    if (id === "calendar") return <CalendarGrid stats={stats} today={today} dayNotes={state.dayNotes} entries={state.entries} onOpenDay={setOpenDate} />;
    if (id === "cycle") return <CycleWidget goTo={goTo} />;
    if (id === "thought") return <ThoughtWidget goTo={goTo} />;
    if (id === "notes") return <NotesWidget />;
    return null;
  };

  return (
    <div>
      <div className="row">
        <Button aria-pressed={state.arranging} onClick={() => actions.setArranging(!state.arranging)}>
          {state.arranging ? "Done arranging" : "Arrange cards"}
        </Button>
        {state.arranging && <Button variant="quiet" onClick={actions.resetLayout}>Reset layout</Button>}
      </div>

      {state.arranging && state.layout.hidden.length > 0 && (
        <div className="row">
          <span className="sub">Hidden:</span>
          {state.layout.hidden.map((id) => (
            <Button key={id} onClick={() => actions.showWidget(id)}>Show {TITLES[id]}</Button>
          ))}
        </div>
      )}

      <div className="two-col">
        {visible.map((id, i) => (
          <section key={id} className="card" aria-label={TITLES[id]}>
            {state.arranging && (
              <div className="widget-bar">
                <Button onClick={() => actions.moveWidget(id, -1)} disabled={i === 0}>Earlier</Button>
                <Button onClick={() => actions.moveWidget(id, 1)} disabled={i === visible.length - 1}>Later</Button>
                <Button variant="quiet" onClick={() => actions.hideWidget(id)}>Hide</Button>
              </div>
            )}
            <h3 style={{ marginTop: 0 }}>{TITLES[id]}</h3>
            {widgetBody(id)}
          </section>
        ))}
      </div>

      <DaySheet dateKey={openDate} onClose={() => setOpenDate(null)} />
    </div>
  );
}
