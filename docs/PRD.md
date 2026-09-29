# Daily Journal — PRD

## 1. What this is
A shared journal for two people. Each person keeps their own private journal —
daily entries, a cycle tracker, and private notes about their partner — and
can choose to let their partner read parts of it. Nothing is shared by
default. Platform: responsive web, used on both desktop and phone.

## 2. Who it's for
Two people in a relationship who want a low-effort way to keep a record of
their days and to feel a little more in touch with what's going on with the
other person, without turning it into a chore, a habit-tracker, or a source
of guilt.

## 3. Design principles
- **Calm over engagement.** No streaks, scores, counters, or "you missed a
  day" messaging. Nothing is marked as a failure.
- **Consent-based sharing.** Nothing about a person is visible to their
  partner until that person explicitly shares it (passkey, or a shared
  thought). Private notes are never shared, ever.
- **One main action per screen.**
- **The person decides the layout.** The dashboard is rearrangeable.
- **Plain, warm language**, like a friend asking, never a form.

## 4. User model
- Two account types, symmetric: both people can write and both can read what
  the other shares. There is no "admin" or fixed writer/viewer role.
- Accounts are linked in pairs, by username, before any journal content can be
  shared. Linking itself does not share anything.
- After linking, either person can generate a **passkey** that gives their
  partner **read-only** access to their journal and profile. It never
  expires; the owner can revoke it at any time.

## 5. Features

### 5.1 Account and linking
- Sign up with email + password, confirm the email with a 6-digit code.
- Choose a unique username (3–20 chars, lowercase letters/numbers/underscore).
  This is the identity your partner links to — checked for availability as
  the person types, with suggestions if it's taken.
- Send a link request by username; the other person accepts or declines.
  Either person can unlink later, which also revokes any passkeys.

### 5.2 Dashboard
- Live date/time, a month calendar, a cycle summary, a "thinking of your
  partner" prompt, and a recent-notes list — as separate cards.
- The person can drag cards to reorder them, or use "Earlier / Later" buttons,
  hide a card, and bring a hidden card back. The arrangement is remembered on
  that device.

### 5.3 Calendar and cycle tracking
- Tapping any day opens a day sheet: a free-text note for that day, and cycle
  controls (mark a period as started/ended on this day, or edit the first/
  last day of a period directly).
- The system predicts the next period from the person's own logged history
  (see FEATURES_AND_FLOWS.md for the exact algorithm) and shows an estimated
  date range, cycle day, and whether the current cycle is running long.
- A short history table of past periods and cycle lengths, editable inline.
- The tracker follows **her** cycle specifically, per the product notes; see
  the open question below on who is allowed to log it.

### 5.4 Daily entry
- A short guided interview, not a blank page: up to five questions, one at a
  time, each tied to a part of the day (morning / midday / evening / right
  now / what to remember). Every question is skippable. Answers build a
  timeline of the day as the person writes.
- At least one answered question is required to save; the rest can stay
  blank.

### 5.5 Private notes about your partner
- Freeform notes in four categories: Hobbies, Favourites, Triggers, Other.
- Always private to the author — this is stated on screen, not just implied.
  These notes are also the source material the system uses to personalise
  thought prompts (see 5.6); they are never shown to the partner, even then.

### 5.6 Thinking of your partner (thought prompts)
- The system occasionally offers a short, gentle question about the
  partner — general ("What's something small they did recently that you
  appreciated?") or personalised using the person's own private notes
  ("When did you last ask them about sketching?").
- The person can answer and share it, or skip it for another question.
  Sharing sends only the question and the answer to the partner — never the
  underlying private note.
- Frequency is adjustable (Occasional / Rare / Off) and defaults to
  Occasional. There is no pressure, count, or reminder if it's skipped.

### 5.7 Sharing (passkeys)
- Available only after two accounts are linked.
- Create a passkey (format `WORD-0000-WORD`), copy it, see who has used it,
  revoke it with a confirmation step.
- Entering a partner's passkey opens their journal read-only, with a
  permanent banner and the partner's own pen colour on every entry.
- A person may choose to also share their cycle summary (not raw notes) with
  a linked partner via a separate on/off switch.

### 5.8 Comfort settings
- Theme: match device / day / night.
- Text size: regular / large.
- Ruled lines: on / off (plain paper for a calmer, less "worksheet" look).
- Thought-prompt frequency (see 5.6).
- All comfort settings persist per device.

## 6. Non-goals (for this version)
- No medical claims, no contraceptive guidance from the cycle tracker.
- No push notifications or reminders that could feel like nagging.
- No public or multi-partner sharing — this is a pair, not a group.
- No editing of a partner's content — read-only means read-only.

## 7. Access model (summary)

| Content | Owner | Linked partner, has passkey | Linked partner, no passkey |
|---|---|---|---|
| Journal entries & profile | Read, write | Read only | Nothing |
| Day notes | Read, write | Nothing | Nothing |
| Cycle summary | Read, write | Read only, if owner switches sharing on | Nothing |
| Private notes about partner | Read, write | Never | Never |
| A thought the owner chose to share | Read, write | Read only | Nothing |
| Passkey | Create, copy, revoke | Enter only | Enter only |

## 8. Open questions
1. Who can log the cycle: only the person it follows, or either partner?
2. Should a partner get a gentle heads-up when a period is expected, if
   sharing is switched on — or is that too close to a notification/alarm?
3. Can a person link with more than one partner, or is it strictly one active
   link at a time?
