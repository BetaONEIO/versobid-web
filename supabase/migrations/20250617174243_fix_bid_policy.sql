-- Fix the bid update policy to use correct field (buyer_id instead of seller_id)
DROP POLICY IF EXISTS "Sellers can update bid status" ON bids;

CREATE POLICY "Sellers can update bid status" ON bids
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM items 
  WHERE items.id = bids.item_id 
  AND bids.bidder_id = auth.uid()
)); 