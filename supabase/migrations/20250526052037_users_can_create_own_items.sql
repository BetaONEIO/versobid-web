DROP POLICY IF EXISTS "Users can create their own items" ON "public"."items";

CREATE POLICY "Users can create their own or wanted items"
  ON "public"."items"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (
    (auth.uid() = seller_id) OR (auth.uid() = buyer_id)
  );