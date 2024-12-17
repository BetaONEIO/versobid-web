export const PROFILE_SELECT_FIELDS = `
  id,
  username,
  full_name,
  email,
  avatar_url,
  bio,
  created_at
`;

export const RATING_SELECT_FIELDS = `
  id,
  rating,
  comment,
  created_at,
  reviewer_id
`;

export const ITEM_SELECT_FIELDS = `
  id,
  title,
  description,
  price,
  seller_id,
  category,
  shipping_options,
  created_at
`;

export const ERROR_MESSAGES = {
  PROFILE_NOT_FOUND: 'Profile not found',
  VALIDATION_FAILED: 'Validation failed',
  UNAUTHORIZED: 'Unauthorized access'
};

export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_-]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 100,
    PATTERN: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s'-]+$/
  }
};