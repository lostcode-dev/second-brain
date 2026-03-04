# Tasks Module --- Architecture

Updated: 2026-03-04

Architecture for the To‑Do list module.

------------------------------------------------------------------------

## Architecture Style

Recommended: Clean Architecture

Layers:

UI\
Application\
Domain\
Infrastructure

------------------------------------------------------------------------

## Bounded Contexts

### Tasks

Core task management.

### Lists

Organization of tasks.

### Scheduling

Due dates and reminders.

### Productivity

Task completion metrics.

------------------------------------------------------------------------

## Domain Entities

Task\
TaskList\
SubTask\
TaskTag\
TaskReminder

Value Objects

TaskStatus\
Priority\
DueDate

------------------------------------------------------------------------

## Key Use Cases

CreateTask\
UpdateTask\
DeleteTask\
CompleteTask\
AddSubtask\
AddTag\
SetPriority\
AssignList

------------------------------------------------------------------------

## Domain Rules

Tasks belong to a user.

Tasks may belong to a list.

Tasks may contain multiple subtasks.

Completing all subtasks can auto‑complete the parent task.
