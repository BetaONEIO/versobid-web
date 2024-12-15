import { User } from '../../types/user';
import { AuthFormData } from '../../types/auth';

export interface AuthServiceInterface {
  login: (identifier: string, password: string) => Promise<User>;
  signup: (formData: AuthFormData) => Promise<User>;
  requestPasswordReset: (email: string) => Promise<void>;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface SignupResponse {
  user: User;
  message: string;
}

export interface AuthError {
  message: string;
  code?: string;
}