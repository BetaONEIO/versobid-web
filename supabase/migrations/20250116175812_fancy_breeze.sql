-- Create storage bucket for wanted items
INSERT INTO storage.buckets (id, name, public)
VALUES ('wanted-items', 'wanted-items', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow authenticated users to upload images
CREATE POLICY "Users can upload wanted item images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'wanted-items' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own images
CREATE POLICY "Users can update their own wanted item images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'wanted-items' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own wanted item images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'wanted-items' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to wanted item images
CREATE POLICY "Public can view wanted item images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'wanted-items');

-- Add image_url column to items table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'items' 
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE items ADD COLUMN image_url TEXT;
  END IF;
END $$;