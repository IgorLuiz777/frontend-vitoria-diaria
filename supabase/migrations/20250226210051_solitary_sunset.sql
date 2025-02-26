/*
  # Initial Schema Setup for Vida Nova App

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text, user's full name)
      - `username` (text, unique, for profile URLs)
      - `age` (integer, user's age)
      - `city` (text, user's location)
      - `bio` (text, optional user description)
      - `image_url` (text, optional profile image)
      - `created_at` (timestamp)
    
    - `addictions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text, addiction name)
      - `icon` (text, icon identifier)
      - `daily_cost` (numeric, estimated daily cost)
      - `goal_days` (integer, target days)
      - `check_ins` (integer, successful check-ins)
      - `streak` (integer, current streak)
      - `progress` (integer, percentage progress)
      - `saved` (numeric, money saved)
      - `visible` (boolean, profile visibility)
      - `created_at` (timestamp)
    
    - `supports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `supporter_name` (text, optional supporter name)
      - `message` (text, support message)
      - `duration` (integer, goal duration in days)
      - `amount` (numeric, support amount)
      - `hide_amount` (boolean, visibility of amount)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public access to visible addiction data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  username text UNIQUE NOT NULL,
  age integer NOT NULL,
  city text NOT NULL,
  bio text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create addictions table
CREATE TABLE IF NOT EXISTS addictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL,
  daily_cost numeric NOT NULL,
  goal_days integer NOT NULL,
  check_ins integer DEFAULT 0,
  streak integer DEFAULT 0,
  progress integer DEFAULT 0,
  saved numeric DEFAULT 0,
  visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create supports table
CREATE TABLE IF NOT EXISTS supports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  supporter_name text,
  message text NOT NULL,
  duration integer NOT NULL,
  amount numeric NOT NULL,
  hide_amount boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE supports ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Addictions policies
CREATE POLICY "Users can read own addictions"
  ON addictions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can read visible addictions"
  ON addictions
  FOR SELECT
  TO anon
  USING (visible = true);

CREATE POLICY "Users can insert own addictions"
  ON addictions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addictions"
  ON addictions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addictions"
  ON addictions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Supports policies
CREATE POLICY "Users can read supports for their addictions"
  ON supports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert supports"
  ON supports
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can update own supports"
  ON supports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);