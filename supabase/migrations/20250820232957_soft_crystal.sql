/*
  # Add Recipe Ratings Table

  1. New Tables
    - `recipe_ratings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `recipe_id` (uuid, foreign key to recipes)
      - `overall_rating` (integer, 1-5 scale)
      - `taste_rating` (integer, 1-5 scale)
      - `energy_rating` (integer, 1-5 scale)
      - `satisfaction_rating` (integer, 1-5 scale)
      - `would_make_again` (boolean)
      - `notes` (text, optional feedback)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `recipe_ratings` table
    - Add policies for authenticated users to manage their own ratings
    - Unique constraint on user_id + recipe_id (one rating per user per recipe)

  3. Indexes
    - Index on user_id for fast user rating lookups
    - Index on recipe_id for recipe analytics
    - Composite index on user_id + recipe_id for upsert operations
*/

-- Create recipe_ratings table
CREATE TABLE IF NOT EXISTS recipe_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  overall_rating integer NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  taste_rating integer NOT NULL CHECK (taste_rating >= 1 AND taste_rating <= 5),
  energy_rating integer NOT NULL CHECK (energy_rating >= 1 AND energy_rating <= 5),
  satisfaction_rating integer NOT NULL CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  would_make_again boolean NOT NULL DEFAULT false,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint (one rating per user per recipe)
ALTER TABLE recipe_ratings 
ADD CONSTRAINT recipe_ratings_user_recipe_unique 
UNIQUE (user_id, recipe_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS recipe_ratings_user_id_idx ON recipe_ratings(user_id);
CREATE INDEX IF NOT EXISTS recipe_ratings_recipe_id_idx ON recipe_ratings(recipe_id);
CREATE INDEX IF NOT EXISTS recipe_ratings_user_recipe_idx ON recipe_ratings(user_id, recipe_id);

-- Enable Row Level Security
ALTER TABLE recipe_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own ratings"
  ON recipe_ratings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ratings"
  ON recipe_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON recipe_ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON recipe_ratings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recipe_ratings_updated_at
  BEFORE UPDATE ON recipe_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();