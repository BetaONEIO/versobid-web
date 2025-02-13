-- Add onboarding fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS shipping_address JSONB,
ADD COLUMN IF NOT EXISTS payment_setup BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Create index for onboarding status
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);

-- Create function to check onboarding status
CREATE OR REPLACE FUNCTION check_onboarding_status(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND shipping_address IS NOT NULL
    AND payment_setup = true
    AND onboarding_completed = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy for onboarding fields
CREATE POLICY "Users can update their own onboarding status"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create function to complete onboarding
CREATE OR REPLACE FUNCTION complete_onboarding(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles
  SET onboarding_completed = true
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add notification for incomplete onboarding
CREATE OR REPLACE FUNCTION notify_incomplete_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.onboarding_completed = false THEN
    INSERT INTO notifications (
      user_id,
      type,
      message,
      data
    ) VALUES (
      NEW.id,
      'onboarding_reminder',
      'Complete your profile setup to start using all features',
      jsonb_build_object(
        'onboarding_step', 
        CASE 
          WHEN NEW.shipping_address IS NULL THEN 'address'
          WHEN NEW.payment_setup = false THEN 'payment'
          ELSE 'incomplete'
        END
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for incomplete onboarding notifications
DROP TRIGGER IF EXISTS notify_incomplete_onboarding_trigger ON profiles;
CREATE TRIGGER notify_incomplete_onboarding_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_incomplete_onboarding();