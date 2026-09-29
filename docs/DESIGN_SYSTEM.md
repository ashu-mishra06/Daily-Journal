# Daily Journal — Design system reference

Paste this alongside any UI-generation prompt so new screens match the rest
of the app. The interactive version of this lives in
`daily-journal-design-system-v3.html` — that file is the source of truth for
exact values; this document explains the *why* and lists the tokens.

## Concept
The interface is a real ruled notebook page: a 28px line grid, a soft margin
line, punched holes, faint paper grain. Each person writes in their own pen
colour, so authorship is visible without a label. The whole system exists to
feel calm — quiet colours, generous space, handwriting only where it adds
warmth, never where it needs to be read quickly.

## Colour tokens

| Token | Role | Day | Night |
|---|---|---|---|
| `paper` | Page background | `#F7F9F6` | `#161B2A` |
| `card` | Cards on the page | `#FFFFFF` | `#1E2438` |
| `ink` | Main text | `#1B2744` | `#E7EAF3` |
| `ink-soft` | Helper text | `#4E5A75` | `#A3ACC3` |
| `ink-a` (blue pen) | You, primary actions | `#1F3F87` | `#93B3FF` |
| `ink-b` (green pen) | Your partner | `#2A6B4E` | `#7FD3A9` |
| `rule` | Ruled lines | `#D3DFEC` | `#232C45` |
| `rule-strong` | Dashed/outline indicators | `#6F8AAE` | `#5C6E99` |
| `margin` | Margin line | `#E9A0A9` | `#7A4450` |
| `period` | Cycle only — never doubles as an error colour | `#B93E5B` | `#F28CA4` |
| `period-tint` | Logged-day fill | `#F7DCE2` | `#4B2735` |
| `highlight` | Selected / hovered / focused fields | `#F6E489` | `#5A4E14` |
| `danger` | Errors, destructive actions | `#A8321F` | `#FF9C8A` |

Rose (`period`) is reserved for the cycle so a person never reads a period
indicator as a warning.

## Typography

| Token | Desktop | Phone | Use |
|---|---|---|---|
| `type-page` | 84/84, Caveat 700 | 52/56 | Page title, once per screen |
| `type-date` | 64/56, Caveat 700 | 48/56 | Dashboard date |
| `type-section` | 48/56, Caveat 700 | 40/56 | Section headings |
| `type-question` | 36/42, Caveat 700 | 36/42 | Journal & thought-prompt questions |
| `type-title` | 22/28, Newsreader 600 | same | Card titles |
| `type-body` | 18/28 (20/28 large text), Newsreader 400 | 17/28 | Body, entries |
| `type-small` | 16/24, Newsreader 400 | same | Helper text — the floor, never smaller |

Two fonts only: **Caveat** (handwriting — dates, titles, questions, day
numbers, never below 22px) and **Newsreader** (everything meant to be read
quickly — body, labels, buttons, tables). Body copy is capped near 66
characters per line.

## Layout and breakpoints

| Breakpoint | Range | Behaviour |
|---|---|---|
| Phone | ≤ 640px | Single column. Day sheet becomes a bottom sheet. Top nav scrolls sideways. |
| Tablet | 641–980px | Single column of cards, wider margins. |
| Desktop | ≥ 981px | Two-column card grid. Content capped at 1160px wide. |

## Space, shape, motion

| Token | Value | Note |
|---|---|---|
| `line` | 28px | Base unit — text blocks and vertical rhythm are multiples of it. |
| `space-1..5` | 4 / 8 / 14 / 28 / 56px | 14 is the smallest gap between related items. |
| `touch-target` | 44px minimum | Every button, tab, switch, calendar day. |
| `radius-paper` | 3px | Cards, tables — nearly square, like paper. |
| `radius-control` | 4px | Buttons, inputs, tab tops (6px). |
| `radius-chip` | 999px | Tags only. |
| `lift` | 1px edge + soft 10px shadow | The one elevation level. Dragging gets a stronger shadow. |
| `stamp` | 3px 3px 0, ink colour | Hard shadow on button hover — like a rubber stamp. |
| `motion-quick` / `motion-settle` | 120ms / 200ms ease | Hover/press vs. toasts appearing. The only automatic motion is one pen-stroke under the page title on load. All motion is removed under `prefers-reduced-motion`. |

## Components
- **Button** — primary (one per screen) / secondary / quiet (underlined,
  low emphasis) / destructive. States: default, hover (lift + stamp shadow),
  focus (3px ring, 3px offset), loading (`aria-busy`, spinner), disabled (50%
  opacity). Labels name the outcome ("Write today's entry"), and the
  following toast reuses the same verb.
- **Field** — ruled underline inputs; textareas keep the notebook rule
  spacing. Error state turns the underline `danger` and shows an inline
  message, never a colour-only cue.
- **Segmented pill group** — for small, exclusive choices (theme, text size,
  frequency) — a row of pill-shaped radio buttons, not a dropdown, so all
  options are visible at once.
- **Switch** — for a single on/off (cycle sharing) — a track-and-thumb toggle
  with `role="switch"` and `aria-checked`.
- **Passkey card** — code display, copy, viewer list, revoke with a
  one-step confirmation.
- **Calendar day** — a button, not a static cell, with a full text label for
  assistive tech (e.g. "12 September, period logged, entry by you"). Non-
  colour cues: filled drop icon = logged period, dashed outline drop = 
  predicted, small triangle = has a note, filled circle = your entry, filled
  diamond = partner's entry.
- **Guided question card** — progress "stitches" (dashed = upcoming, solid =
  done, highlighted = current), one question, one textarea, Back/Next/Skip.
- **Tag/chip** — private notes and (optionally) triggers use a dashed
  border variant to visually flag sensitivity without colour-coding alarm.
- **Tabs** — arrow-key navigable, one visible panel.
- **Day sheet** — a modal (desktop) / bottom sheet (phone) opened from a
  calendar tap; traps focus, closes on Escape or backdrop click, returns
  focus to the day that opened it.
- **Locked panel** — the consistent way to show a partner-dependent feature
  (passkeys, cycle sharing, thought prompts) before linking: explain what's
  missing in one line and link to the linking flow, never just hide the
  feature.
- **Toast** — bottom-centre, ~3.2s, polite live region, verb matches the
  triggering action.
- **Empty state** — one handwritten line inviting action, e.g. "No entries
  this week. Write today's." Never a stock illustration or a dead end.

## Accessibility
- Contrast ≥ 4.5:1 in both day and night themes.
- Never colour alone — every cycle/entry indicator above has a shape or icon
  companion.
- All interactions have a non-drag, non-hover path (see dashboard reordering
  buttons).
- Focus is always visible (3px ring, 3px offset) and managed explicitly after
  every action (e.g. focus returns to the calendar day after closing its
  sheet).
- Status messages use polite live regions; destructive confirmations use
  `role="alert"`.
- Full `prefers-reduced-motion` support.

## Voice
- Plain verbs, sentence case, no filler — sounds like a friend, not a form.
- Errors say what happened and how to fix it; they never apologise or blame.
- Sensitive topics (cycle, triggers) are named plainly, never joked about.
- Nothing implies failure: no "you missed a day," no red badges, no streak
  counters anywhere in the product.
