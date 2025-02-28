-- Create addictions table
CREATE TABLE IF NOT EXISTS addictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  daily_cost NUMERIC(10,2) NOT NULL,
  goal_days INTEGER NOT NULL,
  check_ins INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  saved NUMERIC(10,2) DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create check_ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  addiction_id UUID NOT NULL REFERENCES addictions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(addiction_id, date)
);

-- Enable Row Level Security
ALTER TABLE addictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Create policies for addictions
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
