import React from 'react';
import { BidActionsContent } from './BidActionsContent';
import { BidActionsProps } from './types';

export const BidActions: React.FC<BidActionsProps> = (props) => {
  return <BidActionsContent {...props} />;
};