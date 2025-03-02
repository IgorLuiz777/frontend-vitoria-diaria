/*
  # Add goals functionality
  
  1. New Tables
    - `goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `name` (text)
      - `icon` (text)
      - `daily_target` (numeric)
      - `goal_days` (integer)
      - `check_ins` (integer)
      - `streak` (integer)
      - `progress` (integer)
      - `visible` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `goal_check_ins`
      - `id` (uuid, primary key)
      - `goal_id` (uuid, references goals)
      - `user_id` (uuid, references users)
      - `date` (date)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own goals
    - Add policies for public users to view visible goals
*/

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  daily_target NUMERIC(10,2) NOT NULL,
  goal_days INTEGER NOT NULL,
  check_ins INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create goal_check_ins table
CREATE TABLE IF NOT EXISTS goal_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(goal_id, date)
);

-- Enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_check_ins ENABLE ROW LEVEL SECURITY;

-- Create policies for goals
CREATE POLICY "Users can read own goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public can read visible goals"
  ON goals
  FOR SELECT
  TO anon
  USING (visible = true);

CREATE POLICY "Users can insert own goals"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own goals"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own goals"
  ON goals
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for goal_check_ins
CREATE POLICY "Users can read own goal_check_ins"
  ON goal_check_ins
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own goal_check_ins"
  ON goal_check_ins
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own goal_check_ins"
  ON goal_check_ins
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());