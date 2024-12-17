import React from 'react';
import { ProfileHeaderContent } from './ProfileHeaderContent';
import { ProfileHeaderProps } from './types';

export const ProfileHeader: React.FC<ProfileHeaderProps> = (props) => {
  return <ProfileHeaderContent {...props} />;
};