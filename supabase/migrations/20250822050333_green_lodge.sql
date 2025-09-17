/*
  # Add payload column to saved_recipes table

  1. Changes
    - Add `payload` column to `saved_recipes` table to store full recipe JSON
    - Set column type to `jsonb` for efficient JSON storage and querying
    - Make column nullable to maintain compatibility with existing data

  2. Security
    - No changes to RLS policies needed
    - Existing policies will continue to work with new column
*/

-- Add payload column to store full recipe JSON
ALTER TABLE saved_recipes 
ADD COLUMN IF NOT EXISTS payload jsonb;