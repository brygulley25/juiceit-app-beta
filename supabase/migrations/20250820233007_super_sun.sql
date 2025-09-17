/*
  # Add Daily Check-ins Table

  1. New Tables
    - `daily_checkins`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `checkin_date` (date, unique per user per day)
      - `mood` (text, user's mood for the day)
      - `energy_level` (integer, 1-5 scale)
      - `motivation_level` (integer, 1-5 scale)
      - `notes` (text, optional daily notes)
      - `recipes_tried` (jsonb, array of recipe IDs tried that day)
      - `feeling_after` (jsonb, mood/energy after trying recipes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `daily_checkins` table
    - Add policies for authenticated users to manage their own check-ins
    - Unique constraint on user_id + checkin_date (one check-in per user per day)

  3. Indexes
    - Index on user_id for fast user lookup
    - Index on checkin_date for date-based queries
    - Composite index on user_id + checkin_date for daily lookups
*/

-- Create daily_checkins table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date date NOT NULL DEFAULT CURRENT_DATE,
  mood text NOT NULL DEFAULT 'neutral',
  energy_level integer NOT NULL DEFAULT 3 CHECK (energy_level >= 1 AND energy_level <= 5),
  motivation_level integer NOT NULL DEFAULT 3 CHECK (motivation_level >= 1 AND motivation_level <= 5),
  notes text DEFAULT '',
  recipes_tried jsonb DEFAULT '[]'::jsonb,
  feeling_after jsonb DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint (one check-in per user per day)
ALTER TABLE daily_checkins 
ADD CONSTRAINT daily_checkins_user_date_unique 
UNIQUE (user_id, checkin_date);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS daily_checkins_user_id_idx ON daily_checkins(user_id);
CREATE INDEX IF NOT EXISTS daily_checkins_date_idx ON daily_checkins(checkin_date);
CREATE INDEX IF NOT EXISTS daily_checkins_user_date_idx ON daily_checkins(user_id, checkin_date);

-- Enable Row Level Security
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own checkins"
  ON daily_checkins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins"
  ON daily_checkins
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins"
  ON daily_checkins
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own checkins"
  ON daily_checkins
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);