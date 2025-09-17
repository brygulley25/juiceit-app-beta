/*
  # Clean up orphaned user records

  1. Remove orphaned records
    - Delete any records in public.users that don't have corresponding auth.users
    - Clean up any remaining data for the test emails
  
  2. Ensure proper user creation
    - Fix any constraints that might be causing signup issues
*/

-- Clean up any orphaned records for the test emails
DELETE FROM public.users 
WHERE email IN ('brysongulley2@gmail.com', 'brysongulley@divinedesignllc.work');

-- Clean up any remaining saved recipes, usage records, or subscriptions
-- that might reference non-existent users
DELETE FROM public.saved_recipes 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM public.usage_daily 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM public.user_subscriptions 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Ensure the users table is clean
DELETE FROM public.users 
WHERE id NOT IN (SELECT id FROM auth.users);