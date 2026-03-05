# Habit Module --- Atomic Habits Inspired Architecture

This module is designed based on principles from the book **Atomic
Habits by James Clear**.

The system follows two main concepts:

1.  Habit Loop
2.  Four Laws of Behavior Change

------------------------------------------------------------------------

# 1. Habit Loop

Every habit follows the cycle:

Cue → Craving → Response → Reward

  Step       Meaning
  ---------- ----------------------------------
  Cue        Trigger that starts the behavior
  Craving    Motivation or desire
  Response   The action performed
  Reward     The satisfaction obtained

------------------------------------------------------------------------

# 2. Four Laws of Behavior Change

The system supports the four behavioral laws:

1.  Make it **Obvious**
2.  Make it **Attractive**
3.  Make it **Easy**
4.  Make it **Satisfying**

------------------------------------------------------------------------

# 3. Domain Entities

## User

``` ts
User {
  id: string
  name: string
  email: string
  createdAt: Date
}
```

------------------------------------------------------------------------

## Identity

Atomic Habits emphasizes identity-based behavior change.

Example:

Goal → Run\
Identity → I am an active person

``` ts
Identity {
  id: string
  userId: string
  name: string
  description?: string
}
```

Example:

Identity:\
"I am a disciplined person"

Habits: - Read 10 minutes - Wake up early - Plan the day

------------------------------------------------------------------------

## Habit

Main structure of the system.

``` ts
Habit {
  id: string
  userId: string

  name: string
  description?: string

  identityId?: string

  frequency: HabitFrequency
  difficulty: HabitDifficulty

  cueId?: string
  rewardId?: string

  archived: boolean

  createdAt: Date
}
```

------------------------------------------------------------------------

## HabitFrequency

``` ts
enum HabitFrequency {
  Daily = 'daily',
  Weekly = 'weekly',
  Custom = 'custom'
}
```

Example:

Monday\
Wednesday\
Friday

------------------------------------------------------------------------

## HabitDifficulty

Based on the **Tiny Habits** concept.

``` ts
enum HabitDifficulty {
  Tiny = 'tiny'
  Normal = 'normal'
  Hard = 'hard'
}
```

Examples:

Tiny Habit - 1 push-up - 1 page - 1 minute meditation

------------------------------------------------------------------------

# 4. Cue (Habit Trigger)

Every habit starts with a trigger.

Types:

-   Time
-   Location
-   Previous Habit
-   Emotion

``` ts
HabitCue {
  id: string
  type: CueType

  time?: string
  location?: string

  previousHabitId?: string

  description?: string
}
```

------------------------------------------------------------------------

# 5. Habit Stacking

Structure:

After \[current habit\]\
I will \[new habit\]

``` ts
HabitStack {
  id: string
  triggerHabitId: string
  newHabitId: string
}
```

Example:

After: Drink coffee

I will: Read 5 pages

------------------------------------------------------------------------

# 6. Habit Log

Habit execution record.

``` ts
HabitLog {
  id: string
  habitId: string
  userId: string

  date: Date
  completed: boolean

  note?: string
}
```

------------------------------------------------------------------------

# 7. Habit Streak

Consistency system.

``` ts
HabitStreak {
  habitId: string

  currentStreak: number
  longestStreak: number

  lastCompletedDate: Date
}
```

------------------------------------------------------------------------

# 8. Reward System

Related to the fourth law: **Make it satisfying**.

``` ts
HabitReward {
  id: string
  habitId: string

  type: RewardType

  points?: number
}
```

Reward types:

-   points
-   badges
-   unlockables

------------------------------------------------------------------------

# 9. Weekly Reflection

Continuous improvement.

``` ts
HabitReflection {
  id: string
  userId: string

  week: string

  wins: string
  improvements: string
}
```

------------------------------------------------------------------------

# 10. Habit Creation Flow

Step 1 --- Identity

I want to become a:

-   Healthy person
-   Disciplined person
-   Productive person

Step 2 --- Tiny Habit

Example:

5 minutes of exercise

Step 3 --- Trigger

After: Drinking coffee

Step 4 --- Reward

+10 points

------------------------------------------------------------------------

# 11. Habit Dashboard

Example:

## Today

☐ Drink 2L of water\
☐ Read 10 pages\
☑ Meditate 5 minutes

🔥 Streak: 7 days

------------------------------------------------------------------------

# 12. Habit Metrics

Important metrics:

-   habit_completion_rate
-   streak_average
-   identity_progress

Example:

Discipline: 73%\
Health: 40%\
Learning: 60%

------------------------------------------------------------------------

# 13. Roadmap

## MVP

-   Create habit
-   Track habit
-   Streak system
-   Calendar view
-   Habit stacking
-   Identity system
-   Rewards
-   AI habit coach
-   Habit suggestions
-   Behavioral analytics
-   Advanced gamification

------------------------------------------------------------------------

# 14. Identity Evolution

Example:

You completed 120 habits.

You are becoming:

🔥 A disciplined person

This reinforces behavior and increases engagement.
