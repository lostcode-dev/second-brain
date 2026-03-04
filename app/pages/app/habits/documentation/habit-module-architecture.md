# Habit Module Architecture (Atomic Habits Inspired)

Updated: 2026-03-04

This document defines the internal architecture of a Habit module inspired by **Atomic Habits (James Clear)**.
It focuses on clean boundaries, scalability, and product features mapped to the book concepts.

---

## 1. Concept Mapping

### Habit Loop
**Cue → Craving → Response → Reward**

### 4 Laws of Behavior Change
1. Make it **Obvious** → cues, reminders, environment design
2. Make it **Attractive** → temptation bundling, social proof, motivation
3. Make it **Easy** → tiny habits, friction reduction, automation
4. Make it **Satisfying** → rewards, streaks, feedback loops

---

## 2. Architecture Style

Recommended: **Clean Architecture + Domain-Driven Design (DDD-lite)**

Layers:
- **UI** (Web/Mobile): Views, state management, validation
- **Application**: Use-cases (commands/queries), orchestration, policies
- **Domain**: Entities, Value Objects, domain services, invariants
- **Infrastructure**: DB, queues, analytics, notifications, external services

Cross-cutting:
- Auth/RBAC
- Observability (logs, metrics, traces)
- Feature flags
- Audit trail (optional)

---

## 3. Bounded Contexts (submodules)

### 3.1 Habits
Core habit definition, scheduling rules, difficulty, identity link.

### 3.2 Tracking
Logs, streak computation, calendar, backfills.

### 3.3 Behavior Design
Cues, habit stacking, friction, environment configuration, reward rules.

### 3.4 Insights
Metrics, reflections, weekly reviews, progress by identity.

### 3.5 Engagement
Notifications, reminders, challenges, gamification, nudges.

---

## 4. Domain Model (high level)

Entities:
- **Habit**
- **Identity**
- **HabitCue**
- **HabitStack**
- **HabitReward**
- **HabitLog**
- **HabitStreak**
- **HabitReflection**

Value Objects:
- FrequencyRule (daily/weekly/custom)
- ScheduleWindow (optional)
- Difficulty (tiny/normal/hard)
- CompletionStatus
- LocalDate (timezone-safe)

---

## 5. Key Use-Cases (Application Layer)

### Commands
- CreateIdentity
- CreateHabit
- UpdateHabit
- ArchiveHabit
- CreateCue
- LinkCueToHabit
- CreateHabitStack (after X I will do Y)
- LogHabitCompletion (complete/uncomplete with note)
- BackfillLog (allowed with rules)
- GenerateWeeklyReflection (prompt + save)

### Queries
- GetTodayHabits
- GetHabitDetails
- GetHabitCalendar (month view)
- GetStreaksSummary
- GetIdentityProgress
- GetInsightsDashboard

---

## 6. Policies & Invariants (Domain Rules)

- A Habit belongs to exactly one user.
- A Habit may be linked to at most one Identity (optional, but recommended).
- A Habit may have 0..1 Cue and 0..1 Reward configuration.
- Logs are idempotent per (habitId, date) unless multi-check-in is enabled.
- Streak recalculation must be deterministic and based on logs + frequency rules.
- Backfill window (optional): e.g., allow editing only up to N days in the past.
- Timezone correctness: always compute “today” by user timezone.

---

## 7. Streak Computation Strategy

Options:
1. **On write**: update streak when writing a log (fast reads, more complex writes)
2. **On read**: compute streak from logs (simple writes, slower reads)
3. **Hybrid** (recommended): on write update counters, nightly job validates.

Suggested:
- Keep `habit_streaks` as a cache.
- Recompute if inconsistencies are detected.

---

## 8. Events (optional but great for SaaS)

Domain events:
- HabitCreated
- HabitCompleted
- HabitMissed (derived)
- StreakBroken
- StreakMilestoneReached
- WeeklyReflectionSubmitted

Consumers:
- Notifications service
- Analytics pipeline
- Badge/points awarding

---

## 9. Security & Compliance

- Row-level security (if using Supabase/Postgres RLS)
- Audit fields: created_at, updated_at, archived_at
- Soft delete vs archive (prefer archive for habits)
- Data export (GDPR-friendly)

---

## 10. Suggested Folder Structure (Frontend + Backend)

### Backend
- `src/modules/habits/domain`
- `src/modules/habits/application`
- `src/modules/habits/infrastructure`
- `src/modules/habits/http` (or `trpc`)

### Frontend
- `src/modules/habits`
  - `components/`
  - `pages/`
  - `hooks/`
  - `services/`
  - `types/`

---

## 11. MVP vs V2 vs V3

### MVP
- Create habit
- Daily list (Today)
- Log completion
- Basic streak
- Calendar view

### V2
- Identity linking
- Habit stacking
- Cues & reminders
- Rewards/points

### V3
- AI coach + nudges
- Behavior insights
- Community challenges
- Advanced personalization

---

## 12. Product Notes (Atomic Habits aligned)

- Default user journey: **Identity → Tiny Habit → Cue → Track → Reward**
- Always encourage “tiny” first to reduce drop-off.
- Weekly review boosts retention (insights + reflection).
