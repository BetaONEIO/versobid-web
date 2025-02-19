-- Add type and service_details columns to items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('item', 'service')) DEFAULT 'item',
ADD COLUMN IF NOT EXISTS service_details JSONB;

-- Create index for type column
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);

-- Update existing policies to handle service listings
DROP POLICY IF EXISTS "Anyone can view active items" ON items;
CREATE POLICY "Anyone can view active listings"
  ON items
  FOR SELECT
  USING (status = 'active');

-- Create function to validate service details
CREATE OR REPLACE FUNCTION validate_service_details()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate if this is a service type item
  IF NEW.type = 'service' THEN
    -- Check if service_details is present and has required fields
    IF NEW.service_details IS NULL OR 
       NOT (NEW.service_details ? 'rateType' AND 
            NEW.service_details ? 'availability' AND
            NEW.service_details ? 'remote') THEN
      RAISE EXCEPTION 'Service listings must include rate type, availability, and remote work status';
    END IF;
    
    -- Validate rate type
    IF NOT (NEW.service_details->>'rateType' IN ('hourly', 'fixed', 'project')) THEN
      RAISE EXCEPTION 'Invalid rate type for service';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for service validation
DROP TRIGGER IF EXISTS validate_service_trigger ON items;
CREATE TRIGGER validate_service_trigger
  BEFORE INSERT OR UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION validate_service_details();

-- Add service-specific notification types
DO $$ 
BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'service_booked';
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'service_completed';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;