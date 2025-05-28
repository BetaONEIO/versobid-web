ALTER TABLE items ADD COLUMN buyer_id UUID REFERENCES profiles(id);
