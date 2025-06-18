ALTER TABLE bids DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE bids ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'rejected', 'countered', 'paid', 'confirmed'));