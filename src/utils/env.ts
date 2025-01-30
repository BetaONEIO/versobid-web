import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL').min(1, 'Supabase URL is required'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  VITE_PAYPAL_CLIENT_ID: z.string().optional(),
  VITE_SERPAPI_KEY: z.string().optional(),
  VITE_RESEND_API_KEY: z.string().optional()
});

// Type for validated env
type EnvSchema = z.infer<typeof envSchema>;

// Cache for validated env
let validatedEnv: EnvSchema | null = null;

export const validateEnv = (): boolean => {
  try {
    // Only validate once
    if (validatedEnv) return true;

    // Get all env variables
    const env = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_PAYPAL_CLIENT_ID: import.meta.env.VITE_PAYPAL_CLIENT_ID,
      VITE_SERPAPI_KEY: import.meta.env.VITE_SERPAPI_KEY,
      VITE_RESEND_API_KEY: import.meta.env.VITE_RESEND_API_KEY
    };

    // Log environment check (but don't expose sensitive data)
    console.log('Environment check:', {
      hasSupabaseUrl: !!env.VITE_SUPABASE_URL,
      hasSupabaseKey: !!env.VITE_SUPABASE_ANON_KEY,
      hasPaypalClientId: !!env.VITE_PAYPAL_CLIENT_ID,
      hasSerpApiKey: !!env.VITE_SERPAPI_KEY,
      hasResendApiKey: !!env.VITE_RESEND_API_KEY
    });

    // Validate env
    const result = envSchema.safeParse(env);

    if (!result.success) {
      const errors = result.error.errors.map(e => `${e.path}: ${e.message}`);
      console.error('Environment validation failed:', errors.join(', '));
      return false;
    }

    // Cache validated env
    validatedEnv = result.data;
    return true;
  } catch (error) {
    console.error('Error validating environment:', error);
    return false;
  }
};

export const getEnvVar = <T extends keyof EnvSchema>(
  key: T,
  required = false
): EnvSchema[T] | undefined => {
  // Ensure env is validated
  if (!validatedEnv && !validateEnv()) {
    if (required) {
      throw new Error('Environment not properly configured');
    }
    return undefined;
  }

  const value = validatedEnv![key];
  if (!value && required) {
    throw new Error(`Required environment variable ${key} is not set`);
  }

  return value;
};

// Helper to check if all required vars are set
export const hasRequiredEnvVars = (): boolean => {
  return validateEnv() && !!getEnvVar('VITE_SUPABASE_URL') && !!getEnvVar('VITE_SUPABASE_ANON_KEY');
};