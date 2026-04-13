-- Migration: Add admin support
-- Run this in Supabase SQL Editor

-- 1. Add is_admin column (defaults to false)
ALTER TABLE residents ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;

-- 2. Make yourself admin (replace 'M051' and 'Shibu' with your actual values)
UPDATE residents SET is_admin = true WHERE apartment = 'M051' AND display_name = 'Shibu';
