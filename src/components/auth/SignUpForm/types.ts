import { AuthFormData } from '../../../types';

export interface FormErrors {
  name: string | null;
  username: string | null;
  email: string | null;
  password: string | null;
}

export interface SignUpFormContentProps {
  formData: AuthFormData;
  errors: FormErrors;
  isLoading: boolean;
  authError: string | null;
  onChange: (field: keyof AuthFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}