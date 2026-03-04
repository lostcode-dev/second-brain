# Health Module --- API Spec

Base path:

/api/v1/health

------------------------------------------------------------------------

## Log Health Metric

POST /health/metrics

{ "type":"weight", "value":78.5 }

------------------------------------------------------------------------

## List Health Metrics

GET /health/metrics

------------------------------------------------------------------------

## Create Meal

POST /health/meals

{ "name":"Lunch", "calories":650 }

------------------------------------------------------------------------

## List Meals

GET /health/meals

------------------------------------------------------------------------

## Create Workout

POST /health/workouts

{ "name":"Chest workout", "duration":60 }

------------------------------------------------------------------------

## Add Exercise

POST /health/workouts/:id/exercises

{ "name":"Bench Press", "sets":4, "reps":10 }

------------------------------------------------------------------------

## Create Medical Record

POST /health/records

{ "title":"Cardiologist Visit" }

------------------------------------------------------------------------

## Upload Medical Document

POST /health/records/:id/documents

multipart/form-data

file
