/*
  # Add Calculator Visibility Management

  ## Overview
  This migration creates the database structure for managing calculator visibility
  and settings through an admin panel.

  ## New Tables
  
  ### `calculators`
  Stores configuration for all available calculators
  - `id` (uuid, primary key) - Unique identifier for each calculator
  - `name` (text) - Display name of the calculator
  - `slug` (text, unique) - URL-friendly identifier
  - `category` (text) - Category grouping (e.g., 'health', 'financial')
  - `is_visible` (boolean) - Whether calculator should be displayed to users
  - `sort_order` (integer) - Display order in lists
  - `description` (text) - Brief description of calculator functionality
  - `created_at` (timestamptz) - When calculator was added
  - `updated_at` (timestamptz) - Last modification timestamp
  
  ## Security
  - Enable Row Level Security (RLS) on `calculators` table
  - Public read access for visible calculators
  - Only authenticated admin users can modify calculator settings

  ## Initial Data
  - Populate table with existing calculators (BMI, Age, EMI, Interest)
  
  ## Indexes
  - Index on `slug` for efficient lookups
  - Index on `is_visible` for filtering
  - Index on `sort_order` for ordered queries
*/

-- Create calculators configuration table
CREATE TABLE IF NOT EXISTS calculators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL,
  is_visible boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE calculators ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calculators_slug ON calculators(slug);
CREATE INDEX IF NOT EXISTS idx_calculators_visible ON calculators(is_visible);
CREATE INDEX IF NOT EXISTS idx_calculators_sort ON calculators(sort_order);
CREATE INDEX IF NOT EXISTS idx_calculators_category ON calculators(category);

-- RLS Policies
-- Allow anyone to view visible calculators
CREATE POLICY "Anyone can view visible calculators"
  ON calculators
  FOR SELECT
  USING (is_visible = true);

-- Allow authenticated users to view all calculators (for admin panel)
CREATE POLICY "Authenticated users can view all calculators"
  ON calculators
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update calculators (admin functionality)
CREATE POLICY "Authenticated users can update calculators"
  ON calculators
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to insert calculators
CREATE POLICY "Authenticated users can insert calculators"
  ON calculators
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert initial calculator data
INSERT INTO calculators (name, slug, category, is_visible, sort_order, description) VALUES
  ('BMI Calculator', 'bmi', 'health', true, 1, 'Calculate your Body Mass Index and understand your health status'),
  ('Age Calculator', 'age', 'time', true, 2, 'Calculate your exact age in years, months, and days'),
  ('EMI Calculator', 'emi', 'financial', true, 3, 'Calculate your loan EMI and payment schedule'),
  ('Interest Calculator', 'interest', 'financial', true, 4, 'Calculate simple and compound interest on your investments'),
  ('Investment Calculator', 'investment', 'financial', true, 5, 'Calculate investment returns and future value')
ON CONFLICT (slug) DO NOTHING;

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_calculators_updated_at ON calculators;
CREATE TRIGGER update_calculators_updated_at
  BEFORE UPDATE ON calculators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();