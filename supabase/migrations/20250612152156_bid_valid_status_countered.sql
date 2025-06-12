ALTER TABLE bids DROP CONSTRAINT valid_status;
ALTER TABLE bids ADD CONSTRAINT valid_status CHECK (status = ANY (ARRAY['pending', 'accepted', 'rejected', 'countered']));
