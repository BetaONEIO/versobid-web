export interface GenericStringError extends String {
  error: true;
  message: string;
}