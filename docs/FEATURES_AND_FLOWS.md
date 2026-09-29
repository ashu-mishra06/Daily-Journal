# Daily Journal — Features and flows

Each section below is self-contained: paste just one into your coding tool
when you're building that feature. Pseudocode matches the logic already
working in `daily-journal-design-system-v3.html`, so you can also just read
the corresponding function in that file (names are given).

---

## 1. Sign up, verify, choose a username

**Flow**
1. Email + password → create unverified account, send a 6-digit code.
2. Enter code → mark email verified. Allow "send a new code".
3. Choose username → check availability as the person types (debounce
   ~400ms). If taken, suggest 2–3 unused variants (`name_42`, `name_j`,
   `the_name`) as one-tap buttons. Username is permanent once claimed in v1
   (renaming is a fine v2 feature, not required now).
4. Land on the "link with your partner" step (section 2).

**Validation**
- Email: standard format check.
- Password: 8+ characters minimum.
- Username: `^[a-z][a-z0-9_]{2,19}$`, must not already exist.

**Errors are specific, not generic** — e.g. "That code doesn't match. Check
the latest email, or send a new code," not "Invalid input."

Prototype reference: `authRender()`, the `f-signup` / `f-verify` / `f-user`
submit handlers, and the debounced `#un-input` availability check.

---

## 2. Linking two accounts

**Flow**
1. User A enters User B's username and sends a link request.
2. User B sees the pending request (username of A, a one-line explanation
   that linking doesn't share anything by itself) and accepts or declines.
3. On accept, both users are marked `active` in a `Link` row. Passkeys become
   available to both.
4. Either user can unlink at any time, with a confirmation step that states
   plainly: "Passkeys you shared stop working. Your journals stay yours."
   Unlinking revokes any passkeys tied to that link.

**Edge cases**
- Requesting your own username → reject with a clear message.
- Requesting a username that doesn't exist → "We couldn't find @x. Check the
  spelling."
- If your product answer restricts users to one active link, block a second
  request while one is active/pending and say so.

Prototype reference: `f-link` submit handler, `linkWith()`, the `askunlink` /
`unlink` actions in the `#auth-card` click handler.

---

## 3. Passkeys (read-only sharing)

**Flow**
1. Gate the whole panel behind an active Link — if none, show a locked state
   with a link to the linking flow, don't just hide the feature silently.
2. "Create passkey" generates a code (`WORD-0000-WORD`, e.g. from two random
   dictionary words + 4 digits) tied to the current Link. Only one active
   passkey per direction at a time keeps this simple — creating a new one can
   either replace the old (simplest) or coexist, your choice.
3. Owner can copy the code, see a read-only list of who has used it, and
   revoke it. Revoking asks for confirmation once, explaining the
   consequence in one sentence, then a single tap confirms.
4. Partner enters the code in "Open a shared journal." Validate format first
   (regex `^[A-Z]+-\d{4}-[A-Z]+$`) before checking existence, so typos get a
   specific message ("that doesn't look like a passkey") rather than a
   generic "not found."
5. A valid, non-revoked code opens the owner's journal in a **read-only**
   view: permanent banner, the owner's pen colour, no edit affordances
   anywhere in that view — enforce this server-side too, not just in the UI.

Prototype reference: `pkRender()`, `viewRender()`, the `#pk-card` and
`#pk-view` handlers.

---

## 4. Dashboard customisation

**Flow**
- Cards: Today, Calendar, Cycle, Thinking of your partner, Recent notes.
- "Arrange cards" toggles an edit mode. In edit mode each card shows a drag
  handle plus **Earlier / Later** buttons and a **Hide** button — the buttons
  exist so reordering works without a mouse or touch drag (keyboard and
  screen-reader users need a non-drag path).
- Dragging a handle (pointer events cover mouse, pen and touch) reorders
  cards live; releasing persists the new order.
- Hidden cards appear as "Show X" chips above the grid while in edit mode.
- Persist `order` and `hidden` per user (or per device, if you'd rather keep
  it simple and skip syncing layout across devices).
- Announce every reorder/hide/show to assistive tech (e.g. "Cycle moved to
  position 2 of 4").

Prototype reference: `renderWidgets()`, the `pointerdown`/`dragMove`/
`dragEnd` handlers, and the `data-mv` / `data-hide` / `data-show` actions.

---

## 5. Cycle tracking and prediction

### Logging
- Tapping a calendar day opens a day sheet with period controls:
  - If no period covers that day: **"Period started on this day."**
  - If a period is open-ended and the tapped day is after its start:
    **"Period ended on this day."**
  - Always: direct **first day** / **last day** date fields for correcting
    history, with the last day optionally empty (ongoing).
- Validation on save: start ≤ today; end (if set) ≥ start and ≤ today;
  length ≤ 14 days; no overlap with another logged period for that user.

### Prediction algorithm (pure function of the user's own Period history)
```
cycles = []
for i in 1..len(periods)-1:
  length = days_between(periods[i-1].start, periods[i].start)
  if 18 <= length <= 60:            # filters out obvious missed logs
    cycles.append(length)

recent = last 6 of cycles
avg_cycle_length = round(mean(recent)) if len(recent) >= 2 else 28

period_lengths = [days_between(p.start, p.end) + 1 for p in periods if p.end]
avg_period_length = round(mean(last 6 of period_lengths)) if any else 5

margin_days =
  1..3, ≈ round(stdev(recent)) clamped to [1,3]   if len(recent) >= 3
  2                                                 if len(recent) == 2
  3                                                 otherwise

last = most recent period (by start date)
next_start_estimate   = last.start + avg_cycle_length
current_cycle_day     = days_between(last.start, today) + 1
days_until_next        = days_between(today, next_start_estimate)
is_ongoing             = last.end is null AND today <= last.start + 13
```

### Displayed message (pick one, in order)
1. No periods logged → invite them to log the first one; no estimate shown.
2. `is_ongoing` → "Period day N. Next one expected around **date**."
3. `days_until_next > 1` → "Around **date**. In N days. Most likely between
   [next_start − margin] and [next_start + margin]."
4. `days_until_next == 1` → same, "Tomorrow" instead of "In N days."
5. `days_until_next == 0` → "Expected today. Most likely between…"
6. `days_until_next < 0` (late) → "Expected **date**." If the lateness is
   within `margin_days`, say "Still within your usual range." Otherwise name
   the number of days late, calmly, with a possible cause ("stress or travel
   can shift things"), and only past 14 days suggest "a doctor can help" —
   never earlier, and never alarm-toned.
- Always show the basis line: "Based on your last N cycles: about X days
  apart, periods around Y days," or, before 2 logged cycles, "Using a typical
  28-day cycle" so the person knows the estimate is still generic.
- Predicted days on the calendar get a **dashed outline**, never the same
  solid fill as logged days — the visual distinction matters, this is a
  guess, not a fact.

### Sharing
- A separate on/off switch, disabled until linked, shares only the *computed
  summary* above with the partner — never the raw `Period` rows, and never
  the day notes.

Prototype reference: `engine()`, `cycleSummary()`, `effEnd()`, `periodAt()`,
`loggedSet()`, `predictedSet()`, and the day-sheet handlers under `dlg`.

---

## 6. Daily entry (guided questions)

**Flow**
- Fixed set of five questions, shown one at a time with a progress indicator:
  1. Morning — "How did your day start?"
  2. Midday — "What took most of your energy today?"
  3. Evening — "Who or what stayed on your mind this evening?"
  4. Right now — "In a few words, how do you feel right now?"
  5. To remember — "What do you want to remember about today?"
- Each screen: Back, Next (or Skip on any but the last), and on the last
  question a Save button, disabled until at least one of the five has text.
- A live side panel shows a timeline building from answered questions as the
  person writes, so it never feels like a form being filled out.
- One entry per user per calendar date; re-opening an already-saved entry
  goes to an "Entry saved" state with Edit / Start a blank entry.

Prototype reference: `Q`, `st`, `qRender()`, `tlRender()`.

---

## 7. Private notes about your partner

**Flow**
- Four tabs: Hobbies, Favourites, Triggers, Other. Each holds a simple list
  of short text tags, addable and removable.
- A lock-icon line is always visible: "Only you can see these notes." This is
  not a settings toggle — it's a hard rule, enforce it server-side.

Prototype reference: `CATS`, `nRender()`.

---

## 8. Thinking of your partner (thought prompts)

**Purpose**: a light nudge to think about the partner, without exposing
anything private. Distinct from a notification — it only appears when the
person visits the app.

**Question pool**
- A handful of generic, warm prompts about the partner (7 examples in the
  prototype, e.g. "What's something small @partner did recently that you
  appreciated?").
- Optionally personalised using the author's own Hobby/Favourite notes, e.g.
  "@partner loves {favourite}. When did you last share that together?" — the
  favourite/hobby text is only ever used to *phrase* the question; it is
  never sent anywhere or shown to the partner.

**Flow**
1. Gated behind an active Link, same locked-panel pattern as passkeys.
2. If `thought_frequency == off`, show a quiet note and a link to comfort
   settings instead of a prompt.
3. Otherwise show one current prompt with a text box. Two actions:
   - **Share with @partner** — requires non-empty text, appends a
     `ThoughtPrompt` row with `shared = true`, generates the next prompt.
   - **Ask something else** — discards nothing (draft is simply not saved),
     generates a new prompt. No counter, no "you've skipped N" messaging.
4. A "Recent" list below shows both what you've shared (labelled "You, about
   @partner") and what your partner has shared about you (labelled "From
   @partner"), each with the question and answer, newest first.
5. The partner sees only `shared = true` rows where they are `about_user_id`
   — never the drafts, never the source PartnerNote.

**Frequency semantics** (no real scheduler needed for a v1 — this can simply
gate whether the feature is shown at all, or drive how often a *new* prompt
is generated automatically if you build a background job later):
- `occasional` (default): a new prompt is available roughly every 1–3 days.
- `rare`: roughly weekly.
- `off`: feature hidden except for a re-enable link.

Prototype reference: `THOUGHT_GENERIC`, `thoughtPool()`, `fillP()`,
`thoughtSectionHTML()`, `thoughtRender()`, the `data-tp` click handler.

---

## 9. Comfort settings

**Flow**
- Theme: `auto` follows `prefers-color-scheme`; `light`/`dark` pin it.
- Text size: `regular`/`large` bumps base font size and related sub-text.
- Ruled lines: `on`/`off` — off removes the notebook rule-lines background
  for a plainer look; also disable the line-snapping height adjustment used
  to keep cards aligned to the rule grid, since there's no grid to align to.
- Thought frequency: see section 8.
- All four persist per device (`localStorage` in the prototype; a per-user DB
  row if you want it to follow the person across devices).

Prototype reference: `store`, `C`, `applyComfort()`.
