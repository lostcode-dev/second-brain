# Life OS Module --- Architecture

Updated: 2026-03-04

The Life OS module acts as the **integration layer** between all system
modules.

------------------------------------------------------------------------

## Architecture Style

Clean Architecture

Event Driven Integration

Layers:

UI\
Application\
Domain\
Infrastructure

------------------------------------------------------------------------

## Connected Modules

Habits Module\
Goals Module\
Tasks Module\
Calendar Module\
Journal Module\
Ideas Module\
Knowledge Graph Module

------------------------------------------------------------------------

## Integration Layer Responsibilities

Generate unified dashboards

Create relationships between modules

Provide productivity insights

------------------------------------------------------------------------

## Domain Entities

LifeArea\
EntityLink\
LifeDashboard\
LifeInsight

------------------------------------------------------------------------

## Key Use Cases

GenerateDailyDashboard

LinkEntities

GenerateLifeInsights

ListLifeAreas

------------------------------------------------------------------------

## Integration Model

Example:

Goal ├ Tasks ├ Habits └ Notes
