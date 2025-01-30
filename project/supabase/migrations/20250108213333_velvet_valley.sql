-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  data JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Create function to create bid notifications
CREATE OR REPLACE FUNCTION create_bid_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify seller of new bid
  IF TG_OP = 'INSERT' THEN
    INSERT INTO notifications (user_id, type, message, data)
    SELECT 
      items.seller_id,
      'bid_received',
      'You received a new bid on ' || items.title,
      jsonb_build_object(
        'bid_id', NEW.id,
        'item_id', NEW.item_id,
        'amount', NEW.amount
      )
    FROM items
    WHERE items.id = NEW.item_id;
  END IF;

  -- Notify bidder of bid status change
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO notifications (user_id, type, message, data)
    SELECT 
      NEW.bidder_id,
      'bid_' || NEW.status,
      CASE NEW.status
        WHEN 'accepted' THEN 'Your bid was accepted!'
        WHEN 'rejected' THEN 'Your bid was rejected'
        ELSE 'Your bid status was updated to ' || NEW.status
      END,
      jsonb_build_object(
        'bid_id', NEW.id,
        'item_id', NEW.item_id,
        'status', NEW.status
      );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for bid notifications
DROP TRIGGER IF EXISTS on_bid_created ON bids;
CREATE TRIGGER on_bid_created
  AFTER INSERT ON bids
  FOR EACH ROW
  EXECUTE FUNCTION create_bid_notification();

DROP TRIGGER IF EXISTS on_bid_updated ON bids;
CREATE TRIGGER on_bid_updated
  AFTER UPDATE OF status ON bids
  FOR EACH ROW
  EXECUTE FUNCTION create_bid_notification();