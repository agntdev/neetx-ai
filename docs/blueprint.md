# NEETX AI Tutor — Bot specification

**Archetype:** education

**Voice:** professional and encouraging — write every user-facing message, button label, error, and empty state in this voice.

A Hinglish Telegram tutor for NEET aspirants offering NCERT-aligned lessons, interactive doubt-solving, full NEET-style practice tests, personalized study schedules, and premium content packs. Tracks progress and sends reminders for daily study and revisions.

> This is the complete contract for the bot. Implement EVERY entry point, flow, feature, integration, and edge case below. The completeness review checks the bot against this document after each build pass.

## Primary audience

- NEET UG students

## Success criteria

- 90% onboarding completion rate
- Daily practice engagement from 70% of active users
- 30% conversion rate on premium pack purchases

## Entry points

Every feature must be reachable from the bot's command/button surface (button-first; only /start and /help are slash commands).

- **/start** (command, actor: user, command: /start) — Open onboarding/welcome menu
- **Start Onboarding** (button, actor: user, callback: onboarding:start) — Collect required student profile data
- **Access Lessons** (button, actor: user, callback: lesson:menu) — Browse NCERT-aligned topic units
- **Submit Doubt** (button, actor: user, callback: doubt:submit) — Open doubt submission interface
- **Practice MCQs** (button, actor: user, callback: practice:mcq) — Start NEET-style question practice
- **Take Mock Test** (button, actor: user, callback: mock:start) — Begin full-length NEET simulation
- **Purchase Premium** (button, actor: user, callback: purchase:menu) — Browse premium content packs

## Flows

### Onboarding
_Trigger:_ /start

1. Collect exam date
2. Get baseline score
3. Set study window
4. Subject prioritization

_Data touched:_ student_profile

### Lesson Expansion
_Trigger:_ button_press

1. Show concise summary
2. Expand to deep lesson layers
3. Track progress

_Data touched:_ lesson_module

### Doubt Resolution
_Trigger:_ doubt:submit

1. Receive question
2. Generate step-by-step answer
3. Flag complex cases to admin

_Data touched:_ doubt_thread

### Mock Test
_Trigger:_ mock:start

1. Start timer
2. Sectional navigation
3. Generate score report
4. Send analytics

_Data touched:_ mock_test

## Data entities

Durable data (must survive a restart) uses the toolkit's persistent store, never in-memory maps.

- **student_profile** _(retention: persistent)_ — User's NEET preparation metadata
  - fields: name, exam_date, baseline_score, study_window, priority_subjects
- **doubt_thread** _(retention: persistent)_ — Student questions and resolved answers
  - fields: question_text, step_by_step_answer, flagged_status
- **mock_test** _(retention: persistent)_ — Full-length NEET simulation results
  - fields: timestamp, raw_score, sectional_breakdown

## Integrations

- **Telegram** (required) — Bot API messaging
- **UPI/Indian Wallets** (required) — Premium pack payments
Call external APIs against their real contract (correct endpoints, ids, params); credentials from env. Do not fake responses.

## Owner controls

- View weekly admin reports (new signups/flagged doubts)
- Approve/purchase entitlements manually
- Update lesson content via admin interface

## Notifications

- Daily study reminders
- Spaced revision alerts
- Mock test completion reports

## Permissions & privacy

- Student data stored securely with GDPR-compliant encryption
- Payment info processed via UPI partners without storage

## Edge cases

- Incomplete onboarding attempts
- Payment failures during purchase flow
- Flagged doubts requiring human review

## Required tests

- End-to-end mock test flow with timer validation
- Purchase flow with entitlement unlocking
- Doubt flagging to admin workflow

## Assumptions

- Hinglish is default language for all content
- All onboarding fields are mandatory
- Admin reports sent to owner's personal Telegram ID
