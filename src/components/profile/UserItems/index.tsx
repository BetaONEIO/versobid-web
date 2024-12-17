import React from 'react';
import { UserItemsContent } from './UserItemsContent';
import { UserItemsProps } from './types';

export const UserItems: React.FC<UserItemsProps> = (props) => {
  return <UserItemsContent {...props} />;
};