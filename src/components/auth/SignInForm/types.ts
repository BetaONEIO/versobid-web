export interface SignInFormData {
  identifier: string;
  password: string;
  captchaValid?: boolean;
}

export interface FormErrors {
  identifier: string | null;
  password: string | null;
  captcha: string | null;
}

export interface SignInFormContentProps {
  formData: SignInFormData;
  errors: FormErrors;
  isLoading: boolean;
  authError: string | null;
  onChange: (field: keyof SignInFormData, value: string) => void;
  onCaptchaChange: (isValid: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}