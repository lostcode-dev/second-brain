# Health Module --- Architecture

Updated: 2026-03-04

The Health module contains multiple sub-domains.

------------------------------------------------------------------------

## Architecture Style

Clean Architecture

Layers:

UI\
Application\
Domain\
Infrastructure

------------------------------------------------------------------------

## Submodules

Health Metrics

Diet

Workout

Medical Records

Document Storage

------------------------------------------------------------------------

## Domain Entities

HealthMetric\
Meal\
FoodItem\
WorkoutSession\
Exercise\
MedicalRecord\
MedicalDocument

------------------------------------------------------------------------

## Value Objects

Weight\
Calories\
HeartRate\
BloodPressure

------------------------------------------------------------------------

## Key Use Cases

LogHealthMetric

CreateMeal

LogWorkout

UploadMedicalDocument

ViewHealthTimeline

------------------------------------------------------------------------

## Integration With Life OS

Health data may connect to:

Habits → workout habit

Goals → weight loss goal

Tasks → doctor appointment
