-- Add INSERT policy for payments table
-- Allows authenticated users to insert payments where they are the buyer

CREATE POLICY "payments_insert_policy" 
ON "public"."payments" 
FOR INSERT 
TO authenticated 
WITH CHECK (buyer_id = auth.uid()); 