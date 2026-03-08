# Luna Cycle — Product Notes

Luna Cycle is a lightweight mobile-first cycle tracking prototype built around one goal: make logging and understanding your period rhythms simple enough to do during your day, not just when you have time to open a full app.

## What problem this solves

Many period trackers feel heavy. Users often have to fill long forms or wait for backend-heavy features before they can get started. This product aims to be usable in seconds:

- start a period quickly,
- log a few symptoms in one tap,
- add free-form notes in natural language,
- import history in a second pass,
- and ask quick questions about your own pattern.

The value is in reducing friction so you can keep logging consistently.

## User journey (high level)

### 1) First open

When a user opens the app for the first time, they go through onboarding to set up:

- optional name and email,
- optional last known period start date,
- optional average cycle length,
- reminders + optional Telegram import preference.

This is intentionally minimal: enough to start giving value quickly, with room to grow over time.

### 2) Home / Daily use

Home is the main daily entry point. A user can:

- start or end a period with one tap,
- log symptoms with quick chips,
- paste a short note (for example: “bad cramps, low energy, took ibuprofen, medium flow”),
- review parsed interpretation before saving it,
- and see a quick cycle state card (current phase, cycle day, next estimated window).

The design favors speed and clarity so logging becomes a two-tap habit.

### 3) Ask

Users can ask short questions about their own data, such as:

- “When do I usually start my period?”
- “Have my cramps been worse recently?”
- “Summarize this month”

The app responds with grounded answers from logged history and explains what it used as sources.

### 4) Import bootstrap

If a user has older data, they can paste Telegram-style text or upload a file and review candidate period events before accepting anything.

Each detected event is shown with confidence and can be:

- confirmed,
- edited,
- rejected.

Nothing is persisted automatically from import without review.

### 5) History

History gives a month view with confirmed period days, estimated upcoming window, and selected-day detail. It also shows recent cycle summaries (length, progress, period length if available).

### 6) Settings

Users can:

- toggle reminder preference,
- export local data as JSON or CSV,
- reset all local data,
- and see current limitations around platform integrations.

## What users get in V1

- local-first data model (stored in browser storage),
- fast capture path (tap, note, parse-and-review),
- lightweight insights for cycle timing and symptom patterns,
- import review before commit.

## Product assumptions

- This is a prototype focused on product fit, not clinical or medical diagnostics.
- Users benefit from immediate feedback loops more than perfect prediction math.
- Predictive timing is advisory and improves as more cycle starts are logged or imported.
- Privacy is local-first in this version; cross-device sync is a planned step, not default behavior.

## Design intent

- Keep the user in control: especially on parse/import actions and data deletion.
- Keep actions reversible where possible through clear intermediate review flows.
- Make uncertainty visible: estimated windows are labeled and confidence is surfaced when possible.

## How to read this for execution

Treat this README as the “product truth” for the prototype: the app should optimize onboarding speed, one-hand logging, and trust through transparency. Technical details and test scripts exist in the repo for implementation, but this document defines the expected user-facing behavior.
