export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
}

export type UserRole = 'buyer' | 'seller';