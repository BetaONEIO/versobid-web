-- Create items table if it doesn't exist
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  min_price NUMERIC NOT NULL CHECK (min_price >= 0),
  max_price NUMERIC NOT NULL CHECK (max_price >= min_price),
  seller_id UUID REFERENCES profiles(id) NOT NULL,
  category TEXT NOT NULL,
  shipping_options JSONB DEFAULT '[]',
  condition TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (status IN ('active', 'completed', 'archived'))
);

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "items_select_policy"
  ON items
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "items_insert_policy"
  ON items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "items_update_policy"
  ON items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_items_seller_id ON items(seller_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);

-- Grant permissions
GRANT ALL ON items TO authenticated;
GRANT SELECT ON items TO anon;