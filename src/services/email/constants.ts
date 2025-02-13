export const EMAIL_ERRORS = {
  INVALID_RECIPIENT: 'Invalid recipient email address',
  INVALID_TEMPLATE: 'Invalid email template',
  MISSING_PARAMS: 'Missing required template parameters',
  SEND_FAILED: 'Failed to send email',
  TEMPLATE_NOT_FOUND: 'Email template not found',
  INVALID_CONFIG: 'Invalid email configuration'
} as const;

export const EMAIL_DEFAULTS = {
  FROM_ADDRESS: 'noreply@versobid.com',
  FROM_NAME: 'VersoBid',
  LANGUAGE: 'en',
  ENCODING: 'UTF-8',
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
} as const;

export type EmailErrorCode = keyof typeof EMAIL_ERRORS;