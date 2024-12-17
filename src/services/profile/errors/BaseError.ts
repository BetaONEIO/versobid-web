export class BaseError extends Error {
  constructor(message: string, name = 'BaseError') {
    super(message);
    this.name = name;
  }
}