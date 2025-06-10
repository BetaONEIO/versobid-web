-- Add counter_amount column to bids table
ALTER TABLE bids ADD COLUMN counter_amount DECIMAL(10,2) DEFAULT NULL;

-- Add index for better performance on counter amount queries
CREATE INDEX idx_bids_counter_amount ON bids(counter_amount) WHERE counter_amount IS NOT NULL; 