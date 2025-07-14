import { useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { checkProfileCompletion, ProfileCompletionStatus } from '../utils/profileCompletion';

export const useProfileCompletion = (): ProfileCompletionStatus => {
  const { auth } = useUser();
  
  return useMemo(() => {
    return checkProfileCompletion(auth.user);
  }, [auth.user]);
}; 