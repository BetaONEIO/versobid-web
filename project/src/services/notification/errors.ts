export class NotificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotificationError';
  }
}

export class NotificationValidationError extends NotificationError {
  public errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.name = 'NotificationValidationError';
    this.errors = errors;
  }
}

export class NotificationNotFoundError extends NotificationError {
  constructor(notificationId: string) {
    super(`Notification not found: ${notificationId}`);
    this.name = 'NotificationNotFoundError';
  }
}