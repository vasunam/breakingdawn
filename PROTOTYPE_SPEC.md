# Period App Functional Prototype Spec

## 1. Purpose

This document translates the product direction into a build-ready spec for engineers and designers.

The goal is to deliver an end-to-end, mobile-compatible functional prototype that:

- feels premium, calm, private, and intelligent
- is fast enough to use primarily from a phone
- uses AI to reduce input friction and summarize personal patterns
- uses Telegram as a lightweight reminder and confirmation surface
- avoids the common failure modes of period-tracking apps

This is a prototype spec, not a production-hardening document. Build for real user value first, then optimize infra and edge-case coverage.

## 2. Product Thesis

Most period trackers fail because they ask too much of the user, too often. The core problem is not analysis. It is data capture friction.

This product should win by doing three things well:

1. Lower the effort required to log period-related events.
2. Stay useful even when user data is incomplete.
3. Return immediate, grounded value after each interaction.

AI should help the system understand messy input and explain patterns. It should not replace deterministic cycle math or overstate medical certainty.

## 3. Experience Principles

### Product principles

- Capture-first: if logging is hard, everything else fails.
- Trust-first: distinguish between confirmed, inferred, and estimated data.
- Minimal-first: fewer actions, fewer fields, less cognitive load.
- Mobile-first: every primary task must work comfortably one-handed.
- Calm-first: the interface should feel emotionally grounding, not busy or gamified.

### Design principles

- The app should feel like standing on the moon and looking into space.
- Visual richness should come from layering, glow, blur, and atmosphere, not ornament.
- The UI should stay clear and restrained even with effects removed.
- The home screen should feel distinctive and emotionally central.
- Data should be illuminated, not dumped into dense dashboards.

## 4. Core Jobs To Be Done

- Help me remember to log when my period is likely starting.
- Let me confirm or correct a period event in seconds.
- Show me where I am in my cycle right now.
- Backfill my historical cycle data from Telegram chat history.
- Show me whether my cycles are becoming more or less regular.
- Give me phase-aware guidance without pretending certainty.
- Let me ask questions about my own data in plain English.

## 5. Critical Failure Modes To Avoid

- Asking for too much information during setup.
- Making logging feel like a form instead of a quick action.
- Over-relying on perfect daily adherence.
- Showing confident predictions when the data is weak.
- Sending too many reminders and getting muted.
- Making Telegram the primary system of record.
- Providing generic AI content that is not grounded in the user’s history.
- Using glass/blur effects that hurt readability on mobile.

Every feature in this spec should be judged against these failure modes.

## 6. Scope

### In scope for the functional prototype

- mobile-first web app with responsive desktop fallback
- installable PWA behavior
- basic account creation and sign-in
- onboarding
- Telegram export import for history bootstrap
- review flow for imported candidate period events
- home screen with current cycle state
- quick start/end period logging
- quick symptom and note logging
- cycle calendar/history
- phase/status card
- AI-assisted natural-language logging
- AI-powered summaries and personal-data Q&A
- Telegram reminder and confirmation loop for likely period start
- settings for export, delete, notification preferences, Telegram linking

### Out of scope for the prototype

- pregnancy mode
- partner features
- wearable sync
- Apple Health / Google Fit sync
- full clinical reporting
- advanced fertility planning
- large symptom taxonomies
- generalized health chatbot
- complex chart dashboards

## 7. Target Platforms

- Primary: mobile web in Safari and Chrome
- Secondary: desktop web
- Messaging channel: Telegram bot for reminders and simple confirmation

The app must be fully usable without Telegram. Telegram improves retention and capture but is not required to view or edit data.

## 8. User Types

### Primary user

- privacy-conscious
- phone-first
- wants low-friction capture
- does not want feature bloat
- is open to AI help if it feels useful and grounded

### Prototype assumption

Design for a single-user personal product first. The architecture can support multiple users, but no shared or collaborative workflows are required.

## 9. Product Behavior Model

### System of record

The web app database is the only source of truth.

Telegram can:

- provide imported history
- receive reminders
- collect one-tap confirmations

Telegram cannot be treated as canonical historical data after import. Imported and reminder-triggered data must land in the app database and remain editable there.

### Confidence labels

Every event or calculation shown to the user should be classified as one of:

- `confirmed`: explicitly created or approved by the user
- `inferred`: derived from imported text and accepted by the user after review
- `estimated`: generated by system logic from prior confirmed/inferred data

This distinction should appear in the data model and the UI where relevant.

## 10. Primary User Flows

### Flow A: First-time onboarding

Goal:

- get the user to value in under 2 minutes

Steps:

1. User opens the app on mobile.
2. User signs in.
3. User sees a short onboarding:
   - last known period start date, optional
   - average cycle length, optional
   - whether to import Telegram history now
   - whether to connect Telegram reminders
4. User lands on Home.

Rules:

- no long questionnaire
- all fields except auth are skippable
- user can defer import and Telegram linking

### Flow B: Telegram history import

Goal:

- solve the cold-start problem without pretending perfect extraction

Input:

- Telegram export file or copy-pasted chat text for the prototype

System behavior:

1. User uploads export or pastes text.
2. System parses messages and identifies candidate period-related events.
3. System groups candidates into likely period starts, ends, or uncertain mentions.
4. User enters a review screen.
5. Each candidate event shows:
   - detected date
   - message snippet
   - confidence
   - suggested interpretation
6. User can:
   - confirm
   - edit date/type
   - reject
7. Confirmed events are saved as historical period data.
8. Calendar and cycle calculations update immediately.

Important constraints:

- do not auto-save imported events without review
- optimize for detecting likely period start first
- preserve original source snippet for audit/debug

### Flow C: Home screen daily use

Goal:

- make the product useful in under 10 seconds

Home must answer:

- where am I in my cycle right now
- what matters today
- what can I log instantly

Home content:

- lunar hero with current cycle state
- current phase label
- current cycle day
- next likely period window
- quick actions
- quick text log input
- one insight or reminder card

Primary actions on Home:

- `Start Period`
- `End Period`
- `Log Symptoms`
- `Add Note`
- `Ask AI`

### Flow D: One-tap start period

1. User taps `Start Period`.
2. Default start date is today.
3. User optionally adds flow level and symptoms.
4. Save returns to Home with updated state.

Target:

- common path should take under 5 seconds

### Flow E: End period

1. User taps `End Period`.
2. Default end date is today.
3. Optional quick chips: heavy, painful, fatigue, manageable.
4. Save updates cycle metrics.

### Flow F: Natural-language logging

1. User types or pastes a short message such as:
   - `spotting today`
   - `cramps, tired, took ibuprofen`
   - `mood low, not sleeping well`
2. System calls LLM parser.
3. System returns structured interpretation with confidence.
4. User confirms or edits.
5. Save persists structured entries and original free text.

Rules:

- parser output must always be reviewable before save
- follow-up questions should be limited to one at a time
- if confidence is high and the parse is simple, the confirmation UI should be compact

### Flow G: Telegram reminder and confirmation

Goal:

- prevent missed logging at likely period start

Trigger logic:

- system estimates next likely start window from prior cycles
- if user has Telegram reminders enabled, send a discreet message near the predicted start date

Message style:

- should sound tentative and calm
- should not claim certainty

Example:

- `You usually start around now. Want to log day 1 today?`

Actions:

- `Start today`
- `Started yesterday`
- `Not yet`
- `Open app`

Behavior:

- `Start today` creates a confirmed period start for today
- `Started yesterday` creates a confirmed period start for yesterday
- `Not yet` suppresses reminders briefly and updates estimation logic
- `Open app` deep-links to Home

Constraints:

- max 1 initial reminder per predicted cycle by default
- max 1 follow-up if no response
- user must be able to turn this off
- lock-screen preview copy should stay discreet

### Flow H: Calendar / cycle history

Goal:

- provide a simple, trustworthy visual history

Calendar should show:

- confirmed period days
- predicted upcoming period window
- estimated fertile window
- logged symptoms or notes markers
- status distinction between confirmed and estimated days

The calendar must remain readable on mobile and avoid dense charting.

### Flow I: Phase and weekly guidance

Goal:

- contextualize the current week without sounding prescriptive

The app should show:

- likely current phase
- common experiences people report in this phase
- what this user personally tends to log in this phase, if enough data exists
- confidence level

The app should not say:

- what the user is definitely supposed to feel
- medical conclusions
- exact ovulation certainty from sparse data

### Flow J: Ask AI

Goal:

- make personal pattern analysis accessible without charts

Prompt examples:

- `When do I usually start my period?`
- `Have my cramps been worse recently?`
- `What changed this cycle?`
- `Did I usually feel low energy before my last two periods?`

Response requirements:

- direct answer first
- short supporting evidence
- mention confidence or uncertainty
- grounded in user data, not generic web content

### Flow K: Export and delete

Settings must allow:

- JSON export
- CSV export
- account deletion
- all-data deletion

These should be visible and easy to access. They are part of the trust promise.

## 11. Information Architecture

- `/` Home
- `/onboarding`
- `/import` Telegram import
- `/review-import` review parsed candidates
- `/calendar`
- `/history`
- `/ask`
- `/settings`
- `/settings/reminders`
- `/settings/privacy`

For the prototype, `/calendar` and `/history` can be combined if that reduces scope.

## 12. Screen Requirements

### Home

Must include:

- atmospheric lunar hero
- current cycle day
- likely phase
- next period window
- primary action button
- quick chips for common symptoms
- text log input
- insight card

States:

- no data yet
- active period
- mid-cycle
- predicted start window
- imported data pending review

### Import

Must include:

- upload/paste input
- explanation that import is approximate
- progress state
- parse results summary
- CTA into review flow

### Review Import

Must include:

- candidate cards
- confidence indicator
- source snippet
- confirm/edit/reject actions
- running summary of accepted events

### Calendar / History

Must include:

- month view
- period day markers
- predicted window
- symptom indicators
- tap for day details

### Ask

Must include:

- suggested prompts
- chat-style answer list
- cited supporting entries or date ranges
- empty state when not enough history exists

### Settings

Must include:

- Telegram connection state
- reminder preferences
- export
- delete
- privacy explanation

## 13. Design System Specification

### Visual identity

The product should merge:

- Apple-like translucent layering
- a moonlit spatial atmosphere
- editorial clarity and restraint similar to Perplexity

The mood is premium, quiet, intelligent, and slightly futuristic.

### Color tokens

Engineers should implement color tokens rather than hard-coded values.

Suggested starting tokens:

- `bg.canvas = #090B10`
- `bg.elevated = #10141C`
- `bg.glass = rgba(255, 255, 255, 0.08)`
- `bg.glass-strong = rgba(255, 255, 255, 0.12)`
- `line.subtle = rgba(255, 255, 255, 0.10)`
- `line.default = rgba(255, 255, 255, 0.16)`
- `text.primary = #F5F7FB`
- `text.secondary = rgba(245, 247, 251, 0.72)`
- `text.tertiary = rgba(245, 247, 251, 0.48)`
- `accent.moon = #DCE4F2`
- `accent.silver = #B7C1CF`
- `accent.blue = #8EA5C7`
- `accent.blush = #CBB9C4`
- `state.success = #9EC7B8`
- `state.warning = #D6C197`
- `state.error = #C89494`

Accent color usage must stay restrained.

### Typography tokens

Use one refined sans-serif family across the app.

Suggested type scale:

- `display = 32/36 semibold`
- `title-1 = 24/30 semibold`
- `title-2 = 20/26 semibold`
- `body = 16/24 regular`
- `body-strong = 16/24 medium`
- `caption = 13/18 medium`
- `micro = 11/16 medium`

Typography rules:

- large, calm hierarchy
- generous spacing
- avoid decorative type
- use strong contrast for key numbers and dates

### Spacing tokens

- `space-1 = 4`
- `space-2 = 8`
- `space-3 = 12`
- `space-4 = 16`
- `space-5 = 20`
- `space-6 = 24`
- `space-8 = 32`
- `space-10 = 40`

### Radius tokens

- `radius.sm = 12`
- `radius.md = 18`
- `radius.lg = 24`
- `radius.xl = 32`
- `radius.pill = 999`

### Surface rules

Glass surface recipe:

- translucent dark base
- subtle backdrop blur
- soft 1px border
- faint top highlight
- restrained inner glow if needed

Do not:

- stack too many overlapping transparent surfaces
- reduce readability with blur-heavy backgrounds
- use strong neon glows

### Shadow and glow rules

- shadows should feel diffused, not hard
- glows should support emphasis, not compete with text
- use brighter glow only in the hero area or selected states

### Motion rules

- duration fast: 140ms
- duration standard: 220ms
- duration slow: 320ms
- easing should be soft and non-bouncy

Use motion for:

- screen entrance
- bottom sheet reveal
- chip selection
- state transitions in the hero

Do not animate everything.

### Component primitives

Build these reusable components first:

- `Button`
- `IconButton`
- `GlassCard`
- `InputField`
- `TextArea`
- `Chip`
- `Tag`
- `BottomSheet`
- `Modal`
- `Toggle`
- `SegmentedControl`
- `CalendarCell`
- `ListRow`
- `NavBar`
- `EmptyState`
- `LoadingState`
- `ErrorState`

## 14. Functional Requirements

### Authentication

- email magic link is sufficient for prototype
- user session should persist across mobile visits
- auth UI should be minimal and calm

### Cycle tracking

- create period start
- create period end
- edit or delete any period event
- compute cycle lengths from confirmed/inferred starts
- show average length and variability

### Phase estimation

The system may estimate:

- menstrual phase
- follicular phase
- estimated ovulation window
- luteal phase

Rules:

- clearly label as estimated
- use deterministic cycle logic based on historical data
- show lower confidence when user history is sparse or inconsistent

### Symptom logging

For prototype, support a constrained set:

- bleeding / spotting
- cramps
- headache
- bloating
- fatigue
- low energy
- mood low
- irritability
- high energy
- medication
- freeform note

This set is intentionally small.

### AI logging parser

Input:

- short free-text user note

Output:

- structured fields
- confidence score
- optional single clarification question

Persist:

- original text
- parsed output
- final user-approved values

### AI insights and Q&A

Must support:

- cycle summary
- pattern comparison
- symptom recurrence analysis
- simple natural-language questions over user data

Must not:

- use ungrounded generic advice as the main answer
- diagnose
- imply certainty without supporting data

### Telegram integration

Prototype requirements:

- connect Telegram account
- send likely-period reminders
- receive button-based confirmations
- update app data from those confirmations

Telegram import and Telegram reminders may share infra, but they are separate user flows.

### Exports

- CSV should include periods and daily logs
- JSON should include raw entities and metadata

## 15. Data Model

Prototype-level relational model:

### `users`

- `id`
- `email`
- `created_at`
- `telegram_chat_id` nullable
- `timezone`
- `settings_json`

### `period_events`

- `id`
- `user_id`
- `event_type` start | end
- `event_date`
- `source` manual | import | telegram_reminder | ai_parse
- `confidence_state` confirmed | inferred | estimated
- `source_snippet` nullable
- `created_at`
- `updated_at`

### `daily_logs`

- `id`
- `user_id`
- `log_date`
- `flow_level` nullable
- `mood` nullable
- `energy` nullable
- `pain_level` nullable
- `note_text` nullable
- `source`
- `created_at`
- `updated_at`

### `symptom_entries`

- `id`
- `daily_log_id`
- `symptom_key`
- `intensity` nullable

### `medication_entries`

- `id`
- `daily_log_id`
- `name`
- `dose_text` nullable

### `import_sessions`

- `id`
- `user_id`
- `status`
- `raw_source_type`
- `raw_source_ref`
- `created_at`

### `import_candidates`

- `id`
- `import_session_id`
- `message_date`
- `message_text`
- `suggested_type`
- `confidence_score`
- `review_state` pending | accepted | rejected | edited
- `linked_period_event_id` nullable

### `telegram_events`

- `id`
- `user_id`
- `message_type`
- `payload_json`
- `received_at`

### `ai_runs`

- `id`
- `user_id`
- `run_type` parse | summary | qa
- `input_text`
- `output_json`
- `created_at`

## 16. System Architecture

### Recommended stack

- Next.js App Router
- TypeScript
- Postgres
- Prisma or equivalent ORM
- Tailwind or token-driven CSS variables
- server actions or API routes
- background jobs for Telegram events, import parsing, and reminders

### Services

- auth service
- cycle calculation service
- import parsing service
- AI parsing service
- AI Q&A service
- Telegram bot service
- reminder scheduler

### Deterministic logic vs LLM logic

Deterministic:

- cycle calculations
- regularity/variability calculations
- next-period estimation
- phase estimation
- reminder timing

LLM:

- import candidate extraction from messy language
- natural-language logging parse
- summaries
- Q&A response composition

Do not let LLMs own the calendar model or reminder trigger logic.

## 17. AI Product Rules

- answers must be grounded in user data
- sparse data must produce explicit uncertainty
- generic educational context, if used, must be secondary to personal data
- the assistant must not diagnose or recommend treatment
- every AI result shown in UI should be editable or challengeable where relevant

Example good answer:

- `Your last four cycles ranged from 28 to 33 days, which is more variable than the previous four.`

Example bad answer:

- `You may have a hormonal imbalance.`

## 18. Notification and Reminder Logic

Prototype reminder logic:

1. calculate average cycle length from recent confirmed/inferred cycles
2. define predicted start window
3. send first reminder on the first day of the predicted window
4. if no response, optionally send one follow-up the next day
5. stop reminders after a confirmation or explicit `Not yet`

Backoff behavior:

- if user ignores multiple cycles, reduce reminder frequency
- if cycle variability is high, messaging should become more tentative

Copy guidelines:

- discreet
- calm
- tentative
- action-oriented

## 19. Loading, Empty, and Error States

Every major screen must have designed states.

### Loading

- skeleton hero on Home
- animated glass placeholders for cards
- progress state during import parse

### Empty

- no history yet
- no import results
- no AI answer due to insufficient data
- no reminders linked

### Error

- import failed
- Telegram not linked
- AI parse unavailable
- data save failed

Error language should stay plain and calm.

## 20. Accessibility Requirements

- maintain contrast despite blur/translucency
- minimum comfortable tap targets on mobile
- support reduced motion
- preserve usability with effects reduced or disabled
- do not use color alone to differentiate confirmed vs estimated data

## 21. Prototype Acceptance Criteria

The prototype is complete when:

- a user can sign in on mobile
- a user can import Telegram history and review candidate events
- a user can confirm at least one imported event and see it on the calendar
- a user can log a period start from Home in under 5 seconds
- a user can log a free-text symptom note and save a parsed result
- the Home screen shows current cycle state and next likely period window
- the app can send a Telegram reminder and process a one-tap confirmation
- the calendar distinguishes confirmed and estimated information
- the Ask screen can answer at least basic questions from personal history
- export and delete work from Settings

## 22. Recommended Delivery Order

### Phase 1: Core foundation

- auth
- design tokens
- layout shell
- database schema
- Home skeleton

### Phase 2: Tracking fundamentals

- period CRUD
- calendar/history
- deterministic cycle service
- symptom/note logging

### Phase 3: Bootstrap and retention

- Telegram import
- import review flow
- Telegram reminders and button confirmations

### Phase 4: AI layer

- free-text logging parser
- summary generation
- Ask AI

### Phase 5: Trust and polish

- exports
- delete flows
- empty/loading/error states
- installability polish

## 23. Open Product Decisions For Post-Prototype

- whether ongoing Telegram free-text logging is worth supporting
- whether phase guidance should include more educational content
- whether reminders should expand to push or email
- whether medication and sexual activity remain in core logging
- whether the app should support local encryption or stronger privacy controls

## 24. Final Direction

Build a mobile-first PWA with a lunar, glass-like visual system and a capture-first product model.

The prototype should feel premium and emotionally calming, but its real differentiation is not aesthetics alone. It is the combination of:

- low-friction logging
- Telegram-based reminder capture
- AI-assisted parsing and summaries
- honest confidence labeling
- clear cycle status at a glance

If there is a tradeoff between visual flourish and logging speed, choose logging speed.
