-- Migration: Allow multiple profiles per apartment
-- Run this in Supabase SQL Editor

-- 1. Drop the unique index on apartment (allows multiple residents per apartment)
DROP INDEX IF EXISTS idx_residents_apartment;

-- 2. Make display_name required for existing rows (set a default for any NULLs)
UPDATE residents SET display_name = apartment WHERE display_name IS NULL;

-- 3. Add NOT NULL constraint to display_name
ALTER TABLE residents ALTER COLUMN display_name SET NOT NULL;

-- 4. Add unique constraint on (apartment, display_name)
ALTER TABLE residents ADD CONSTRAINT residents_apartment_name_unique UNIQUE (apartment, display_name);

-- 5. Re-create a non-unique index on apartment for fast lookups
CREATE INDEX idx_residents_apartment ON residents (apartment);
