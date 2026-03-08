-- ==========================================================================
-- Habits Module — Four Laws strategy fields
-- ==========================================================================

ALTER TABLE habits
  ADD COLUMN obvious_strategy text,
  ADD COLUMN attractive_strategy text,
  ADD COLUMN easy_strategy text,
  ADD COLUMN satisfying_strategy text;