-- Add instructions column to skills table
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS instructions TEXT;

-- Comment on column
COMMENT ON COLUMN skills.instructions IS 'Text content of the Standard Operating Procedure (POP/SOP) for this skill';
