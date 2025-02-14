import { User } from '../../types/user';
import { AuthFormData } from '../../types/auth';

export interface AuthService {
  login: (identifier: string, password: string) => Promise<User>;
  signup: (formData: AuthFormData) => Promise<User>;
  requestPasswordReset: (email: string) => Promise<void>;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  error?: string;
}

export interface AuthValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface AuthConfig {
  redirectUrl: string;
  emailConfirmation: boolean;
  passwordResetUrl: string;
}