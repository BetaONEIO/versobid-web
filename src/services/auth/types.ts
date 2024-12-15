import { User } from '../../types/user';
import { AuthFormData } from '../../types/auth';

export interface AuthServiceInterface {
  login: (identifier: string, password: string, captchaToken?: string) => Promise<User>;
  signup: (formData: AuthFormData) => Promise<User>;
  requestPasswordReset: (email: string) => Promise<void>;
}