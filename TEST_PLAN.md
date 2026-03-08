# Period App Test Plan

## Purpose
This document defines the minimum useful automated test coverage for the current app so future autonomous work can move quickly without breaking core user journeys.

## Recommended test layers
- `Unit`: pure functions in `lib/*`
- `State/integration`: reducer-like and provider-side state transitions in `components/app-provider.tsx` and `lib/storage.ts`
- `Component`: rendering and interaction for isolated UI units with mocked providers
- `E2E`: critical mobile browser journeys with Playwright

## Recommended tooling
- `Vitest` for unit and integration tests
- `@testing-library/react` for component tests
- `@testing-library/user-event` for interaction tests
- `jsdom` for DOM/browser APIs in unit tests
- existing `Playwright` setup for mobile end-to-end coverage

## Priority order
1. Pure date/cycle/parser tests
2. Storage/state mutation tests
3. Ask/import/export tests
4. Component interaction tests
5. Additional Playwright journeys beyond the existing happy path

## Unit tests by module

### `lib/date.ts`
Create tests for:
- `toDateString`
  - converts `Date` to `YYYY-MM-DD`
  - truncates ISO string input to date
- `today`
  - returns stable date string when system time is mocked
- `parseDate`
  - parses date strings at midday to avoid timezone rollover
- `diffInDays`
  - returns `0` for same day
  - returns positive value for future date
  - returns negative value for past date
- `addDays`
  - handles month boundaries
  - handles year boundaries
  - handles negative offsets
- `startOfMonth`
  - returns first day of month
- `formatLongDate`
  - returns human-readable string for a known date
- `formatShortDate`
  - returns month/day string for a known date
- `monthLabel`
  - returns month plus year
- `isSameDay`
  - true for equal dates
  - true for equal ISO timestamps on same day
  - false for different days
- `getMonthGrid`
  - returns exactly 42 cells
  - begins on Sunday-aligned grid start
  - includes target month in returned metadata
- `relativeDayLabel`
  - today
  - tomorrow
  - yesterday
  - future plural days
  - past plural days

### `lib/cycle.ts`
Create tests for:
- `getSortedPeriodStarts`
  - filters only start events
  - sorts ascending by event date
- `getSortedPeriodEnds`
  - filters only end events
  - sorts ascending by event date
- `getCycleSummaries`
  - computes cycle lengths from consecutive starts
  - attaches matching end date before next start
  - leaves current cycle length undefined if next start missing
  - computes period length inclusive of start and end dates
- `getAverageCycleLength`
  - returns fallback when no closed cycles exist
  - rounds average of multiple cycles
- `getVariability`
  - returns `Building baseline` with less than 2 cycle lengths
  - returns `Fairly steady` for small spread
  - returns `Some variation` for medium spread
  - returns `Wide variation` for large spread
- `isPeriodActive`
  - false with no starts
  - true when last start has no later end
  - false when last end is on or after last start
- `getPhaseLabel`
  - menstrual when active period
  - pending when no cycle day
  - follicular for early cycle
  - ovulation window for mid cycle
  - luteal for late cycle
- `getMoonPhase`
  - active period maps to `new-moon`
  - missing cycle day returns default moon state
  - normalized progress maps across all 8 phases
  - wraps cycle day beyond cycle length
- `getNextPeriodWindow`
  - undefined with no current cycle start
  - uses average cycle length and variability window
  - respects profile fallback average cycle length
- `getConfidenceState`
  - `estimated` with no starts
  - `inferred` with one or two starts
  - `confirmed` with three or more starts
- `getTodayState`
  - builds coherent state from profile-only baseline
  - uses real period events when available
  - includes cycle day, phase label, confidence state, next window, moon phase
- `getPeriodRangeDates`
  - emits confirmed days across inclusive period range
  - uses default length fallback when no end date exists
- `getDailyLogForDate`
  - returns matching log
  - returns undefined when absent
- `getRecentSymptoms`
  - counts recent symptom frequency
  - returns top 3 in descending frequency

### `lib/parser.ts`
Create tests for:
- symptom extraction
  - detects each supported symptom keyword and synonym
  - deduplicates repeated symptom mentions
- medication extraction
  - detects supported medications case-insensitively
  - deduplicates repeated medication names if repeated in input
- flow inference
  - heavy
  - medium
  - light
  - spotting
- mood inference
  - irritable
  - low
  - good
- energy inference
  - low
  - high
- pain inference
  - severe -> 4
  - painful/bad cramps -> 3
  - cramps -> 2
- period event detection
  - detects start phrases
  - detects end phrases
  - does not create event for unrelated text
- confidence logic
  - increases with more signals
  - capped at max expected score
  - produces low/medium/high buckets correctly
- clarification question
  - shown for weak note with no structured signals
  - omitted when structured signals are present

### `lib/import-parser.ts`
Create tests for:
- date extraction
  - ISO date format
  - US date format
  - parseable natural language date line
  - invalid date returns undefined
- line classification
  - start phrase -> `start`
  - end phrase -> `end`
  - spotting/bleeding/period mention -> `uncertain`
  - unrelated line -> null
- `buildImportSession`
  - ignores blank lines
  - ignores lines without parseable dates
  - ignores lines without recognizable classification
  - preserves raw source type and name
  - creates pending review session
  - creates candidates in input order

### `lib/ask.ts`
Create tests for:
- `answerQuestion`
  - start timing prompt routes to timing answer
  - cramps prompt routes to trend answer
  - summary prompt routes to month summary answer
  - low energy prompt routes to pre-period answer
  - fallback answer for unsupported prompt
- timing answer behavior
  - asks for data when no start exists
  - includes average cycle length and next window when data exists
- cramps trend behavior
  - insufficient-data response when no cramp logs exist
  - more often / less often / about as often branches
- summary behavior
  - insufficient-data response when no daily logs exist
  - includes phase label and top symptom when logs exist
- low-energy behavior
  - requires at least two cycles
  - returns positive match
  - returns negative match

### `lib/insights.ts`
Create tests for:
- fresh start card when no cycles exist
- next window card when cycle predictions exist
- body uses recent symptoms when available
- body falls back to average cycle length when no symptoms exist
- confidence-building card when cycles exist but no next window

### `lib/storage.ts`
Create tests for:
- `defaultState`
  - contains expected empty structure
- `clearState`
  - removes local storage key in browser env
  - no-op on server env
- `readState`
  - returns default state on server env
  - returns default state when missing key
  - returns parsed state when valid JSON exists
  - returns default state on invalid JSON
- `writeState`
  - writes serialized state to local storage
  - no-op on server env
- `createPeriodEvent`
  - creates ids and timestamps
  - preserves event type, date, source, confidence
- `createDailyLog`
  - defaults log date to today
  - maps symptom keys into structured symptom entries
  - preserves medications and note text
- `createProfile`
  - trims name and email
  - defaults timezone
  - defaults reminders and telegram flags
- `addParsedLogToState`
  - appends daily log
  - appends period event when parser detected one
  - leaves period events alone when parser did not detect one
- `addAskExchange`
  - appends user message then assistant message
  - preserves citations from answer
- `saveImportSession`
  - prepends latest import session

### `lib/export.ts`
Create tests for:
- `exportJson`
  - creates blob URL
  - creates anchor with expected filename and MIME type
  - revokes URL after click
- `exportCsv`
  - includes header row
  - serializes period events correctly
  - serializes daily logs correctly
  - escapes note text quotes correctly
  - serializes symptom and medication lists with pipe separator

### `lib/state-sync.ts`
Create tests with mocked Supabase client for:
- `loadStateFromSupabase`
  - returns null when auth fails
  - returns null when no row exists
  - normalizes partial remote state
- `saveStateToSupabase`
  - throws when not signed in
  - upserts with expected payload
  - persists local copy via `writeState`
- `clearRemoteState`
  - no-ops when not signed in
  - deletes state row when signed in

## State and integration tests

### `components/app-provider.tsx`
Test with mocked auth and mocked storage/state-sync modules.

Create tests for:
- hydration lifecycle
  - unauthenticated user gets `defaultState` and hydrated true
  - authenticated user loads remote state when available
  - authenticated user falls back to local state when remote load fails
- `completeOnboarding`
  - marks onboarding complete
  - creates profile from input
  - creates confirmed start event when `lastKnownPeriodStart` provided
- `updateProfile`
  - merges patch into existing profile
- `startPeriod`
  - appends confirmed start event
  - creates or merges daily log for same day
  - preserves extras like symptoms and flow
- `endPeriod`
  - appends confirmed end event
  - creates or merges daily log for same day
- `addQuickSymptom`
  - creates new log when day has no log
  - merges into existing log without duplicate symptom keys
- `saveParsedLog`
  - delegates parsed log into state correctly
- `saveManualNote`
  - appends note to same-day log when one exists
- `addImportSession`
  - prepends session to import session list
- `finalizeImportReview`
  - creates period events for accepted start/end candidates
  - excludes rejected and uncertain candidates
  - marks edited candidates as inferred
  - links saved event IDs back to import candidates
  - marks session completed
- `askQuestion`
  - appends user and assistant ask messages
- `clearAllData`
  - resets state
  - clears local storage
  - attempts remote clear
- autosave effect
  - debounces state write
  - writes local state after mutation
  - attempts remote save
  - tolerates remote save failure

## Component tests

### `components/moon-phase.tsx`
- renders correct accessible label
- applies phase-specific class
- applies confidence-specific class
- renders compact/hero/ambient size variants

### `components/moon-hero.tsx`
- renders moon phase from `TodayState`
- shows confidence tag
- shows cycle day or empty-state copy
- shows next window or onboarding guidance

### `components/calendar.tsx`
Create tests for:
- 42-cell month grid rendering
- confirmed days styling
- predicted days styling
- selected day styling
- daily log indicator dot
- day selection callback

### `components/ui.tsx`
For each exported primitive, create smoke tests for:
- className composition
- button variants
- toggle checked state and callback
- input and textarea change handling
- chip/button click handling
- glass card custom class rendering

### `components/app-shell.tsx`
- redirects to onboarding when profile not complete if applicable
- renders page title/subtitle
- renders bottom nav
- highlights current route in nav

### `components/auth-provider.tsx`
- exposes ready state
- handles signed-in and signed-out transitions
- surfaces user session info

## Route-level integration tests

### `app/onboarding/page.tsx`
- submits minimal form successfully
- optional toggles persist into created profile
- `importAfter` routes to `/import`
- standard onboarding routes to `/`

### `app/page.tsx`
- quick symptom chips save feedback tag
- freeform text parses into review sheet
- parsed review sheet shows structured tags
- save log clears draft and closes sheet
- start/end period buttons reflect active state styling
- latest logs render when history exists
- empty state renders when no logs exist

### `app/ask/page.tsx`
- suggested prompt click adds Q&A pair
- freeform question submits on button click
- blank draft does not submit
- empty state vs message list rendering
- citations render for assistant answers

### `app/import/page.tsx`
- pasted text creates import session and routes to review
- blank import does nothing
- file upload reads contents and updates filename
- latest session card opens existing review
- empty state renders with no sessions

### `app/review-import/page.tsx`
- missing session shows empty state and navigation action
- confirm/reject/edit changes accepted count
- editing type updates review state to edited
- editing date updates review state to edited
- save accepted events finalizes session and routes to history

### `app/history/page.tsx`
- previous/next month controls update current month
- selected date panel shows confirmed/predicted/default tag
- selected date moon phase updates with selected date
- selected log renders when present
- empty state renders when no log exists for selected day
- recent cycle list renders summaries and pending labels

### `app/settings/page.tsx`
- reminders toggle updates profile
- export buttons call correct export helpers
- delete all data respects confirm dialog
- sign out button calls auth sign-out
- telegram state displays linked vs pending copy

## End-to-end Playwright coverage

### Keep existing happy path
Preserve and maintain `tests/mobile-journeys.spec.ts` as the primary smoke path.

### Add these Playwright specs next

#### `tests/onboarding.spec.ts`
- first run lands on onboarding
- continue with baseline data routes home
- import-after toggle routes to import instead of home

#### `tests/home-logging.spec.ts`
- start period changes hero state
- end period changes hero state
- quick symptom chips show save feedback
- parsed log save shows structured entry in recent logs
- bottom nav links work from home

#### `tests/ask.spec.ts`
- suggested prompts generate answers
- custom prompt generates fallback answer
- citations appear when expected

#### `tests/import-review.spec.ts`
- paste import text
- review page displays all detected candidates
- reject one candidate
- edit one candidate date/type
- save accepted events
- history reflects imported data

#### `tests/history.spec.ts`
- calendar renders confirmed and predicted days
- selected day changes detail card
- recent cycle cards persist across reload

#### `tests/settings.spec.ts`
- reminders toggle persists across reload
- export buttons trigger download event
- delete-all confirmation cancel keeps data
- delete-all confirmation accept resets to onboarding

#### `tests/auth-sync.spec.ts`
- signed-out user cannot access synced state
- signed-in user sees hydrated saved state
- local changes persist after reload

## Edge-case and regression checklist
- duplicate same-day `start` events
- duplicate same-day symptom chips
- `end` before `start`
- imported `uncertain` candidate accidentally saved
- malformed local storage payload
- stale remote state missing new keys
- timezone-sensitive date rollover near midnight
- empty note plus parse action
- CSV export with commas, quotes, and multiline note text
- ask prompts with no data, minimal data, and rich data
- current cycle with no end date yet
- onboarding without email
- onboarding without last start date

## Suggested fixtures
Create reusable fixtures for:
- `emptyState`
- `profileOnlyState`
- `singleCycleState`
- `multiCycleSteadyState`
- `multiCycleVariableState`
- `activePeriodState`
- `stateWithLogs`
- `stateWithImports`
- `stateWithAskMessages`

## Suggested file layout for future implementation
- `tests/unit/date.test.ts`
- `tests/unit/cycle.test.ts`
- `tests/unit/parser.test.ts`
- `tests/unit/import-parser.test.ts`
- `tests/unit/ask.test.ts`
- `tests/unit/storage.test.ts`
- `tests/unit/export.test.ts`
- `tests/unit/insights.test.ts`
- `tests/unit/state-sync.test.ts`
- `tests/integration/app-provider.test.tsx`
- `tests/components/moon-phase.test.tsx`
- `tests/components/moon-hero.test.tsx`
- `tests/components/calendar.test.tsx`
- `tests/routes/onboarding.test.tsx`
- `tests/routes/home.test.tsx`
- `tests/routes/ask.test.tsx`
- `tests/routes/import.test.tsx`
- `tests/routes/review-import.test.tsx`
- `tests/routes/history.test.tsx`
- `tests/routes/settings.test.tsx`
- `tests/e2e/*.spec.ts`

## Definition of done for testing foundation
- every pure function in `lib/*` has direct unit coverage
- all state-changing actions in `AppProvider` have integration coverage
- every route has at least one rendering and one interaction test
- Playwright covers first-run, logging, import/review, history, settings, and destructive actions
- tests are deterministic with mocked time and stable fixtures
- CI can run unit/integration separately from Playwright

## Notes for future autonomous agents
- prioritize pure utility coverage before UI tests
- mock time in all date-sensitive suites
- do not rely on real local storage, real Supabase, or real downloads in unit tests
- prefer fixture factories over hand-built inline state objects once the suite grows
- preserve the existing mobile-first assumptions in browser tests
