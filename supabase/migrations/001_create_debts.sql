-- Create enum type for debt type
CREATE TYPE debt_type AS ENUM ('owed_to_me', 'i_owe');

-- Create debts table
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type debt_type NOT NULL,
  counterpart_name TEXT NOT NULL,
  amount BIGINT NOT NULL,
  note TEXT,
  due_date DATE,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only SELECT their own debts
CREATE POLICY "Users can view their own debts"
  ON debts FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only INSERT their own debts
CREATE POLICY "Users can insert their own debts"
  ON debts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own debts
CREATE POLICY "Users can update their own debts"
  ON debts FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can only DELETE their own debts
CREATE POLICY "Users can delete their own debts"
  ON debts FOR DELETE
  USING (auth.uid() = user_id);

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS set_updated_at ON debts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON debts
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
