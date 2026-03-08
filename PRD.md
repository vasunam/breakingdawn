# Period App PRD

## 1. Product Summary

Build a privacy-first, self-deployed, mobile-first period tracking web app that feels as fast as a native app, stays intentionally minimal, and uses AI where it creates real leverage:

- fast logging from a phone
- natural-language input instead of dense forms
- useful summaries and pattern detection
- gentle guidance without pretending to be a doctor

The app should be deployable quickly on Vercel and usable primarily from a home-screen icon on iPhone or Android. Desktop is secondary.

## 2. Product Principles

- Minimal over comprehensive: only ship features that make tracking easier or more useful.
- Privacy-first: collect the least amount of data possible and make export/delete obvious.
- AI-first, not AI-everywhere: use LLMs for input parsing, summarization, and Q&A, not for basic deterministic tracking.
- Mobile-native feel: one-thumb flows, large tap targets, no spreadsheet-like screens.
- Default to speed: logging should take under 10 seconds for common actions.

## 3. Problem Statement

Existing period apps often fail in one or more of these ways:

- they require trust in a third-party company with sensitive data
- they are bloated with fertility, community, commerce, or wellness features
- they make logging tedious
- they feel like desktop software squeezed onto a phone

The goal is to create a tool that is personal infrastructure: private, lightweight, and fast enough to actually use consistently.

## 4. Target User

Primary user:

- privacy-conscious person tracking cycles for personal awareness
- prefers phone-first interactions
- wants quick check-ins rather than detailed manual journaling
- is interested in AI assistance, but not in handing data to a large consumer app

Secondary user needs:

- spotting cycle patterns
- logging symptoms and notes over time
- getting simple predictions and reminders
- optionally chatting from Telegram instead of opening the app

## 5. V1 Product Goal

Deliver a mobile web app that lets a user:

- record period start/end and daily flow
- log symptoms, mood, pain, sex, medication, and freeform notes
- see current cycle state and a compact history
- ask AI questions about their own logged data
- receive lightweight reminders
- export or delete their data at any time

## 6. V1 Non-Goals

Do not include these in V1:

- community or social features
- partner mode
- fertility optimization workflows beyond basic cycle awareness
- pregnancy tracking
- complex charts or dashboards
- wearable integrations
- Apple Health / Google Fit sync
- diagnosis claims or medical treatment recommendations
- fully conversational Telegram-only product

## 7. Product Recommendation

### Recommended V1 shape

Start with a **PWA-style web app** rather than a native mobile app.

Why:

- fastest to ship on Vercel
- easy to use from a phone home-screen icon
- one codebase
- sufficient for logging and summaries
- easier privacy review than juggling native + bot integrations at launch

### Telegram recommendation

Telegram should be an **optional input surface**, not the core product, at least initially.

Why:

- bot auth and identity mapping add complexity
- chat history lives inside Telegram, which may undercut the privacy positioning
- free-text capture is useful, but it should feed into the same canonical data model as the app

Best approach:

- V1: mobile web app only
- V1.5: Telegram bot for quick logging and reminder nudges

## 8. Core User Value

The product should answer three questions well:

1. What is happening in my cycle right now?
2. What changed this month versus previous months?
3. Can I log something quickly in plain language without opening a complicated form?

## 9. Core Entities

- User
- Cycle
- Period entry
- Daily log
- Symptom entry
- Mood entry
- Medication entry
- Sex / intimacy entry
- Note
- Reminder
- AI insight / summary

## 10. Key Workflows

### Workflow A: Start a period in one tap

Goal: make the most common action instant.

Flow:

1. User opens app.
2. Home screen shows a prominent `Start Period` button if no active period exists.
3. Tap creates a new period starting today.
4. User optionally adjusts flow level and adds symptoms.
5. Home updates immediately with `Day 1 of period`.

Success criteria:

- under 5 seconds
- no required form

### Workflow B: End a period

Flow:

1. While a period is active, home screen shows `End Period`.
2. User taps once to end on today.
3. App optionally asks `How was this period?` with 3-4 quick chips like pain, heavy, fatigue, normal.

### Workflow C: Quick daily log

Goal: daily logging should feel like sending a message.

Flow:

1. User opens app.
2. Home screen offers a text box: `Log anything...`
3. User types: `cramps, low energy, took ibuprofen, medium flow`
4. LLM parses the text into structured fields.
5. User sees a confirmation card before save:
   - symptoms: cramps
   - energy: low
   - medication: ibuprofen
   - flow: medium
6. User taps save.

Fallback:

- if parsing confidence is low, app asks a narrow follow-up question

### Workflow D: View cycle status

Flow:

1. User opens home screen.
2. App shows:
   - current cycle day
   - predicted next period window
   - whether a period is active
   - recent symptoms summary
3. User can tap into timeline/history.

### Workflow E: Ask AI about personal patterns

Example prompts:

- `Have my cramps been worse in the last 3 cycles?`
- `When do I usually start my period?`
- `Summarize this month.`
- `Did I log headaches near my last two periods?`

Flow:

1. User asks question in natural language.
2. App retrieves relevant logs and computed cycle data.
3. LLM answers with:
   - direct answer
   - supporting data points
   - uncertainty if data is sparse

Guardrails:

- no diagnosis
- no treatment instructions beyond generic cautionary language
- explicitly state when data is insufficient

### Workflow F: Reminder/check-in

Flow:

1. User enables reminders.
2. App sends a daily or predicted-period reminder.
3. Reminder deep-links into a single quick-log screen.

V1 reminder types:

- likely period soon
- log today’s symptoms
- period seems longer than usual, check if end date is correct

### Workflow G: Export or delete data

Flow:

1. User opens settings.
2. User can export JSON/CSV.
3. User can permanently delete all data.
4. App confirms completion clearly.

This is important to the trust story and should not be hidden.

## 11. Primary User Journeys

### Journey 1: First-time setup

User story:
`As a new user, I want to get value in under two minutes without being asked invasive questions.`

Steps:

1. Open app from phone browser.
2. Sign in with a minimal auth method.
3. See a short onboarding:
   - last period start date
   - typical cycle length if known, optional
   - reminder preference, optional
4. Land on home screen with current cycle estimate.

Design notes:

- do not force long questionnaire
- let user skip anything not essential

### Journey 2: Daily use

User story:
`As a returning user, I want to log what happened today with almost no friction.`

Steps:

1. Tap home-screen icon.
2. Home shows current status and quick actions.
3. User taps a chip like `Cramps` or writes a sentence.
4. Save.
5. App refreshes summary immediately.

### Journey 3: Reflection

User story:
`As a user, I want the app to help me notice patterns without forcing me to analyze charts.`

Steps:

1. User opens monthly summary or asks AI.
2. App returns short insight cards.
3. User can drill into supporting logs if desired.

### Journey 4: Fast capture during the day

User story:
`As a user on the go, I want to log from my phone in seconds, ideally one-handed.`

Steps:

1. Open app.
2. Use quick chips or dictation.
3. Save.

Future variation:

- send a Telegram message to the bot, which turns into the same saved log

## 12. AI-First Features That Actually Matter

These are worth shipping:

- Natural-language logging: turn plain text into structured entries.
- Monthly summaries: `What happened this cycle?`
- Pattern spotting: highlight symptom recurrence or cycle irregularity.
- Data-aware Q&A: answer questions grounded in the user’s own history.
- Smart follow-ups: ask one clarifying question when the input is ambiguous.
- Gentle anomaly detection: `This period is longer than your recent average.`

These should not lead the product:

- generic chatbot conversations
- inspirational coaching
- broad medical advice
- hallucinated explanations not tied to logged data

## 13. Functional Requirements

### V1 must-have

- create account and sign in
- create/edit/delete period entries
- create/edit/delete daily logs
- symptom, mood, pain, medication, flow, note logging
- home screen with current cycle state
- cycle history view
- AI natural-language parsing for logs
- AI Q&A over user data
- reminders
- export data
- delete account/data
- mobile responsive layout
- installable PWA behavior where supported

### V1 should-have

- onboarding with minimal defaults
- confidence handling for AI parsing
- audit trail of AI-generated structured interpretations before save
- simple summary cards for recent cycles

### Later

- Telegram bot capture
- voice note transcription
- clinician-style report export
- optional encrypted note fields
- passkey auth

## 14. UX Requirements

- home screen is the product center, not a menu
- primary actions visible without scrolling
- large tap targets for common symptoms/actions
- text input always accessible from home
- avoid multi-step forms where possible
- timeline/history must be readable on small screens
- visual design should feel calm and private, not gamified

Suggested home screen sections:

- current status
- quick actions
- text log box
- recent activity
- one insight card

## 15. Data and Privacy Requirements

- store the minimum necessary data
- clear privacy language during onboarding
- export available at any time
- hard delete available at any time
- avoid analytics that capture sensitive content
- separate operational logs from user health content
- encrypt sensitive fields at rest if feasible

Important product truth:

Self-deploying on Vercel improves control, but it is not the same as local-only privacy. The app should be honest about where data is stored and who can access the infrastructure.

## 16. Safety and Medical Boundaries

The app is not a medical device. It may:

- summarize patterns
- identify irregularities relative to the user’s own history
- suggest when to seek medical attention using conservative language

It must not:

- claim diagnosis
- claim pregnancy or infertility status
- recommend treatment plans
- present speculative medical conclusions as fact

Example safe language:

- `Your last three cycles were shorter than your usual range. If this is unusual for you or concerning, consider checking with a clinician.`

## 17. Suggested V1 Information Architecture

- `/` Home
- `/history` Cycle history / timeline
- `/ask` AI Q&A
- `/settings` Privacy, reminders, export, delete
- `/onboarding`

## 18. Suggested Technical Approach

### Product stack

- Next.js on Vercel
- Postgres with a simple relational schema
- server actions or API routes for mutations
- PWA support for installability and mobile feel
- LLM provider for:
  - text-to-structured-log parsing
  - summaries
  - Q&A with retrieval over user data

### AI architecture

Use deterministic logic for:

- cycle calculations
- period predictions
- averages and trend detection
- reminder timing

Use LLMs for:

- parsing free text
- generating summaries
- answering questions in plain language

This split is important. The model should not own the core health math.

## 19. V1 Screens

### Screen 1: Home

Contains:

- current cycle status
- `Start Period` / `End Period`
- quick symptom chips
- free-text log input
- one recent summary or insight

### Screen 2: History

Contains:

- past periods
- cycle lengths
- symptom snapshots by cycle

### Screen 3: Ask

Contains:

- suggested prompts
- chat-style interface
- cited source logs or periods used in answer

### Screen 4: Settings

Contains:

- reminders
- export
- delete
- privacy info

## 20. Metrics for Success

V1 success metrics:

- user can complete first setup in under 2 minutes
- period start logging in under 5 seconds
- daily free-text log saved in under 10 seconds
- at least 3 meaningful uses per cycle
- AI answers cite underlying logged data

Qualitative signals:

- user trusts the app more than mainstream alternatives
- user prefers this over notes app / calendar workaround
- user feels logging is easier than existing apps

## 21. Risks

- AI adds friction if confirmation is too heavy
- Telegram may weaken privacy perception
- reminders may require platform-specific work for good mobile behavior
- health-related wording can create liability if too confident
- overbuilding analytics and charts can break the minimal product promise

## 22. Open Questions

- Do you want single-user only for V1, or basic multi-user support from day one?
- Is email sign-in acceptable, or do you want a stronger privacy posture like passkeys later?
- Should reminders be email, web push, Telegram, or all three over time?
- How important is offline logging for V1?
- Do you want sexual activity and medication in V1, or should those wait until V1.1?

## 23. Recommended V1 Cut

If the goal is to ship fast, the narrowest strong V1 is:

- onboarding
- home screen
- start/end period
- quick symptom + note logging
- cycle history
- AI text parsing for logs
- AI monthly summary
- export/delete

Leave out for now:

- Telegram integration
- push notifications if they slow launch
- broad symptom taxonomy
- advanced charts
- anything that requires long setup

## 24. Build Order

### Phase 1: Usable tracker

- auth
- onboarding
- period CRUD
- daily log CRUD
- home screen
- history

### Phase 2: AI usefulness

- natural-language logging
- summary generation
- ask-your-data interface

### Phase 3: Trust and retention

- reminders
- export/delete polish
- installability polish

### Phase 4: Optional extensions

- Telegram bot intake
- voice input
- smarter insights

## 25. Final Recommendation

Build this as a **minimal PWA first**, not a native app and not a Telegram-first bot.

Make the product feel AI-first by centering:

- natural-language logging
- smart summaries
- grounded Q&A over personal data

Keep the rest extremely simple. The trust advantage comes from restraint as much as infrastructure.
