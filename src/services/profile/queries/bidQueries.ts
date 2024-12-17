```typescript
import { createBaseQuery } from './base';
import { DbBid } from '../../../types/supabase';
import { QueryResult } from './types';

const baseQuery = createBaseQuery<'bids'>('bids');

export const bidQueries = {
  getUserBids: async (userId: string): Promise<QueryResult<DbBid>> => {
    const response = await baseQuery
      .select('*')
      .eq('bidder_id', userId)
      .order('created_at', { ascending: false });

    return {
      data: response.data,
      error: response.error
    };
  }
};
```