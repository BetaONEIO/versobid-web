import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(20, 'Invalid Supabase anon key'),
  VITE_PAYPAL_STAGING_CLIENT_ID: z.string().optional(),
  VITE_PAYPAL_PRODUCTION_CLIENT_ID: z.string().optional(),
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
      VITE_PAYPAL_STAGING_CLIENT_ID: import.meta.env.VITE_PAYPAL_STAGING_CLIENT_ID,
      VITE_PAYPAL_PRODUCTION_CLIENT_ID: import.meta.env.VITE_PAYPAL_PRODUCTION_CLIENT_ID,
      VITE_SERPAPI_KEY: import.meta.env.VITE_SERPAPI_KEY,
      VITE_RESEND_API_KEY: import.meta.env.VITE_RESEND_API_KEY
    };

    // Validate env
    const result = envSchema.safeParse(env);

    if (!result.success) {
      console.error('Environment validation failed:', 
        result.error.errors.map(e => `${e.path}: ${e.message}`).join(', ')
      );
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

// Helper to get PayPal client ID based on environment
export const getPayPalClientId = (): string => {
  const isProduction = import.meta.env.PROD;
  
  if (isProduction) {
    const productionClientId = getEnvVar('VITE_PAYPAL_PRODUCTION_CLIENT_ID');
    if (productionClientId) {
      return productionClientId;
    }
  }
  
  const stagingClientId = getEnvVar('VITE_PAYPAL_STAGING_CLIENT_ID');
  if (stagingClientId) {
    return stagingClientId;
  }
  
  // Fallback for development
  return "test";
};

// Helper to check if all required vars are set
export const hasRequiredEnvVars = (): boolean => {
  return validateEnv() && !!getEnvVar('VITE_SUPABASE_URL') && !!getEnvVar('VITE_SUPABASE_ANON_KEY');
}