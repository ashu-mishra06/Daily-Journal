# Daily Journal — Build plan

A phased checklist. Paste one phase at a time into your coding tool along
with the relevant doc(s) noted in parentheses.

## Phase 0 — Foundations
- [ ] Set up the project and lift the design tokens (colours, type, spacing)
      from `DESIGN_SYSTEM.md` into global styles/theme.
- [ ] Build the base components: Button, Field, Pill group, Switch, Tabs,
      Toast, LockedPanel. *(DESIGN_SYSTEM.md)*
- [ ] Set up the database from `DATA_MODEL.md`. Skip `ThoughtPrompt` and
      `CycleSharePreference` for now if you want a smaller first migration.

## Phase 1 — Accounts and linking
- [ ] Sign up, email verification, username claim with live availability.
      *(FEATURES_AND_FLOWS.md §1)*
- [ ] Sign in.
- [ ] Send/accept/decline a link request by username; unlink with
      confirmation. *(§2)*
- [ ] Access-control check: nothing beyond "linked or not" should be visible
      to another user yet.

## Phase 2 — Journal core (single-player)
- [ ] Guided 5-question daily entry, one per date, timeline side panel.
      *(§6)*
- [ ] Day notes + calendar (without cycle logic yet) — tapping a day opens a
      note field.
- [ ] Private notes about partner (four categories). *(§7)*
- [ ] Comfort settings (theme, text size, ruled lines) with persistence.
      *(§9, DESIGN_SYSTEM.md)*

## Phase 3 — Cycle tracking
- [ ] Period CRUD from the day sheet (start/end a period, edit dates), with
      the validation rules in `FEATURES_AND_FLOWS.md` §5.
- [ ] Implement `cycleEngine` as a pure, testable function — write unit tests
      against a few example histories before wiring it to the UI.
- [ ] Calendar rendering: logged vs. predicted days, non-colour cues.
- [ ] Cycle summary card with the message-selection logic from §5.

## Phase 4 — Sharing
- [ ] Passkey create/copy/revoke, gated behind an active link. *(§3)*
- [ ] Passkey redemption + read-only partner journal view (banner, partner's
      pen colour, no edit affordances — verify server-side, not just UI).
- [ ] Cycle-summary sharing switch (summary only, never raw periods).

## Phase 5 — Thinking of your partner
- [ ] Prompt pool + fill-in logic, optionally personalised from the user's
      own Hobby/Favourite notes. *(§8)*
- [ ] Answer / share / skip flow, `ThoughtPrompt` persistence.
- [ ] Recipient view: only `shared = true` rows about them.
- [ ] Frequency setting wired into whichever pacing mechanism you choose
      (simplest: just gates visibility; fancier: a scheduled job).

## Phase 6 — Dashboard customisation
- [ ] Card grid with all five cards (Today, Calendar, Cycle, Thinking of your
      partner, Recent notes).
- [ ] Reordering via drag handle AND Earlier/Later buttons (keyboard-
      accessible path is required, not optional). *(§4)*
- [ ] Hide/show, persisted layout.

## Phase 7 — Responsive and accessibility pass
- [ ] Verify all three breakpoints from `DESIGN_SYSTEM.md` (phone, tablet,
      desktop), especially the day sheet becoming a bottom sheet on phone.
- [ ] Keyboard-only pass through every flow above.
- [ ] Screen-reader pass: calendar day labels, live regions for toasts,
      focus management on dialogs.
- [ ] `prefers-reduced-motion` and contrast check in both themes.

## Phase 8 — Polish
- [ ] Copy pass against the voice rules in `DESIGN_SYSTEM.md` — no stock
      error language, no accidental guilt-tripping copy anywhere.
- [ ] Empty states for every list (entries, notes, thoughts, periods).
- [ ] Final review of the access table in `PRD.md` §7 against actual API
      responses, not just UI — this is the one thing worth double-checking
      by hand rather than trusting the AI's first pass.
