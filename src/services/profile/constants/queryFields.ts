```typescript
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
```