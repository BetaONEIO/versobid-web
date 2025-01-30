/*
  # Create listings and bids tables

  1. New Tables
    - `listings`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `price` (numeric)
      - `seller_id` (uuid, references profiles)
      - `category` (text)
      - `status` (text)
      - `created_at` (timestamptz)
    - `bids`
      - `id` (uuid, primary key)
      - `listing_id` (uuid, references listings)
      - `bidder_id` (uuid, references profiles)
      - `amount` (numeric)
      - `status` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  seller_id UUID REFERENCES profiles(id) NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (status IN ('active', 'sold', 'archived'))
);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) NOT NULL,
  bidder_id UUID REFERENCES profiles(id) NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (status IN ('pending', 'accepted', 'rejected'))
);

-- Enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Listings policies
CREATE POLICY "Anyone can view active listings"
  ON listings
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create their own listings"
  ON listings
  FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own listings"
  ON listings
  FOR UPDATE
  USING (auth.uid() = seller_id);

-- Bids policies
CREATE POLICY "Users can view their own bids"
  ON bids
  FOR SELECT
  USING (auth.uid() = bidder_id);

CREATE POLICY "Sellers can view bids on their listings"
  ON bids
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM listings
    WHERE listings.id = bids.listing_id
    AND listings.seller_id = auth.uid()
  ));

CREATE POLICY "Users can create bids"
  ON bids
  FOR INSERT
  WITH CHECK (auth.uid() = bidder_id);

CREATE POLICY "Users can update their own bids"
  ON bids
  FOR UPDATE
  USING (auth.uid() = bidder_id);

-- Create indexes
CREATE INDEX listings_seller_id_idx ON listings(seller_id);
CREATE INDEX listings_category_idx ON listings(category);
CREATE INDEX listings_status_idx ON listings(status);
CREATE INDEX bids_listing_id_idx ON bids(listing_id);
CREATE INDEX bids_bidder_id_idx ON bids(bidder_id);