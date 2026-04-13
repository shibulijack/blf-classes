-- Migration: Add class verification and reporting
-- Run this in Supabase SQL Editor

CREATE TABLE class_verifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  resident_id   UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(class_id, resident_id)
);

CREATE INDEX idx_verifications_class ON class_verifications (class_id);

CREATE TABLE class_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  resident_id   UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  reason        TEXT NOT NULL,
  details       TEXT,
  resolved      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(class_id, resident_id)
);

CREATE INDEX idx_reports_class ON class_reports (class_id);
CREATE INDEX idx_reports_resolved ON class_reports (resolved);
