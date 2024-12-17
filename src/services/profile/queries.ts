import { supabase } from '../../lib/supabase';
import { PROFILE_SELECT_FIELDS, RATING_SELECT_FIELDS, ITEM_SELECT_FIELDS } from './constants';

export const profileQueries = {
  // Query to fetch profile with ratings and reviewer username
  getProfile: (userId: string) =>
    supabase
      .from('profiles')
      .select(
        `
        ${PROFILE_SELECT_FIELDS},
        ratings (
          ${RATING_SELECT_FIELDS},
          reviewer:profiles ( username )
        )
        `.replace(/\s+/g, ' ') // Sanitize whitespace
      )
      .eq('id', userId)
      .single(),

  // Query to fetch items for a given seller_id
  getItems: (userId: string) =>
    supabase
      .from('items')
      .select(ITEM_SELECT_FIELDS)
      .eq('seller_id', userId)
      .order('created_at', { ascending: false }),

  // Query to fetch bids made by a user, including item details
  getBids: (userId: string) =>
    supabase
      .from('bids')
      .select(
        `
        id,
        amount,
        message,
        status,
        created_at,
        item:items ( ${ITEM_SELECT_FIELDS} )
        `.replace(/\s+/g, ' ') // Sanitize whitespace
      )
      .eq('bidder_id', userId)
      .order('created_at', { ascending: false }),
};