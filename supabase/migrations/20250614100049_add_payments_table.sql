-- Add 'paid' status to bids table
ALTER TABLE bids DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE bids ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'rejected', 'countered', 'paid'));

-- Add new columns to existing payments table for PayPal integration
ALTER TABLE payments ADD COLUMN IF NOT EXISTS bid_id UUID REFERENCES bids(id) ON DELETE CASCADE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paypal_order_id TEXT UNIQUE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS processing_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_payments_bid_id ON payments(bid_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_paypal_order_id ON payments(paypal_order_id);

-- Add service role policy for webhook access (existing RLS policies remain)
CREATE POLICY "Service role can manage all payments" ON payments
  FOR ALL USING (auth.role() = 'service_role');

-- Update notification types to include payment events
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS valid_notification_types;
ALTER TABLE notifications ADD CONSTRAINT valid_notification_types 
  CHECK (type IN ('success', 'error', 'info', 'warning', 'bid_received', 'bid_accepted', 'bid_rejected', 'bid_countered', 'payment_received', 'payment_confirmed', 'payment_failed', 'payment_cancelled', 'shipping_update', 'item_sold', 'email_verification', 'onboarding_reminder', 'service_booked', 'service_completed'));
