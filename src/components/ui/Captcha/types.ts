export interface CaptchaProps {
  onChange: (isValid: boolean) => void;
  error?: string | null;
}

export interface CaptchaState {
  challenge: string;
  answer: number;
  userAnswer: string;
}