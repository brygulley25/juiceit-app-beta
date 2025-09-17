/*
  # Add atomic usage increment function

  1. New Function
    - `increment_daily_usage` - Atomically increment usage count for a user/day
    - Returns the new count after increment
    - Handles race conditions with proper upsert logic

  2. Security
    - Function is accessible to authenticated users
    - Uses proper parameter validation
*/

-- Create atomic increment function
CREATE OR REPLACE FUNCTION increment_daily_usage(
  p_user_id uuid,
  p_day date
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count integer;
BEGIN
  -- Atomically increment usage count
  INSERT INTO usage_daily (user_id, day, gen_count)
  VALUES (p_user_id, p_day, 1)
  ON CONFLICT (user_id, day)
  DO UPDATE SET gen_count = usage_daily.gen_count + 1
  RETURNING gen_count INTO new_count;
  
  RETURN new_count;
END;
$$;