import { AuthService } from './service/AuthService';
import type { AuthServiceInterface } from './types';

// Create and export singleton instance
export const authService: AuthServiceInterface = new AuthService();

// Export types
export * from './types';