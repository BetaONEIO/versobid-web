import { AuthUser } from '../types/user';
import { Profile } from '../../profile/types';
import { SupabaseAuthUser } from '../types/user';

export const mapUserFromProfile = (
  profile: Profile,
  authUser: SupabaseAuthUser
): AuthUser => ({
  id: profile.id,
  name: profile.full_name || '',
  email: profile.email || '',
  username: profile.username || '',
  is_admin: profile.is_admin || false,
  email_verified: authUser.email_verified || false,
  shipping_address: profile.shipping_address || null,
  payment_setup: profile.payment_setup || false,
  onboarding_completed: profile.onboarding_completed || false
});