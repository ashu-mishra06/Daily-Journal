# Daily Journal — Architecture notes

The prototype is one self-contained HTML file with everything in memory. This
is fine for design review, but a real build needs accounts, persistence, and
two devices seeing the same linked data. This doc suggests a shape; adapt it
to whatever stack you're already vibe-coding in.

## Suggested stack (pick what fits your tool)
- **Frontend**: any component framework (React/Vue/Svelte). The prototype's
  CSS (tokens, layout, components) can be lifted close to verbatim into
  global styles or a design-token file — see DESIGN_SYSTEM.md.
- **Backend**: a small REST or RPC API is enough; nothing here needs
  real-time infra except optionally the "thought shared" / "entry written"
  notifications, which can start as simple polling.
- **Database**: any relational DB matches DATA_MODEL.md directly (Postgres,
  SQLite for local dev).
- **Auth**: email + password + 6-digit email code, as in the prototype. Any
  standard auth library works; the important part is the verified-email step
  before letting a username be claimed.

## Suggested folder structure
```
/app
  /routes or /pages
    /auth            sign-up, verify, username
    /link            send/accept link requests
    /dashboard       the card grid
    /calendar        month view + day sheet
    /journal         guided entry flow
    /notes           private notes about partner
    /thoughts        thought-prompt feature
    /sharing         passkey create/enter/revoke
    /settings        comfort preferences
  /components
    Button, Field, Pill, Switch, Tabs, Toast, DaySheet, CalendarDay,
    QuestionCard, PasskeyCard, LockedPanel, ThoughtCard   (see DESIGN_SYSTEM.md)
  /lib
    cycleEngine.ts     — pure function(s) from FEATURES_AND_FLOWS.md §5
    thoughtPool.ts      — prompt templates + fill-in logic from §8
    validators.ts       — email/username/passkey/date validation
  /server (or /api)
    auth, links, passkeys, entries, notes, periods, thoughts, comfort
    — one module per entity in DATA_MODEL.md, each just CRUD plus the
      access-control check from PRD.md §7
```

## State shape (client)
Keep it close to the prototype's in-memory shape, since that's already been
designed around the UI:
```
{
  auth: { user, step },              // sign-up/link wizard step
  link: { partner, pendingRequest, incomingRequest },
  passkeys: { mine: {...}, forPartner: {...} },
  dashboard: { order: [...], hidden: [...] },
  comfort: { theme, textSize, ruledLines, thoughtFrequency },
  periods: [...],                    // this user's own, used by cycleEngine
  entries: { [date]: {...} },
  dayNotes: { [date]: text },
  partnerNotes: { hobby: [...], favourite: [...], trigger: [...], other: [...] },
  thoughts: [...]                    // both directions, filtered by API already
}
```

## Cross-cutting rules to enforce server-side, not just in the UI
These are stated as UI behaviour in FEATURES_AND_FLOWS.md, but must be
enforced by the API too, since a determined client could otherwise bypass
them:
1. A passkey-holder's requests can only ever return read access, never write
   endpoints, for the journal they're viewing.
2. `PartnerNote` rows are never returned to anyone but their `user_id`, no
   matter what token is presented.
3. `ThoughtPrompt` rows are only returned to `about_user_id` when
   `shared = true`.
4. Cycle summary is only returned to a linked partner if
   `CycleSharePreference.shared = true` for that owner; raw `Period` rows are
   never returned to a partner at all, shared or not.
5. All date validations in FEATURES_AND_FLOWS.md §5 (no future dates, no
   overlaps, 14-day cap) are re-checked server-side.

## Sync and offline
The prototype has no persistence beyond `localStorage` for comfort settings.
For a real build, the simplest correct approach:
- Comfort + dashboard layout: write-through to the server on change, but also
  cache locally so the UI never blocks on network for a preference toggle.
- Journal entries / day notes / periods / partner notes: normal save-on-
  action (the UI already disables Save until there's something to save), no
  need for offline-first complexity in v1.
- Thought prompts: generate the "current" prompt client-side from the pool
  (or server-side if you want prompts to be consistent across the person's
  devices) — either is fine since it's stateless until shared.

## What NOT to change from the prototype
- The access table in PRD.md §7 — it's the whole trust model of the product.
- The refusal to add streaks, badges, or reminders — see DESIGN_SYSTEM.md
  voice section and PRD.md non-goals.
- The locked-panel pattern for partner-dependent features — always explain,
  never silently hide.
