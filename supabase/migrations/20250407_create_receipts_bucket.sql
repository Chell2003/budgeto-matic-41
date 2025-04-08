
-- Create a storage bucket for receipt images
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'Receipt Images', true);

-- Allow authenticated users to upload files to the receipts bucket
CREATE POLICY "Allow authenticated users to upload receipt images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts' AND auth.uid() = owner);

-- Allow users to update their own files
CREATE POLICY "Allow users to update their own receipt images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'receipts' AND auth.uid() = owner);

-- Allow anyone to view receipt images
CREATE POLICY "Allow public access to view receipt images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'receipts');

-- Allow users to delete their own receipt images
CREATE POLICY "Allow users to delete their own receipt images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'receipts' AND auth.uid() = owner);

-- Add a receipt_url column to the transactions table if it doesn't exist
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS receipt_url TEXT;
