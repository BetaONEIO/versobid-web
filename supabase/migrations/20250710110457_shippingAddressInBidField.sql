-- Add shipping_address field to bids table
ALTER TABLE bids ADD COLUMN shipping_address JSONB;
