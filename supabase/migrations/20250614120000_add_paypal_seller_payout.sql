-- Add seller PayPal account fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS paypal_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS paypal_merchant_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS paypal_sandbox_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS paypal_sandbox_merchant_id TEXT;

-- Add payout tracking columns to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payout_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'));

-- Add index for payout status
CREATE INDEX IF NOT EXISTS idx_payments_payout_status ON payments(payout_status);

-- Update notification types to include payout events
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS valid_notification_types;
ALTER TABLE notifications ADD CONSTRAINT valid_notification_types 
  CHECK (type IN ('success', 'error', 'info', 'warning', 'bid_received', 'bid_accepted', 'bid_rejected', 'bid_countered', 'payment_received', 'payment_confirmed', 'payment_failed', 'payment_cancelled', 'payout_sent', 'payout_failed', 'shipping_update', 'item_sold', 'email_verification', 'onboarding_reminder', 'service_booked', 'service_completed')); 