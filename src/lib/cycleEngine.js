// Pure cycle-prediction functions. No UI, no side effects — safe to unit test.
// Matches docs/FEATURES_AND_FLOWS.md §5 exactly. All dates are "YYYY-MM-DD" strings.

export function pad(n) {
  return String(n).padStart(2, "0");
}
export function toKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
export function fromKey(k) {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
}
export function addDays(k, n) {
  const d = fromKey(k);
  d.setDate(d.getDate() + n);
  return toKey(d);
}
export function daysBetween(a, b) {
  return Math.round((fromKey(b) - fromKey(a)) / 86400000);
}
export function todayKey() {
  return toKey(new Date());
}
export function fmtShort(k) {
  return fromKey(k).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
export function fmtLong(k) {
  return fromKey(k).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function mean(a) {
  return a.reduce((s, x) => s + x, 0) / a.length;
}
function sdev(a) {
  const m = mean(a);
  return Math.sqrt(mean(a.map((x) => (x - m) ** 2)));
}

/**
 * Compute cycle statistics from a user's own Period rows.
 * @param {{id, start:string, end:string|null}[]} periodsIn
 * @param {string} today - "YYYY-MM-DD", defaults to real today
 */
export function computeCycleStats(periodsIn, today = todayKey()) {
  const periods = periodsIn.slice().sort((a, b) => (a.start < b.start ? -1 : 1));

  const cycleLengths = [];
  for (let i = 1; i < periods.length; i++) {
    const len = daysBetween(periods[i - 1].start, periods[i].start);
    if (len >= 18 && len <= 60) cycleLengths.push(len); // filters likely missed logs
  }
  const recent = cycleLengths.slice(-6);
  const avgCycleLength = recent.length >= 2 ? Math.round(mean(recent)) : 28;

  const periodLengths = periods
    .filter((p) => p.end)
    .map((p) => daysBetween(p.start, p.end) + 1)
    .slice(-6);
  const avgPeriodLength = periodLengths.length ? Math.round(mean(periodLengths)) : 5;

  const marginDays =
    recent.length >= 3
      ? Math.min(3, Math.max(1, Math.round(sdev(recent))))
      : recent.length === 2
      ? 2
      : 3;

  const last = periods.length ? periods[periods.length - 1] : null;
  const stats = { periods, recent, avgCycleLength, avgPeriodLength, marginDays, last, today };

  if (last) {
    stats.nextStart = addDays(last.start, avgCycleLength);
    stats.cycleDay = daysBetween(last.start, today) + 1;
    stats.daysUntilNext = daysBetween(today, stats.nextStart);
    stats.isOngoing = !last.end && today <= addDays(last.start, 13);
  }
  return stats;
}

// The last day covered by an (possibly still-open) period, for calendar rendering.
export function effectiveEnd(period, stats) {
  if (period.end) return period.end;
  const cap = addDays(period.start, 13);
  return stats.today <= cap ? stats.today : addDays(period.start, stats.avgPeriodLength - 1);
}

export function periodAt(key, stats) {
  return stats.periods.find((p) => key >= p.start && key <= effectiveEnd(p, stats));
}

export function loggedDatesSet(stats) {
  const s = new Set();
  stats.periods.forEach((p) => {
    const end = effectiveEnd(p, stats);
    let d = p.start,
      n = 0;
    while (d <= end && n < 20) {
      s.add(d);
      d = addDays(d, 1);
      n++;
    }
  });
  return s;
}

export function predictedDatesSet(stats, logged) {
  const s = new Set();
  if (!stats.last) return s;
  for (let c = 1; c <= 2; c++) {
    const start = addDays(stats.last.start, stats.avgCycleLength * c);
    for (let i = 0; i < stats.avgPeriodLength; i++) {
      const d = addDays(start, i);
      if (d >= stats.today && !logged.has(d)) s.add(d);
    }
  }
  if (stats.isOngoing) {
    const capEnd = addDays(stats.last.start, stats.avgPeriodLength - 1);
    for (let d = addDays(stats.today, 1); d <= capEnd; d = addDays(d, 1)) {
      if (!logged.has(d)) s.add(d);
    }
  }
  return s;
}

export function overlaps(start, end, ignoreId, stats) {
  const ee = end || effectiveEnd({ start, end: null }, stats);
  return stats.periods.some((o) => o.id !== ignoreId && start <= effectiveEnd(o, stats) && o.start <= ee);
}

/**
 * Turn stats into the calm, plain-language summary shown on the dashboard.
 * Returns { head, body, basis }.
 */
export function cycleSummary(stats) {
  if (!stats.last) {
    return {
      head: "No periods logged yet",
      body: 'Tap a day in the calendar and choose "Period started on this day." Estimates begin after your first log.',
      basis: "",
    };
  }
  const range = `${fmtShort(addDays(stats.nextStart, -stats.marginDays))} to ${fmtShort(
    addDays(stats.nextStart, stats.marginDays)
  )}`;
  let head, body;
  if (stats.isOngoing) {
    head = `Period day ${stats.cycleDay}`;
    body = `Started ${fmtShort(stats.last.start)}. The next one is expected around ${fmtShort(
      stats.nextStart
    )}.`;
  } else if (stats.daysUntilNext > 1) {
    head = `Around ${fmtShort(stats.nextStart)}`;
    body = `In ${stats.daysUntilNext} days. Most likely between ${range}.`;
  } else if (stats.daysUntilNext === 1) {
    head = `Around ${fmtShort(stats.nextStart)}`;
    body = `Tomorrow. Most likely between ${range}.`;
  } else if (stats.daysUntilNext === 0) {
    head = "Expected today";
    body = `Most likely between ${range}.`;
  } else {
    const late = -stats.daysUntilNext;
    head = `Expected ${fmtShort(stats.nextStart)}`;
    if (late <= stats.marginDays) {
      body = "Still within your usual range. Nothing to do yet.";
    } else {
      body =
        `A little later than usual, by ${late} day${late === 1 ? "" : "s"}. That happens, and stress or travel can shift things.` +
        (late >= 14 ? " If this feels unusual for you, a doctor can help." : "");
    }
  }
  const basis =
    stats.recent.length >= 2
      ? `Based on your last ${stats.recent.length} cycles: about ${stats.avgCycleLength} days apart, periods around ${stats.avgPeriodLength} days.`
      : `Using a typical ${stats.avgCycleLength}-day cycle. Estimates become personal after three logged periods.`;
  return { head, body, basis };
}
