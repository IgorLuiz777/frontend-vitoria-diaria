/*
  # Create support system tables

  1. New Tables
    - `supports`
      - `id` (uuid, primary key)
      - `supporter_id` (uuid, references profiles.id, nullable)
      - `recipient_id` (uuid, references profiles.id)
      - `addiction_id` (uuid, references addictions.id)
      - `message` (text)
      - `duration` (integer)
      - `amount` (numeric)
      - `supporter_name` (text, nullable)
      - `hide_amount` (boolean)
      - `completed` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on supports table
    - Add policies for authenticated users to manage their own data
    - Add policy for public read access to support messages
*/

-- Create supports table
CREATE TABLE IF NOT EXISTS supports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id UUID REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  addiction_id UUID REFERENCES addictions(id),
  message TEXT NOT NULL,
  duration INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  supporter_name TEXT,
  hide_amount BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE supports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read supports they sent"
  ON supports
  FOR SELECT
  TO authenticated
  USING (supporter_id = auth.uid());

CREATE POLICY "Users can read supports they received"
  ON supports
  FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Public can read non-hidden supports"
  ON supports
  FOR SELECT
  TO anon
  USING (
    (hide_amount = false) OR
    (hide_amount = true AND completed = true)
  );

CREATE POLICY "Users can insert supports"
  ON supports
  FOR INSERT
  TO authenticated
  WITH CHECK (supporter_id = auth.uid());

CREATE POLICY "Users can update supports they sent"
  ON supports
  FOR UPDATE
  TO authenticated
  USING (supporter_id = auth.uid());
