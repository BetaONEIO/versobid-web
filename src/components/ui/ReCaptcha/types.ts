export interface ReCaptchaProps {
  onChange: (isValid: boolean) => void;
  error?: string | null;
}