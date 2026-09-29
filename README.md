# Daily Journal — frontend scaffold

A runnable React + Vite scaffold implementing the flows described in
`/docs` (PRD.md, DATA_MODEL.md, FEATURES_AND_FLOWS.md, DESIGN_SYSTEM.md,
ARCHITECTURE.md). There is no real backend here: `src/lib/store.jsx` is a
small in-memory + localStorage "mock API" that mirrors the data model, plus
a seeded demo partner (`@sam`) so the linking, passkey, cycle-sharing and
thought-prompt flows can all be exercised end to end on one device.

## Run it
```
npm install
npm run dev
```

## Status
Every file has been syntax-checked and the whole app bundles cleanly with
esbuild (no missing imports/exports), which rules out most typos. It has
**not** been run in a real browser or against `npm install` — this sandbox
has no network access — so give it a real `npm run dev` and click through
the flows once before trusting the runtime behaviour, especially the
`<dialog>`-based day sheet.

## Where things live
- `src/lib/cycleEngine.js` — the period-prediction algorithm, pure functions,
  no UI. Matches FEATURES_AND_FLOWS.md §5 exactly.
- `src/lib/thoughtPool.js` — the "thinking of your partner" question pool and
  fill-in logic, matches §8.
- `src/lib/validators.js` — email/username/passkey/date validation, used by
  both the store and the forms.
- `src/lib/store.jsx` — the app's state (Context + hook), one function per
  action in FEATURES_AND_FLOWS.md, persisted to `localStorage`.
- `src/components/` — the reusable pieces from DESIGN_SYSTEM.md (Button,
  Field, PillGroup, SwitchToggle, Tabs, Toast, LockedPanel, CalendarGrid —
  which renders each day cell inline, QuestionCard, PasskeyCard, ThoughtCard,
  DaySheet).
- `src/routes/` — one file per screen (Auth, Link, Dashboard, Calendar,
  Journal, Notes, Thoughts, Sharing, Settings), matching ARCHITECTURE.md.
- `src/styles/tokens.css` — the design tokens and base component styles from
  DESIGN_SYSTEM.md. It's a trimmed version of the full notebook texture in
  the HTML prototype (`daily-journal-design-system-v3.html`); pull more of
  the paper/hole/grain detail from there if you want the exact look.

## What's simplified here vs. the HTML prototype
- Dashboard reordering uses the Earlier/Later buttons only (no pointer-drag)
  — this is the keyboard-accessible path the prototype also ships, and is
  enough to prove the "customisable dashboard" requirement without a drag
  library.
- No routing library — `App.jsx` switches screens with plain state, which is
  enough for a single-page app like this. Swap in a router when you add
  real URLs/deep-linking.
- One simulated "signed-in device" — there's no second browser/session to
  link against, so linking, redeeming a passkey, and receiving a thought all
  work against the seeded `@sam` demo partner instead of a second real user.
  Swap `src/lib/store.jsx`'s functions for real API calls when you have a
  backend (see ARCHITECTURE.md for the suggested endpoints).

## Next step
Replace the bodies of the functions in `store.jsx` with real `fetch` calls to
your API, keeping the same function names/signatures — every component
already calls them, so the UI layer shouldn't need to change.
