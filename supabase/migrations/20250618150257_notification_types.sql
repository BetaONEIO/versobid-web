-- Add 'bid_confirmed' to valid notification types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS valid_notification_types;
ALTER TABLE notifications ADD CONSTRAINT valid_notification_types 
  CHECK (type IN ('success', 'error', 'info', 'warning', 'bid_received', 'bid_accepted', 'bid_rejected', 'bid_countered', 'bid_confirmed', 'payment_received', 'payment_confirmed', 'payment_failed', 'payment_cancelled', 'payout_sent', 'payout_failed', 'shipping_update', 'item_sold', 'email_verification', 'onboarding_reminder', 'service_booked', 'service_completed'));
