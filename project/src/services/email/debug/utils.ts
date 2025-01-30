export const formatDiagnosticMessage = (step: number, message: string): string => {
  return `${step}. ${message}`;
};

export const validateConfig = (config: { brevoApiKey?: string }): void => {
  if (!config.brevoApiKey) {
    throw new Error('Missing Brevo API key in configuration');
  }
};

export const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};