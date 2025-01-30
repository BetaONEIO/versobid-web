-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON payments;

-- Add rating column to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'rating'
  ) THEN
    ALTER TABLE profiles ADD COLUMN rating INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create function to update seller rating if it doesn't exist
CREATE OR REPLACE FUNCTION update_seller_rating(
  seller_id UUID,
  rating_change INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET rating = rating + rating_change
  WHERE id = seller_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check shipping deadlines if it doesn't exist
CREATE OR REPLACE FUNCTION check_shipping_deadlines()
RETURNS void AS $$
DECLARE
  payment RECORD;
BEGIN
  FOR payment IN
    SELECT *
    FROM payments
    WHERE status = 'completed'
    AND shipping_deadline < NOW()
    AND shipping_confirmed = false
  LOOP
    -- Apply negative rating
    PERFORM update_seller_rating(payment.seller_id, -1);
    
    -- Create notifications
    INSERT INTO notifications (user_id, type, message, data)
    VALUES
      (payment.buyer_id, 'shipping_overdue', 
       'Seller failed to ship item in time. A negative rating has been applied.',
       jsonb_build_object('payment_id', payment.id)),
      (payment.seller_id, 'negative_rating',
       'You received a negative rating for failing to ship item on time.',
       jsonb_build_object('payment_id', payment.id));
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new policies with unique names
CREATE POLICY "payments_select_policy"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    buyer_id = auth.uid() OR 
    seller_id = auth.uid()
  );

CREATE POLICY "payments_update_policy"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (
    seller_id = auth.uid()
  );

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_payments_buyer_id ON payments(buyer_id);
CREATE INDEX IF NOT EXISTS idx_payments_seller_id ON payments(seller_id);
CREATE INDEX IF NOT EXISTS idx_payments_item_id ON payments(item_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_shipping_deadline ON payments(shipping_deadline);