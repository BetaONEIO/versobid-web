export const validateName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Full name is required';
  }
  if (name.length < 2) {
    return 'Full name must be at least 2 characters long';
  }
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return 'Full name can only contain letters, spaces, hyphens, and apostrophes';
  }
  return null;
};

export const validateUsername = (username: string | undefined): string | null => {
  if (!username?.trim()) {
    return 'Username is required';
  }
  if (username.length < 3) {
    return 'Username must be at least 3 characters long';
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return 'Username can only contain letters, numbers, underscores, and hyphens';
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
};

export const getPasswordStrength = (password: string): {
  score: number;
  requirements: { met: boolean; text: string }[];
} => {
  const requirements = [
    { met: password.length >= 8, text: 'At least 8 characters long' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(password), text: 'One lowercase letter' },
    { met: /[0-9]/.test(password), text: 'One number' },
    { met: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: 'One special character' }
  ];

  const score = requirements.filter(req => req.met).length;
  return { score, requirements };
};