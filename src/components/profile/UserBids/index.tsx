import React from 'react';
import { UserBidsContent } from './UserBidsContent';
import { UserBidsProps } from './types';

export const UserBids: React.FC<UserBidsProps> = (props) => {
  return <UserBidsContent {...props} />;
};