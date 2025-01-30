/*
  # Create bids table and policies

  1. New Tables
    - `bids`
      - `id` (uuid, primary key)
      - `item_id` (uuid, references items)
      - `bidder_id` (uuid, references profiles)
      - `amount` (numeric)
      - `message` (text, optional)
      - `status` (text: pending/accepted/rejected)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for bidders and sellers
    - Create necessary indexes
*/

-- Drop existing bids table if it exists
DROP TABLE IF EXISTS bids CASCADE;

-- Create bids table
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  bidder_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'rejected'))
);

-- Enable RLS
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Bidders can view their own bids"
  ON bids
  FOR SELECT
  TO authenticated
  USING (
    bidder_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = bids.item_id
      AND items.seller_id = auth.uid()
    )
  );

CREATE POLICY "Users can create bids on others' items"
  ON bids
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bidder_id = auth.uid() AND
    NOT EXISTS (
      SELECT 1 FROM items
      WHERE items.id = bids.item_id
      AND items.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update bid status"
  ON bids
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = bids.item_id
      AND items.seller_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_bids_item_id ON bids(item_id);
CREATE INDEX idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX idx_bids_status ON bids(status);

-- Grant permissions
GRANT ALL ON bids TO authenticated;