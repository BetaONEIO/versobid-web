-- Function to delete bids older than 14 days
CREATE OR REPLACE FUNCTION delete_old_pending_bids()
RETURNS void AS $$
BEGIN
  DELETE FROM bids 
  WHERE status = 'pending' 
    AND created_at < NOW() - INTERVAL '14 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run daily (using pg_cron extension)
-- Note: pg_cron needs to be enabled in the Supabase dashboard
-- This will run daily at 2 AM UTC
SELECT cron.schedule('delete-old-bids', '0 2 * * *', 'SELECT delete_old_pending_bids();');

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION delete_old_pending_bids() TO service_role; 