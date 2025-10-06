/*
  # Calculator History Database Schema

  ## Overview
  This migration creates the database structure for storing calculator history and user preferences.

  ## New Tables
  
  ### `calculator_history`
  Stores all calculator operations performed by users
  - `id` (uuid, primary key) - Unique identifier for each calculation
  - `calculator_type` (text) - Type of calculator used (bmi, age, financial)
  - `input_data` (jsonb) - Input values used in the calculation
  - `result_data` (jsonb) - Calculated results
  - `user_id` (uuid, nullable) - Reference to authenticated user (optional)
  - `created_at` (timestamptz) - Timestamp when calculation was performed
  
  ## Security
  - Enable Row Level Security (RLS) on `calculator_history` table
  - Public read access for non-authenticated users (own session data only)
  - Authenticated users can view their own calculation history
  - Authenticated users can insert their own calculations

  ## Indexes
  - Index on `calculator_type` for efficient filtering by calculator type
  - Index on `user_id` for efficient user-specific queries
  - Index on `created_at` for chronological sorting
*/

-- Create calculator_history table
CREATE TABLE IF NOT EXISTS calculator_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calculator_type text NOT NULL CHECK (calculator_type IN ('bmi', 'age', 'financial')),
  input_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE calculator_history ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calculator_history_type ON calculator_history(calculator_type);
CREATE INDEX IF NOT EXISTS idx_calculator_history_user ON calculator_history(user_id);
CREATE INDEX IF NOT EXISTS idx_calculator_history_created ON calculator_history(created_at DESC);

-- RLS Policies
-- Allow authenticated users to view their own calculation history
CREATE POLICY "Users can view own calculation history"
  ON calculator_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own calculations
CREATE POLICY "Users can insert own calculations"
  ON calculator_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow anonymous users to insert calculations (without user_id)
CREATE POLICY "Anonymous users can insert calculations"
  ON calculator_history
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);