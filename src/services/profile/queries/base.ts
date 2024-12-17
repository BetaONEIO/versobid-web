```typescript
import { supabase } from '../../../lib/supabase';
import { PostgrestFilterBuilder, PostgrestSingleResponse } from '@supabase/postgrest-js';
import { Database } from '../../../types/supabase';

type TableName = keyof Database['public']['Tables'];
type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];

export const createBaseQuery = <T extends TableName>(tableName: T) => ({
  select: (query: string): PostgrestFilterBuilder<Database, Row<T>, Row<T>[], T> =>
    supabase
      .from(tableName)
      .select(query),
      
  selectSingle: (query: string): Promise<PostgrestSingleResponse<Row<T>>> =>
    supabase
      .from(tableName)
      .select(query)
      .single(),

  create: (data: Partial<Row<T>>): Promise<PostgrestSingleResponse<Row<T>>> =>
    supabase
      .from(tableName)
      .insert([data])
      .select()
      .single(),

  update: (id: string, data: Partial<Row<T>>): Promise<PostgrestSingleResponse<Row<T>>> =>
    supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single(),

  delete: (id: string) =>
    supabase
      .from(tableName)
      .delete()
      .eq('id', id)
});
```