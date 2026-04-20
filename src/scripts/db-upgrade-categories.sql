
-- Add category column to projects table
ALTER TABLE IF EXISTS projects 
ADD COLUMN IF NOT EXISTS category varchar;

-- Add type column to projects table to distinguish between standard and custom projects
ALTER TABLE IF EXISTS projects 
ADD COLUMN IF NOT EXISTS type varchar;

-- Update existing projects to set default category and type
UPDATE projects SET category = 'standard' WHERE category IS NULL;
UPDATE projects SET type = 'standard' WHERE type IS NULL;
