-- BLF Community Classes App - Database Schema
-- Run this in Supabase SQL Editor to create all tables

CREATE TABLE residents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment     TEXT NOT NULL,
  pin_hash      TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(apartment, display_name)
);

CREATE INDEX idx_residents_apartment ON residents (apartment);

CREATE TABLE classes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by    UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL,
  day_of_week   TEXT[] NOT NULL DEFAULT '{}',
  time_slot     TEXT,
  age_group     TEXT,
  location      TEXT,
  tutor_name    TEXT,
  tutor_contact TEXT,
  fee           TEXT,
  max_students  INTEGER,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_classes_category ON classes (category);
CREATE INDEX idx_classes_created_by ON classes (created_by);
CREATE INDEX idx_classes_is_active ON classes (is_active);

CREATE TABLE registrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  resident_id   UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(class_id, resident_id)
);

CREATE INDEX idx_registrations_class ON registrations (class_id);
CREATE INDEX idx_registrations_resident ON registrations (resident_id);
