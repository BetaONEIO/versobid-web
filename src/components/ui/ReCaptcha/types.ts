export interface ReCaptchaProps {
  onChange: (token: string | null) => void;
  error?: string | null;
}