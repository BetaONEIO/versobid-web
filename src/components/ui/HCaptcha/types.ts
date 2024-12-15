export interface HCaptchaProps {
  onChange: (token: string) => void;
  error?: string | null;
}