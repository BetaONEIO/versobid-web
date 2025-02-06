import { User } from './user';

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  username?: string;
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

export interface AuthError {
  message: string;
  status?: number;
}