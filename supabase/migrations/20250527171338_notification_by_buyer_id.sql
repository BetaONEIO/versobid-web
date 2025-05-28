CREATE OR REPLACE FUNCTION "public"."create_bid_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, type, message, data)
    SELECT 
      COALESCE(items.seller_id, items.buyer_id),  -- Use buyer_id if seller_id is null
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
    INSERT INTO public.notifications (user_id, type, message, data)
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
END;$$;