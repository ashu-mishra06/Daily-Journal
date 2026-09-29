import { useEffect, useRef, useState } from "react";
import { fmtLong, periodAt, daysBetween } from "../lib/cycleEngine";
import { validatePeriodDates } from "../lib/validators";
import { useStore } from "../lib/store";
import Field from "./Field";
import Button from "./Button";

// A native <dialog> — modal on desktop, and styled full-width at the bottom
// on phone via CSS. Traps focus and closes on Escape natively.
export default function DaySheet({ dateKey, onClose }) {
  const { state, today, stats, actions } = useStore();
  const dlgRef = useRef(null);
  const [note, setNote] = useState(state.dayNotes[dateKey] || "");
  const [msg, setMsg] = useState("");
  const period = dateKey ? periodAt(dateKey, stats) : null;
  const [start, setStart] = useState(period?.start || dateKey || "");
  const [end, setEnd] = useState(period?.end || "");

  useEffect(() => {
    const dlg = dlgRef.current;
    if (!dlg) return;
    if (dateKey && !dlg.open) dlg.showModal();
    if (!dateKey && dlg.open) dlg.close();
  }, [dateKey]);

  useEffect(() => {
    setNote(state.dayNotes[dateKey] || "");
    setStart(period?.start || dateKey || "");
    setEnd(period?.end || "");
    setMsg("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey]);

  if (!dateKey) return <dialog ref={dlgRef} className="sheet" onClose={onClose} />;

  const status = period
    ? `Period day ${daysBetween(period.start, dateKey) + 1}.`
    : "No period logged for this day.";

  const handleSaveNote = () => {
    const err = actions.saveDayNote(dateKey, note);
    if (err) setMsg(err);
    else onClose();
  };
  const handleStartPeriod = () => {
    if (dateKey > today) return setMsg("You can log a period once the day has arrived.");
    actions.addPeriod({ start: dateKey, end: null });
    onClose();
  };
  const handleEndHere = () => {
    if (!period) return;
    if (daysBetween(period.start, dateKey) + 1 > 14) return setMsg("Periods longer than 14 days can't be logged. Check the dates.");
    actions.savePeriod(period.id, { end: dateKey });
    onClose();
  };
  const handleSavePeriod = () => {
    const err = validatePeriodDates({ start, end: end || null, today, periods: state.periods, ignoreId: period?.id });
    if (err) return setMsg(err);
    actions.savePeriod(period.id, { start, end: end || null });
    onClose();
  };
  const handleDeletePeriod = () => {
    actions.deletePeriod(period.id);
    onClose();
  };

  return (
    <dialog ref={dlgRef} className="sheet" onClose={onClose} onCancel={onClose}>
      <div className="sheet-in">
        <div className="sheet-top">
          <h3 style={{ marginTop: 0 }}>{fmtLong(dateKey)}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        <p className="sub">{status}</p>

        <Field
          as="textarea"
          label="Note for this day"
          placeholder="Anything you want to remember."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="row">
          <Button variant="primary" onClick={handleSaveNote}>Save note</Button>
          {state.dayNotes[dateKey] && (
            <Button variant="quiet" onClick={() => { actions.deleteDayNote(dateKey); onClose(); }}>Delete note</Button>
          )}
        </div>

        <h3>Period</h3>
        {period ? (
          <>
            <p className="sub">Change the dates and your next-period estimate updates.</p>
            <div className="two-col">
              <Field as="input" type="date" label="First day" value={start} max={today} onChange={(e) => setStart(e.target.value)} />
              <Field as="input" type="date" label="Last day (empty if ongoing)" value={end} max={today} onChange={(e) => setEnd(e.target.value)} />
            </div>
            <div className="row">
              <Button variant="primary" onClick={handleSavePeriod}>Save period</Button>
              {!period.end && dateKey > period.start && dateKey <= today && (
                <Button onClick={handleEndHere}>Period ended on this day</Button>
              )}
              <Button variant="danger" onClick={handleDeletePeriod}>Remove this period</Button>
            </div>
          </>
        ) : dateKey > today ? (
          <p className="sub">You can log a period once the day has arrived. Notes are fine any time.</p>
        ) : (
          <div className="row">
            <Button onClick={handleStartPeriod}>Period started on this day</Button>
          </div>
        )}
        {msg && <p className="msg bad" role="alert">{msg}</p>}
      </div>
    </dialog>
  );
}
