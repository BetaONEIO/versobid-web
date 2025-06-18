-- Fix payments update policy to check buyer_id instead of seller_id
-- Only the buyer (item owner) should be able to update payment status

ALTER POLICY "payments_update_policy"
ON "public"."payments"
TO authenticated
USING (buyer_id = auth.uid()); 