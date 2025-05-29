-- Update the items_update_policy to allow both buyer and seller to update
alter policy "items_update_policy"
on "public"."items"
to authenticated
using (
  (auth.uid() = seller_id OR auth.uid() = buyer_id)
)
with check (
  (auth.uid() = seller_id OR auth.uid() = buyer_id)
);
