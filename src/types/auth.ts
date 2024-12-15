import { User } from './user';

export interface AuthFormData {
  email: string;
  password: string;
  name: string;
  username: string;
  acceptedTerms: boolean;
  captchaValid?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}