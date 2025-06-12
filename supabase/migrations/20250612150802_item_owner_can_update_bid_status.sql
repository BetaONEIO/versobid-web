CREATE POLICY "Buyers can update bids on their items" ON bids
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM items 
  WHERE items.id = bids.item_id 
  AND items.buyer_id = auth.uid()
));