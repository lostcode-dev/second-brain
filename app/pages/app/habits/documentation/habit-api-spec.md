# Habit Module — API Spec (REST-first, Supabase-friendly)

Updated: 2026-03-04

This API spec defines endpoints for a Habit module aligned with Atomic Habits concepts.
You can implement via REST, tRPC, or Supabase RPC/functions.

Base path: `/api/v1`

---

## 1. Auth

All endpoints require authentication.
- Header: `Authorization: Bearer <token>`
- User context resolved server-side.

---

## 2. Types (enums)

- `HabitFrequency`: `daily | weekly | custom`
- `HabitDifficulty`: `tiny | normal | hard`
- `CueType`: `time | location | previous_habit | emotion`
- `RewardType`: `points | badge | unlockable`

---

## 3. Identities

### POST `/identities`
Create identity.

Request:
```json
{
  "name": "I am a disciplined person",
  "description": "I keep promises to myself."
}
```

Response: `201`
```json
{ "id": "uuid", "name": "...", "description": "...", "createdAt": "..." }
```

### GET `/identities`
List identities.

### PATCH `/identities/:id`
Update identity.

### DELETE `/identities/:id`
Archive identity (soft delete recommended).

---

## 4. Habits

### POST `/habits`
Create habit.

Request:
```json
{
  "name": "Read 10 minutes",
  "description": "Any book",
  "identityId": "uuid-or-null",
  "frequency": "daily",
  "difficulty": "tiny",
  "customDays": [1,3,5]
}
```

Response: `201` habit object.

### GET `/habits`
List habits (supports filters).

Query params:
- `archived=false|true`
- `identityId`
- `frequency`
- `search`

### GET `/habits/:id`
Get habit details (including cue/reward settings, streak).

### PATCH `/habits/:id`
Update habit fields.

### POST `/habits/:id/archive`
Archive habit.

---

## 5. Cues & Settings

### POST `/cues`
Create cue.

Request:
```json
{
  "type": "time",
  "timeOfDay": "07:30:00",
  "description": "Morning routine"
}
```

### POST `/habits/:id/settings`
Attach cue/reward to habit (upsert).

Request:
```json
{
  "cueId": "uuid-or-null",
  "rewardId": "uuid-or-null"
}
```

Response: `200`.

---

## 6. Habit Stacking

### POST `/stacks`
Create a stacking relation.

Request:
```json
{
  "triggerHabitId": "uuid",
  "newHabitId": "uuid"
}
```

### GET `/stacks`
List stacks.

### DELETE `/stacks/:id`
Archive stack.

---

## 7. Tracking (Logs & Streaks)

### GET `/today`
Return today’s habit list + completion status.

Response:
```json
{
  "date": "2026-03-04",
  "habits": [
    {
      "habitId": "uuid",
      "name": "Read 10 minutes",
      "completed": false,
      "streak": { "current": 7, "longest": 12 }
    }
  ]
}
```

### POST `/logs`
Upsert a log entry (idempotent per habit/date).

Request:
```json
{
  "habitId": "uuid",
  "date": "2026-03-04",
  "completed": true,
  "note": "Read 12 pages"
}
```

Response: `200` with updated streak summary.

### GET `/calendar`
Calendar grid data.

Query params:
- `month=2026-03` (YYYY-MM)
- `habitId` optional

Response:
```json
{
  "month": "2026-03",
  "days": [
    { "date": "2026-03-01", "completedCount": 2, "totalCount": 3 }
  ]
}
```

### GET `/streaks`
Get streaks summary across habits (for dashboard).

---

## 8. Insights & Reflection

### GET `/insights`
Dashboard metrics.

Response (example):
```json
{
  "completionRate": 0.62,
  "avgStreak": 4.1,
  "identityProgress": [
    { "identityId": "uuid", "name": "Discipline", "score": 0.73 }
  ]
}
```

### POST `/reflections`
Create or update weekly reflection.

Request:
```json
{
  "weekKey": "2026-W10",
  "wins": "Kept my morning routine 5/7 days.",
  "improvements": "Reduce friction to start reading at night."
}
```

### GET `/reflections?weekKey=2026-W10`
Fetch reflection.

---

## 9. Error Model

Standard error response:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "customDays is required when frequency=custom"
  }
}
```

---

## 10. Notes for Implementation

- Always compute “today” by user timezone.
- Ensure logs are idempotent by `(habitId, date)` unique constraint.
- Prefer soft delete (archive) to preserve analytics history.
