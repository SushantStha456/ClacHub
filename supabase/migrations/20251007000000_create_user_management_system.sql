/*
  # User Management and Access Control System

  ## Overview
  This migration creates the database structure for user authentication, role-based access control,
  and user-specific calculator visibility.

  ## New Tables

  ### `user_profiles`
  Extends Supabase auth.users with additional profile information
  - `id` (uuid, primary key) - References auth.users(id)
  - `email` (text) - User's email address
  - `full_name` (text) - User's full name
  - `is_admin` (boolean) - Whether user has admin privileges
  - `has_admin_panel_access` (boolean) - Whether user can access admin panel
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update timestamp

  ### `user_calculator_access`
  Manages user-specific calculator visibility and permissions
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - References user_profiles(id)
  - `calculator_id` (uuid) - References calculators(id)
  - `has_access` (boolean) - Whether user can access this calculator
  - `created_at` (timestamptz) - When access was granted
  - `updated_at` (timestamptz) - Last access update timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Users can view their own profile
  - Only admins can modify user profiles and access settings
  - Users can only see calculators they have access to

  ## Indexes
  - Index on user_id for efficient user lookups
  - Index on calculator_id for efficient calculator queries
  - Unique constraint on user_id + calculator_id combination

  ## Notes
  - By default, all users have access to all calculators
  - Admin users are automatically granted admin panel access
  - First user registered becomes admin automatically
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  is_admin boolean DEFAULT false,
  has_admin_panel_access boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_calculator_access table
CREATE TABLE IF NOT EXISTS user_calculator_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  calculator_id uuid NOT NULL REFERENCES calculators(id) ON DELETE CASCADE,
  has_access boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, calculator_id)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_calculator_access ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_user_calculator_access_user ON user_calculator_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_calculator_access_calculator ON user_calculator_access(calculator_id);

-- RLS Policies for user_profiles

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Users can update their own profile (except admin flags)
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    is_admin = (SELECT is_admin FROM user_profiles WHERE id = auth.uid()) AND
    has_admin_panel_access = (SELECT has_admin_panel_access FROM user_profiles WHERE id = auth.uid())
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (true);

-- Allow profile creation on signup
CREATE POLICY "Allow profile creation"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_calculator_access

-- Users can view their own calculator access
CREATE POLICY "Users can view own calculator access"
  ON user_calculator_access
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all calculator access
CREATE POLICY "Admins can view all calculator access"
  ON user_calculator_access
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admins can insert calculator access
CREATE POLICY "Admins can insert calculator access"
  ON user_calculator_access
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admins can update calculator access
CREATE POLICY "Admins can update calculator access"
  ON user_calculator_access
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (true);

-- Admins can delete calculator access
CREATE POLICY "Admins can delete calculator access"
  ON user_calculator_access
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_count integer;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM user_profiles;

  -- Insert new user profile
  INSERT INTO public.user_profiles (id, email, full_name, is_admin, has_admin_panel_access)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE WHEN user_count = 0 THEN true ELSE false END,
    CASE WHEN user_count = 0 THEN true ELSE false END
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column_v2()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_profiles updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column_v2();

-- Trigger for user_calculator_access updated_at
DROP TRIGGER IF EXISTS update_user_calculator_access_updated_at ON user_calculator_access;
CREATE TRIGGER update_user_calculator_access_updated_at
  BEFORE UPDATE ON user_calculator_access
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column_v2();
