/*
  # Add User Preferences Columns

  1. New Columns
    - `dietary_restrictions` (jsonb, nullable) - stores user's dietary restrictions like vegan, keto, etc.
    - `allergies` (jsonb, nullable) - stores user's allergen information
    - `recently_viewed` (jsonb, nullable) - stores recently viewed recipe IDs and timestamps

  2. Changes
    - Add three new columns to users table to support personalization features
    - All columns are nullable to maintain backward compatibility
    - Use JSONB for flexible data storage and efficient querying
*/

-- Add dietary restrictions column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'dietary_restrictions'
  ) THEN
    ALTER TABLE users ADD COLUMN dietary_restrictions jsonb;
  END IF;
END $$;

-- Add allergies column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'allergies'
  ) THEN
    ALTER TABLE users ADD COLUMN allergies jsonb;
  END IF;
END $$;

-- Add recently viewed column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'recently_viewed'
  ) THEN
    ALTER TABLE users ADD COLUMN recently_viewed jsonb;
  END IF;
END $$;