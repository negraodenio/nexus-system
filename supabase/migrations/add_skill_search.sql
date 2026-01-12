-- Migration: Add searchable metadata to skills table
-- Run this in Supabase SQL Editor

-- Add new columns for search functionality
ALTER TABLE skills ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE skills ADD COLUMN IF NOT EXISTS description text;

-- Add full-text search vector (auto-generated from title + description)
ALTER TABLE skills ADD COLUMN IF NOT EXISTS search_vector tsvector 
    GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))) STORED;

-- Create indexes for fast search
CREATE INDEX IF NOT EXISTS idx_skills_search ON skills USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_skills_tags ON skills USING GIN(tags);

-- That's it! No policy changes needed - they already exist.
