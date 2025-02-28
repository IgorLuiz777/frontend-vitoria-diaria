-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  city TEXT NOT NULL,
  age INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can read all users"
  ON users
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can update own user"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own user"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create addictions table
CREATE TABLE IF NOT EXISTS addictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Create supports table
CREATE TABLE IF NOT EXISTS supports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id UUID REFERENCES users(id),
  recipient_id UUID NOT NULL REFERENCES users(id),
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

-- Create policies for supports
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
