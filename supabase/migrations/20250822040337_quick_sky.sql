/*
  # Fix RLS policy for recipes table

  1. Security Changes
    - Add INSERT policy for authenticated users to create recipes
    - Keep existing SELECT policy for public read access
    - Ensure users can save their own recipes

  This fixes the RLS violation error when authenticated users try to save recipes.
*/

-- Add policy to allow authenticated users to insert recipes
CREATE POLICY "Authenticated users can insert recipes"
  ON recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);