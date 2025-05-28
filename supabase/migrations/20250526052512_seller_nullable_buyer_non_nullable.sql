-- 1. Make seller_id nullable
ALTER TABLE public.items
ALTER COLUMN seller_id DROP NOT NULL;

-- 2. Make buyer_id NOT NULL
ALTER TABLE public.items
ALTER COLUMN buyer_id SET NOT NULL;