import { useState } from "react";
import { useStore } from "../lib/store";
import { cycleSummary, fmtShort, daysBetween } from "../lib/cycleEngine";
import CalendarGrid from "../components/CalendarGrid";
import DaySheet from "../components/DaySheet";
import SwitchToggle from "../components/SwitchToggle";
import Button from "../components/Button";

// The full cycle view: calendar, summary, sharing switch, and an editable
// history table. See FEATURES_AND_FLOWS.md §5.
export default function CalendarPage({ goTo }) {
  const { state, today, stats, actions } = useStore();
  const [openDate, setOpenDate] = useState(null);
  const s = cycleSummary(stats);
  const sorted = [...stats.periods].reverse().slice(0, 8);

  return (
    <div className="two-col">
      <div className="card">
        <CalendarGrid stats={stats} today={today} dayNotes={state.dayNotes} entries={state.entries} onOpenDay={setOpenDate} />
      </div>
      <div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>{s.head}</h3>
          <p>{s.body}</p>
          {stats.last && !stats.isOngoing && <p className="sub">Cycle day {stats.cycleDay}.</p>}
          {s.basis && <p className="sub">{s.basis}</p>}
          <div className="row">
            {stats.isOngoing ? (
              <Button variant="primary" onClick={actions.endOngoingToday}>Period ended today</Button>
            ) : (
              <Button variant="primary" onClick={actions.startPeriodToday}>Period started today</Button>
            )}
          </div>
          <SwitchToggle checked={state.cycleShare && !!state.link.partner} disabled={!state.link.partner} onChange={actions.toggleCycleShare}>
            Share summary with @{state.link.partner || "your partner"}
          </SwitchToggle>
          <p className="sub" style={{ marginTop: 8 }}>
            {state.link.partner ? (state.cycleShare ? "They can see the summary, never your day notes." : "Only you can see your cycle.") : "Available after you link with your partner."}
          </p>
          <p className="sub" style={{ marginBottom: 0 }}>Estimates from your own dates. Not medical advice.</p>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Your cycles</h3>
          {sorted.length ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid var(--edge)", padding: "4px 6px" }}>Period</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid var(--edge)", padding: "4px 6px" }}>Length</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => (
                  <tr key={p.id}>
                    <td style={{ padding: "4px 6px", borderBottom: "1px solid var(--edge)" }}>{fmtShort(p.start)} to {p.end ? fmtShort(p.end) : "ongoing"}</td>
                    <td style={{ padding: "4px 6px", borderBottom: "1px solid var(--edge)" }}>{p.end ? `${daysBetween(p.start, p.end) + 1} days` : "–"}</td>
                    <td style={{ padding: "4px 6px", borderBottom: "1px solid var(--edge)" }}>
                      <Button variant="quiet" onClick={() => setOpenDate(p.start)}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="hand sub">Nothing logged yet.</p>
          )}
        </div>
      </div>
      <DaySheet dateKey={openDate} onClose={() => setOpenDate(null)} />
    </div>
  );
}
