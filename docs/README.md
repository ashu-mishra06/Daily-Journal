# Daily Journal — build docs

This folder is written for "vibe coding": paste these files into your AI coding
tool (Cursor, Claude Code, Copilot, etc.) as context, one at a time or all
together, and ask it to build the app section by section. Each file covers one
concern, so you can hand over just the one you're working on.

Read them in this order:

1. **PRD.md** — what the product is, who it's for, and the full feature list.
   Start here so the AI understands intent, not just screens.
2. **DATA_MODEL.md** — every entity (user, entry, period, passkey, etc.), its
   fields, and how they relate. Hand this over before asking for any backend
   or storage code.
3. **FEATURES_AND_FLOWS.md** — step-by-step behaviour for every feature,
   including the cycle-prediction algorithm and the thought-prompt logic in
   plain pseudocode. This is the file to paste when building one specific
   feature.
4. **DESIGN_SYSTEM.md** — colours, type, spacing, components, responsive
   rules, accessibility and voice. Paste this whenever you're generating UI,
   so the output matches the rest of the app.
5. **ARCHITECTURE.md** — suggested folder structure, state shape, and how the
   working prototype maps onto real app code (routes, storage, sync).
6. **BUILD_PLAN.md** — a phased checklist. Good to paste alongside a prompt
   like "let's do Phase 2" so the AI only builds what's next.

## What already exists

`daily-journal-design-system-v3.html` (in the parent folder) is a single-file,
fully working prototype of the whole product: sign-up, linking, passkeys, the
customisable dashboard, cycle tracking with real prediction logic, guided
journal entries, private notes, and the thought-prompt feature. It has no
backend — everything lives in memory and a little `localStorage` for
preferences, and resets on reload except for those preferences.

Treat it as the reference implementation for behaviour and visual detail. When
you ask your coding tool to build a real feature, tell it to match this file's
logic and copy, and to read the matching section of `FEATURES_AND_FLOWS.md`
for the parts that need a real backend (accounts, persistence, notifications).

## What's still undecided

Three product questions are flagged as open in PRD.md. Decide these before
building the backend, since they change the data model:
- Who can log the cycle — only the person it follows, or either partner?
- Should a linked partner get a heads-up when a period is expected, if
  sharing is on?
- Can a person link with more than one partner, or is it strictly one?
