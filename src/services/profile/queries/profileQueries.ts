import { supabase } from '../../../lib/supabase';
import { DbProfile } from '../../../types/supabase';
import { QueryResult } from './types';
import { PROFILE_SELECT_FIELDS, RATING_SELECT_FIELDS } from '../constants/queryFields';

export const profileQueries = {
  getProfile: async (userId: string): Promise<QueryResult<DbProfile>> => {
    try {
      const response = await supabase
        .from('profiles')
        .select(`
          ${PROFILE_SELECT_FIELDS},
          ratings (
            ${RATING_SELECT_FIELDS},
            reviewer:profiles (username)
          )
        `)
        .eq('id', userId)
        .single();

      return {
        data: response.data,
        error: response.error
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  },

  create: async (profile: Partial<DbProfile>): Promise<QueryResult<DbProfile>> => {
    try {
      const response = await supabase
        .from('profiles')
        .insert([profile])
        .select()
        .single();

      return {
        data: response.data,
        error: response.error
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }
};