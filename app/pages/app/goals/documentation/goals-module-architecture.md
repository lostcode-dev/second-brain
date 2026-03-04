# Goals Module --- Architecture

Updated: 2026-03-04

This document describes the architecture of the Goals module.

------------------------------------------------------------------------

## Architecture Style

Recommended: **Clean Architecture**

Layers:

UI\
Application\
Domain\
Infrastructure

------------------------------------------------------------------------

## Bounded Contexts

### Goals

Core goal management.

### Tasks

Subtasks linked to goals.

### Categories

Time horizon and life areas.

### Habit Integration

Links habits to goals.

### Insights

Progress tracking and analytics.

------------------------------------------------------------------------

## Domain Entities

Goal\
GoalTask\
GoalCategoryTime\
GoalCategoryLife\
GoalHabitLink

Value Objects:

ProgressPercent\
Priority\
GoalStatus

------------------------------------------------------------------------

## Key Use Cases

CreateGoal\
UpdateGoal\
DeleteGoal\
AddTask\
CompleteTask\
LinkHabitToGoal\
CalculateProgress\
ListGoalsByCategory

------------------------------------------------------------------------

## Domain Rules

A goal may have many tasks.

Tasks belong to only one goal.

Goals may link multiple habits.

Goal progress is calculated from completed tasks.

Goals must belong to: - one time category - one life category
