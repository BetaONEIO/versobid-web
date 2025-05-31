CREATE POLICY "Bidders can view bids" ON "public"."bids" 
FOR SELECT TO "authenticated" 
USING (
  ("bidder_id" = "auth"."uid"()) OR 
  (EXISTS ( 
    SELECT 1
    FROM "public"."items"
    WHERE ("items"."id" = "bids"."item_id") AND 
    ("items"."seller_id" = "auth"."uid"() OR "items"."buyer_id" = "auth"."uid"())
  ))
);
