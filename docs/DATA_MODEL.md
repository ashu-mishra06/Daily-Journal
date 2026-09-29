# Daily Journal — Data model

This mirrors the state used in the working prototype (`daily-journal-design-
system-v3.html`), written as if it were persisted server-side. Field names
match the prototype's variables where possible, so behaviour is easy to
cross-check.

## Entities

### User
| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| email | string | unique, verified |
| password_hash | string | |
| username | string | unique, 3–20 chars, `^[a-z][a-z0-9_]{2,19}$` |
| created_at | datetime | |

### Link
Represents the pairing between two users. Symmetric — there is no "owner" of
the link.
| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| user_a_id / user_b_id | uuid | the two linked users |
| status | enum | `pending` (request sent), `active`, `ended` |
| requested_by | uuid | who sent the request |
| requested_at / accepted_at / ended_at | datetime | |

A user should have at most one `active` link if the product answer to open
question 3 is "one partner at a time"; otherwise drop that constraint.

### Passkey
| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| owner_id | uuid | the user whose journal it opens |
| link_id | uuid | must reference an `active` Link containing owner_id |
| code | string | format `WORD-0000-WORD`, unique, indexed |
| created_at | datetime | |
| revoked_at | datetime, nullable | null = active |
| used_by | uuid, nullable | set on first successful entry; read-only from then on |

A passkey never expires on its own — only `revoked_at` ends it. Revoking or
ending the Link should also set `revoked_at` on any passkey tied to it.

### JournalEntry
The guided daily entry.
| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | author |
| date | date | one per user per date (upsert on save) |
| answers | jsonb | `[{tag, question, answer}]`, in the fixed 5-question order |
| updated_at | datetime | |

`answers` keeps the question text alongside the answer so historical entries
stay readable even if the question pool changes later.

### DayNote
Free-text note attached to a specific calendar day (separate from
JournalEntry so a note can exist for a day with no guided entry, e.g. a note
left on a past or future date from the cycle calendar).
| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | |
| date | date | one per user per date |
| text | string | |
| updated_at | datetime | |

### Period
| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | the person the cycle belongs to |
| start_date | date | required |
| end_date | date, nullable | null = ongoing |
| created_at / updated_at | datetime | |

Validation rules (enforced in the app layer, see FEATURES_AND_FLOWS.md):
- `start_date` cannot be in the future.
- `end_date`, if present, must be ≥ `start_date` and not in the future.
- A period cannot be longer than 14 days.
- Date ranges for one user's periods cannot overlap.

### CycleSharePreference
| Field | Type | Notes |
|---|---|---|
| user_id | uuid | |
| shared | boolean | whether the cycle *summary* (not raw Period rows) is visible to the linked partner |

### PartnerNote
Private notes about the partner. Never exposed via any API the partner can
call.
| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | author, and only viewer |
| category | enum | `hobby`, `favourite`, `trigger`, `other` |
| text | string | |
| created_at | datetime | |

### ThoughtPrompt
A question generated about the partner, and the author's response.
| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| author_id | uuid | who was asked |
| about_user_id | uuid | the partner the question is about |
| question | string | filled-in text, e.g. "What's something small @sam did recently…" |
| answer | string, nullable | null until answered |
| shared | boolean | false until the author chooses to share |
| shared_at | datetime, nullable | |
| created_at | datetime | |

Only rows where `shared = true` are ever returned to `about_user_id`. The
`PartnerNote` rows used to personalise a question are referenced only at
generation time (to build `question`) and never stored as a foreign key or
exposed.

### DashboardLayout
Per-device (or per-user, your choice) card arrangement.
| Field | Type | Notes |
|---|---|---|
| user_id | uuid | |
| order | string[] | card ids in display order, e.g. `["today","calendar","cycle","thought","notes"]` |
| hidden | string[] | card ids currently hidden |

### ComfortPreference
| Field | Type | Notes |
|---|---|---|
| user_id | uuid | |
| theme | enum | `auto`, `light`, `dark` |
| text_size | enum | `regular`, `large` |
| ruled_lines | boolean | |
| thought_frequency | enum | `occasional`, `rare`, `off` |

## Relationships at a glance

```
User 1───* Period
User 1───* JournalEntry
User 1───* DayNote
User 1───* PartnerNote
User 1───1 ComfortPreference
User 1───1 DashboardLayout
User 1───1 CycleSharePreference
User *───* User   (via Link, at most one active pair per PRD default)
Link  1───* Passkey
User(author) 1───* ThoughtPrompt *───1 User(about)
```

## Cycle engine inputs/outputs (for reference)
See `FEATURES_AND_FLOWS.md` for the full algorithm. It consumes a user's
`Period` rows (sorted by `start_date`) and produces, without persisting them:
`avg_cycle_length`, `avg_period_length`, `margin_days`, `next_start_estimate`,
`current_cycle_day`, `is_ongoing`. These are always computed on read, never
stored, so they stay correct as new periods are logged or edited.
