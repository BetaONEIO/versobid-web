```sql
-- Create table for user-added search results
CREATE TABLE IF NOT EXISTS user_added_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  condition TEXT NOT NULL,
  brand TEXT,
  description TEXT,
  image_url TEXT,
  search_query TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_added_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all user-added results"
  ON user_added_results
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add their own results"
  ON user_added_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_added_results_user_id ON user_added_results(user_id);
CREATE INDEX idx_user_added_results_search_query ON user_added_results(search_query);
CREATE INDEX idx_user_added_results_created_at ON user_added_results(created_at);

-- Grant permissions
GRANT ALL ON user_added_results TO authenticated;
```