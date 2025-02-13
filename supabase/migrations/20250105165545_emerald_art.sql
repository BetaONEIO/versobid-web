-- Drop existing items table
DROP TABLE IF EXISTS items CASCADE;

-- Create items table with correct structure
CREATE TABLE items (
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
CREATE POLICY "Anyone can view active items"
  ON items
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create their own items"
  ON items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own items"
  ON items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Create indexes
CREATE INDEX items_seller_id_idx ON items(seller_id);
CREATE INDEX items_category_idx ON items(category);
CREATE INDEX items_status_idx ON items(status);