// Validation helpers — see docs/FEATURES_AND_FLOWS.md for where each is used.

export function emailOk(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v || "");
}

export function passwordOk(v) {
  return typeof v === "string" && v.length >= 8;
}

export function usernameOk(v) {
  return /^[a-z][a-z0-9_]{2,19}$/.test(v || "");
}

export function passkeyFormatOk(v) {
  return /^[A-Z]+-\d{4}-[A-Z]+$/.test(v || "");
}

// Suggest unused variants of a taken username.
export function suggestUsernames(base, taken) {
  const candidates = [
    `${base}_${Math.floor(10 + Math.random() * 89)}`,
    `${base}_j`,
    `the_${base}`,
  ];
  return candidates.filter((c) => usernameOk(c) && !taken.includes(c));
}

// Period date validation, per FEATURES_AND_FLOWS.md §5.
// periods: existing Period[] for this user, ignoreId: the period being edited (if any).
export function validatePeriodDates({ start, end, today, periods, ignoreId }) {
  if (!start) return "Choose the first day.";
  if (start > today) return "The first day can't be in the future.";
  if (end) {
    if (end < start) return "The last day can't be before the first day.";
    if (end > today) return "The last day can't be in the future.";
    if (daysBetween(start, end) + 1 > 14) {
      return "Periods longer than 14 days can't be logged. Check the dates.";
    }
  }
  const effectiveEnd = end || start; // rough overlap check; full effEnd logic lives in cycleEngine
  const overlap = periods.some(
    (p) => p.id !== ignoreId && start <= (p.end || p.start) && p.start <= effectiveEnd
  );
  if (overlap) return "These dates overlap another period you already logged.";
  return null;
}

export function daysBetween(a, b) {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}
