# Goals Module --- API Spec

Base path: /api/v1/goals

------------------------------------------------------------------------

## Create Goal

POST /goals

Request

{ "title": "Run Marathon", "description": "Prepare for marathon",
"timeCategory": "yearly", "lifeCategory": "health" }

------------------------------------------------------------------------

## List Goals

GET /goals

------------------------------------------------------------------------

## Get Goal

GET /goals/:id

------------------------------------------------------------------------

## Update Goal

PATCH /goals/:id

------------------------------------------------------------------------

## Delete Goal

DELETE /goals/:id

------------------------------------------------------------------------

## Create Task

POST /goals/:id/tasks

{ "title": "Run 5km training" }

------------------------------------------------------------------------

## Complete Task

PATCH /tasks/:id

{ "completed": true }

------------------------------------------------------------------------

## Link Habit

POST /goals/:id/habits

{ "habitId": "uuid" }

------------------------------------------------------------------------

## Get Progress

GET /goals/:id/progress
