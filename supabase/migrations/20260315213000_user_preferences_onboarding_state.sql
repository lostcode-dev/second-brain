alter table public.user_preferences
  add column if not exists onboarding_state jsonb not null default '{
    "status": "not_started",
    "currentStep": "welcome",
    "startedAt": null,
    "completedAt": null,
    "profile": {
      "primaryGoal": null,
      "experienceLevel": null,
      "guidanceStyle": null
    }
  }'::jsonb;
