/*
  # Create MVP Database Schema

  1. New Tables
    - `recipes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `mood` (text)
      - `goal` (text)
      - `ingredients` (jsonb)
      - `instructions` (text[])
      - `benefits` (text)
      - `prep_time` (text)
      - `servings` (text)
      - `color` (text[])
      - `created_at` (timestamp)

    - `saved_recipes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `recipe_id` (uuid, foreign key to recipes)
      - `created_at` (timestamp)

    - `users`
      - `id` (uuid, primary key, foreign key to auth.users)
      - `email` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Allow public read access to recipes
    - Allow authenticated users to insert recipes and save them

  3. Functions
    - Trigger to create user profile on signup
*/

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mood text NOT NULL,
  goal text NOT NULL,
  ingredients jsonb DEFAULT '[]'::jsonb,
  instructions text[] DEFAULT '{}'::text[],
  benefits text DEFAULT '',
  prep_time text DEFAULT '5 min',
  servings text DEFAULT '1',
  color text[] DEFAULT '{#22c55e,#16a34a}'::text[],
  created_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create saved_recipes table
CREATE TABLE IF NOT EXISTS saved_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recipe_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipes
CREATE POLICY "Anyone can read recipes"
  ON recipes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert recipes"
  ON recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for users
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for saved_recipes
CREATE POLICY "Users can read own saved recipes"
  ON saved_recipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save recipes"
  ON saved_recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave recipes"
  ON saved_recipes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add foreign key constraints
ALTER TABLE saved_recipes 
ADD CONSTRAINT saved_recipes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE saved_recipes 
ADD CONSTRAINT saved_recipes_recipe_id_fkey 
FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE;

ALTER TABLE users 
ADD CONSTRAINT users_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();