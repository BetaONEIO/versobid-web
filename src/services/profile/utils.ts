import { Profile } from './types';
import { PROFILE_CONSTRAINTS } from './constants';
import { Database } from '../../types/supabase';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export const isValidUsername = (username: string): boolean => {
  if (!username) return false;
  if (username.length < PROFILE_CONSTRAINTS.USERNAME_MIN_LENGTH) return false;
  if (username.length > PROFILE_CONSTRAINTS.USERNAME_MAX_LENGTH) return false;
  return PROFILE_CONSTRAINTS.USERNAME_PATTERN.test(username);
};

export const isValidName = (name: string): boolean => {
  if (!name) return false;
  if (name.length < PROFILE_CONSTRAINTS.NAME_MIN_LENGTH) return false;
  if (name.length > PROFILE_CONSTRAINTS.NAME_MAX_LENGTH) return false;
  return PROFILE_CONSTRAINTS.NAME_PATTERN.test(name);
};

export const sanitizeProfile = (profile: Partial<Profile>): ProfileUpdate => {
  const sanitized: ProfileUpdate = {};

  if (profile.username) {
    sanitized.username = profile.username.trim().toLowerCase();
  }

  if (profile.full_name) {
    sanitized.full_name = profile.full_name.trim();
  }

  if (profile.email) {
    sanitized.email = profile.email.trim().toLowerCase();
  }

  if (profile.avatar_url !== undefined) {
    sanitized.avatar_url = profile.avatar_url;
  }

  if (profile.is_admin !== undefined) {
    sanitized.is_admin = profile.is_admin;
  }

  if (profile.shipping_address !== undefined) {
    sanitized.shipping_address = profile.shipping_address;
  }

  if (profile.payment_setup !== undefined) {
    sanitized.payment_setup = profile.payment_setup;
  }

  if (profile.onboarding_completed !== undefined) {
    sanitized.onboarding_completed = profile.onboarding_completed;
  }

  return sanitized;
};

export const formatProfileError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};