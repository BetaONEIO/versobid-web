-- Create storage bucket for wanted items\nINSERT INTO storage.buckets (id, name, public)\nVALUES ('wanted-items', 'wanted-items', true)\nON CONFLICT (id) DO NOTHING;
\n\n-- Create storage policy to allow authenticated users to upload images\nCREATE POLICY "Users can upload wanted item images"\nON storage.objects\nFOR INSERT\nTO authenticated\nWITH CHECK (\n  bucket_id = 'wanted-items' AND\n  (storage.foldername(name))[1] = auth.uid()::text\n);
\n\n-- Allow users to update their own images\nCREATE POLICY "Users can update their own wanted item images"\nON storage.objects\nFOR UPDATE\nTO authenticated\nUSING (\n  bucket_id = 'wanted-items' AND\n  (storage.foldername(name))[1] = auth.uid()::text\n);
\n\n-- Allow users to delete their own images\nCREATE POLICY "Users can delete their own wanted item images"\nON storage.objects\nFOR DELETE\nTO authenticated\nUSING (\n  bucket_id = 'wanted-items' AND\n  (storage.foldername(name))[1] = auth.uid()::text\n);
\n\n-- Allow public access to wanted item images\nCREATE POLICY "Public can view wanted item images"\nON storage.objects\nFOR SELECT\nTO public\nUSING (bucket_id = 'wanted-items');
\n\n-- Add image_url column to items table if not exists\nDO $$ \nBEGIN\n  IF NOT EXISTS (\n    SELECT 1 FROM information_schema.columns \n    WHERE table_name = 'items' \n    AND column_name = 'image_url'\n  ) THEN\n    ALTER TABLE items ADD COLUMN image_url TEXT;
\n  END IF;
\nEND $$;
;
