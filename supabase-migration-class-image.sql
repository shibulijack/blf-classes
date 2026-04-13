-- Migration: Add image support for classes
-- Run this in Supabase SQL Editor

-- 1. Add image_url column to classes
ALTER TABLE classes ADD COLUMN image_url TEXT;

-- 2. Create storage bucket (run this separately in SQL Editor or via Supabase Dashboard > Storage)
-- Go to Supabase Dashboard > Storage > New Bucket
-- Name: class-images
-- Public: Yes (toggle on)
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
