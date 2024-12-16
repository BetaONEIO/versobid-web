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