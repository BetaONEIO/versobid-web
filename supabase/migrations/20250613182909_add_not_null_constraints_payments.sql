-- Add NOT NULL constraints to payments table
-- This ensures data integrity for required payment fields

-- Add NOT NULL constraint to item_id
ALTER TABLE payments 
ALTER COLUMN item_id SET NOT NULL;

-- Add NOT NULL constraint to buyer_id  
ALTER TABLE payments
ALTER COLUMN buyer_id SET NOT NULL;

-- Add NOT NULL constraint to seller_id
ALTER TABLE payments
ALTER COLUMN seller_id SET NOT NULL; 