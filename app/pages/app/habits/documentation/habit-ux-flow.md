# Habit Module — UX Flow (Atomic Habits Aligned)

Updated: 2026-03-04

This UX flow is designed to match Atomic Habits principles and maximize user retention in a SaaS context.

---

## 1. North Star UX

**Identity → Tiny Habit → Cue → Track → Reward → Review**

Design goal:
- Help the user start **small**
- Make the habit **obvious**
- Reduce friction to complete it
- Give **immediate satisfaction**
- Reinforce **identity** over time

---

## 2. IA (Information Architecture)

Primary navigation:
- Today
- Habits
- Insights
- Review (Weekly)
- Settings

Secondary:
- Identity
- Cues & Reminders
- Rewards & Badges

---

## 3. Onboarding Flow (first session)

### Step A — Choose an Identity
Prompt:
- “Who do you want to become?”

UI:
- Identity cards (Healthy / Disciplined / Calm / Productive)
- Or “Create your own”

Output:
- `identityId`

### Step B — Pick a Tiny Habit
Prompt:
- “What’s the smallest version of this habit you can do?”

UI:
- Slider: Tiny → Normal → Hard
- Examples: “1 minute”, “1 page”, “1 push-up”

Output:
- `habit`

### Step C — Add a Cue (Make it obvious)
Prompt:
- “When will you do it?”

UI options:
- Time: “Every day at 07:30”
- Habit stacking: “After I drink coffee”
- Location: “When I arrive home”

Output:
- `cue` or `habit_stack`

### Step D — Choose a Reward (Make it satisfying)
Prompt:
- “What’s your immediate reward?”

UI options:
- Points (+10)
- Badge milestones
- Streak celebration

Output:
- reward config

### Step E — First success moment
Auto-nudge:
- “Mark it done now (practice run)”
- Show “You kept a promise to yourself” (identity reinforcement)

---

## 4. Today Screen (daily usage)

Layout:
- Header: date + greeting
- Section: “Your habits today”
- Each habit row shows:
  - checkbox
  - habit name
  - tiny hint (cue)
  - current streak

Interaction:
- Tap to complete (instant)
- Long press / open detail to add note

Microcopy examples:
- Completion toast: “Nice. You’re becoming consistent.”
- Streak milestone: “7-day streak! Keep the chain alive.”

---

## 5. Habit Details Screen

Tabs:
- Overview
- Schedule
- Cue & Stack
- Rewards
- History

Overview shows:
- Identity: “I am a ______ person”
- Current/longest streak
- Completion rate
- “Make it easier” suggestions (reduce friction)

---

## 6. Calendar (history)

Use cases:
- Visual proof of progress
- Reduce shame by showing misses as normal

UI:
- Month grid with completion intensity (optional)
- Tap day to see completed habits and notes

Rules:
- Allow backfill with clear limits (optional)
- Avoid “punishment”; focus on “get back on track”

---

## 7. Insights Dashboard

Show small set of high-signal metrics:
- Completion rate (7d / 30d)
- Average streak
- Best time of day (if tracked)
- Identity progress (score per identity)

Identity score approach (simple):
- Score = completed logs for habits under that identity / scheduled occurrences

---

## 8. Weekly Review Flow (retention driver)

Prompt on Sundays (or user-chosen day):
- “What went well?”
- “What made it hard?”
- “What will you change next week?”

UI:
- Reflection form
- Auto-suggest insights:
  - “You complete habits more often on Mon/Wed/Fri.”
  - “Tiny habits have 2x completion rate vs normal.”

Output:
- Save reflection
- Suggest 1 adjustment:
  - make cue clearer
  - reduce difficulty
  - add habit stacking

---

## 9. Atomic Habits UX Patterns

### Make it Obvious
- Cue reminders
- “After X, do Y” templates
- Lock screen widget (future)

### Make it Attractive
- “Temptation bundling” suggestions:
  - “After coffee, listen to your favorite playlist while you read.”
- Social proof (optional):
  - community challenges

### Make it Easy
- Default to tiny habit templates
- One-tap completion
- Pre-filled schedules
- Remove extra steps

### Make it Satisfying
- Streak celebration
- Points/badges
- Progress toward identity

---

## 10. UX Copy Bank (Portuguese-friendly)

- “Pequeno é melhor do que perfeito.”
- “Você está construindo a sua identidade.”
- “Só por hoje — mantenha a corrente.”
- “Se falhar, volte amanhã. Nunca dois dias seguidos.”

---

## 11. MVP Screens Checklist

- [ ] Onboarding (identity + tiny habit + cue)
- [ ] Today list
- [ ] Habit create/edit
- [ ] Habit detail
- [ ] Calendar
- [ ] Insights (basic)
- [ ] Weekly review

---

## 12. Nice-to-have (post-MVP)

- Smart reminders (based on behavior)
- Streak freeze (paid feature)
- Challenges (7-day, 21-day)
- AI coach prompts
