-- ADMIN-ONLY SIGNUP SYSTEM
-- Anyone can sign up, but ONLY with correct admin invite code
-- All users who sign up successfully become admins

-- RESET ALL USERS (DANGER: This deletes everything!)
-- Uncomment the section below to completely reset all users

/*
-- 1. Delete all profiles first (due to foreign key constraints)
DELETE FROM profiles;

-- 2. Delete all users from auth.users
-- Note: This requires service_role privileges
DELETE FROM auth.users;

-- 3. Reset any sequences if needed
-- ALTER SEQUENCE IF EXISTS profiles_id_seq RESTART WITH 1;
*/

-- 1. Ensure profiles table exists with proper RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile metadata" ON profiles;
DROP POLICY IF EXISTS "Service role can create profiles" ON profiles;

-- Create strict policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can create profiles (through API/triggers)
CREATE POLICY "Service role can create profiles" ON profiles
  FOR INSERT 
  TO service_role 
  WITH CHECK (true);

-- 2. Site content - only admins can edit
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read content" ON site_content;
DROP POLICY IF EXISTS "Verified admins can insert content" ON site_content;
DROP POLICY IF EXISTS "Verified admins can update content" ON site_content;
DROP POLICY IF EXISTS "Verified admins can delete content" ON site_content;

-- Public can read content
CREATE POLICY "Anyone can read content" ON site_content
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- Only admins can modify content
CREATE POLICY "Admins can insert content" ON site_content
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can update content" ON site_content
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete content" ON site_content
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- 3. Remove the auto-profile-creation trigger (we'll handle this in API)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 4. Verify current state
SELECT COUNT(*) as total_users FROM auth.users;
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT COUNT(*) as admin_count FROM profiles WHERE is_admin = true;