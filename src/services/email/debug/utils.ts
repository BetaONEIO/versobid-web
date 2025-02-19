export const validateConfig = (config: { resendApiKey?: string }): void => {
  if (!config.resendApiKey) {
    throw new Error('Missing Resend API key in configuration');
  }
};

export const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};