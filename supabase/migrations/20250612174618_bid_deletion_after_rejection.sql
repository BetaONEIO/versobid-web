-- RLS policy to allow bid deletion by buyer (who receives bids) and seller (who made the bid)
CREATE POLICY "Users can delete their own bids or bids on their items" ON bids
  FOR DELETE USING (
    bidder_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = bids.item_id 
      AND items.buyer_id = auth.uid()
    )
  );
