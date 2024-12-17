```typescript
import { PostgrestError } from '@supabase/supabase-js';

export interface QueryResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

export interface QueryListResult<T> {
  data: T[] | null;
  error: PostgrestError | null;
}
```