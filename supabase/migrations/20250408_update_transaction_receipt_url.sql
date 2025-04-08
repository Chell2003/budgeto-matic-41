
-- Check if receipt_url column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'transactions' 
    AND column_name = 'receipt_url'
  ) THEN
    ALTER TABLE public.transactions ADD COLUMN receipt_url TEXT;
  END IF;
END $$;
