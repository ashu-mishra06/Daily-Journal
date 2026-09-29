import { useState } from "react";
import { loggedDatesSet, predictedDatesSet, fromKey, toKey } from "../lib/cycleEngine";

// A month grid. Tapping a day calls onOpenDay(dateKey). Non-colour cues
// (icons/shapes), not colour alone, mark logged vs. predicted vs. noted days.
export default function CalendarGrid({ stats, today, dayNotes, entries, onOpenDay }) {
  const [view, setView] = useState(() => {
    const d = fromKey(today);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const logged = loggedDatesSet(stats);
  const predicted = predictedDatesSet(stats, logged);

  const y = view.getFullYear();
  const m = view.getMonth();
  const title = view.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let n = 1; n <= days; n++) cells.push(n);

  const goMonth = (delta) => setView(new Date(y, m + delta, 1));

  return (
    <div>
      <div className="cal-head">
        <h3>{title}</h3>
        <button className="icon-btn" onClick={() => goMonth(-1)} aria-label="Previous month">‹</button>
        <button className="icon-btn" onClick={() => goMonth(1)} aria-label="Next month">›</button>
      </div>
      <div className="dow" aria-hidden="true">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="grid" role="group" aria-label={`Days of ${title}`}>
        {cells.map((n, i) => {
          if (n === null) return <span key={"e" + i} />;
          const k = toKey(new Date(y, m, n));
          const isLogged = logged.has(k);
          const isPredicted = !isLogged && predicted.has(k);
          const hasNote = !!dayNotes[k];
          const hasEntry = !!entries[k]?.done;
          const label = [
            new Date(y, m, n).toLocaleDateString("en-IN", { day: "numeric", month: "long" }),
            k === today ? "today" : null,
            isLogged ? "period logged" : isPredicted ? "period expected" : null,
            hasNote ? "has a note" : null,
            hasEntry ? "journal entry written" : null,
          ].filter(Boolean).join(", ");
          return (
            <button
              key={k}
              type="button"
              className={["day", k === today ? "today" : "", isLogged ? "logged" : "", isPredicted ? "predicted" : ""].join(" ").trim()}
              aria-label={label}
              onClick={() => onOpenDay(k)}
            >
              <span className="num">{n}</span>
              {hasEntry && <span className="dot" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <div className="legend">
        <span><i className="drop" />Period</span>
        <span><i className="pred" />Expected</span>
        <span>●&nbsp;Journal entry</span>
      </div>
      <p className="sub" style={{ marginTop: 12 }}>Tap a day to add a note or edit your period.</p>
    </div>
  );
}
