import React from 'react';
import { UserRatingsContent } from './UserRatingsContent';
import { UserRatingsProps } from './types';

export const UserRatings: React.FC<UserRatingsProps> = (props) => {
  return <UserRatingsContent {...props} />;
};