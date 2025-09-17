/*
  # Complete RLS Policy Implementation

  1. Security Policies
    - Users can only access their own data
    - Guests blocked from authenticated tables
    - Service role has full access for edge functions

  2. Tables Covered
    - users: CRUD own profile only
    - saved_recipes: CRUD own recipes only  
    - usage_daily: CRUD own usage only
    - user_subscriptions: Read own subscription only
    - recipes: Public read, authenticated insert
*/

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

DROP POLICY IF EXISTS "Users can read own saved recipes" ON saved_recipes;
DROP POLICY IF EXISTS "Users can save recipes" ON saved_recipes;
DROP POLICY IF EXISTS "Users can unsave recipes" ON saved_recipes;

DROP POLICY IF EXISTS "Users can read own usage" ON usage_daily;
DROP POLICY IF EXISTS "Users can insert own usage" ON usage_daily;
DROP POLICY IF EXISTS "Users can update own usage" ON usage_daily;

DROP POLICY IF EXISTS "Users can read own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON user_subscriptions;

DROP POLICY IF EXISTS "Anyone can read recipes" ON recipes;
DROP POLICY IF EXISTS "Authenticated users can insert recipes" ON recipes;

-- USERS table policies
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

-- SAVED_RECIPES table policies
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

-- USAGE_DAILY table policies
CREATE POLICY "Users can read own usage"
  ON usage_daily
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON usage_daily
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON usage_daily
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- USER_SUBSCRIPTIONS table policies (read-only for users)
CREATE POLICY "Users can read own subscription"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can manage subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON user_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RECIPES table policies (public read, authenticated insert)
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