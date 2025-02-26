/*
  # Create addictions tracking tables

  1. New Tables
    - `addictions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `name` (text)
      - `icon` (text)
      - `daily_cost` (numeric)
      - `goal_days` (integer)
      - `start_date` (timestamp)
      - `visible` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `check_ins`
      - `id` (uuid, primary key)
      - `addiction_id` (uuid, references addictions.id)
      - `user_id` (uuid, references profiles.id)
      - `date` (date)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Add policy for public read access to visible addictions
*/

-- Create addictions table
CREATE TABLE IF NOT EXISTS addictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  daily_cost NUMERIC(10,2) NOT NULL,
  goal_days INTEGER NOT NULL,
  start_date TIMESTAMPTZ DEFAULT now(),
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create check_ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  addiction_id UUID NOT NULL REFERENCES addictions(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(addiction_id, date)
);

-- Enable Row Level Security
ALTER TABLE addictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Create policies for addictions
CREATE POLICY "Users can read own addictions"
  ON addictions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public can read visible addictions"
  ON addictions
  FOR SELECT
  TO anon
  USING (visible = true);

CREATE POLICY "Users can insert own addictions"
  ON addictions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own addictions"
  ON addictions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own addictions"
  ON addictions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for check_ins
CREATE POLICY "Users can read own check_ins"
  ON check_ins
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own check_ins"
  ON check_ins
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own check_ins"
  ON check_ins
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());