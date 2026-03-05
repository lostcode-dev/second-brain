-- ============================================================================
-- Life OS Module Migration (MVP)
-- Tables: life_areas, entity_links
-- ============================================================================

-- ─── 1. Life Areas ─────────────────────────────────────────────────────────

CREATE TABLE life_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name text NOT NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, name)
);

CREATE INDEX idx_life_areas_user ON life_areas(user_id);

-- ─── 2. Entity Links ───────────────────────────────────────────────────────

CREATE TABLE entity_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  source_type text NOT NULL,
  source_id uuid NOT NULL,

  target_type text NOT NULL,
  target_id uuid NOT NULL,

  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, source_type, source_id, target_type, target_id)
);

CREATE INDEX idx_entity_links_user ON entity_links(user_id);
CREATE INDEX idx_entity_links_source ON entity_links(source_type, source_id);
CREATE INDEX idx_entity_links_target ON entity_links(target_type, target_id);

-- ─── RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE life_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_links ENABLE ROW LEVEL SECURITY;

-- Life Areas: owner can do everything
CREATE POLICY life_areas_select ON life_areas
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY life_areas_insert ON life_areas
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY life_areas_update ON life_areas
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY life_areas_delete ON life_areas
  FOR DELETE USING (user_id = auth.uid());

-- Entity Links: owner can do everything
CREATE POLICY entity_links_select ON entity_links
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY entity_links_insert ON entity_links
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY entity_links_delete ON entity_links
  FOR DELETE USING (user_id = auth.uid());
