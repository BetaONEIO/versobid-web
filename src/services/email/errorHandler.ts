export class EmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailError';
  }
}

export const handleEmailError = (error: unknown): EmailError => {
  if (error instanceof EmailError) {
    return error;
  }

  if (error instanceof Error) {
    return new EmailError(error.message);
  }

  return new EmailError('An unknown error occurred while sending email');
};