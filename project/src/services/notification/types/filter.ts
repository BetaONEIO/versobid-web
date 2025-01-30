import { NotificationType } from '../../../types/notification';

export interface NotificationFilter {
  type?: NotificationType;
  read?: boolean;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export interface NotificationFilterOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'type' | 'read';
  sortOrder?: 'asc' | 'desc';
}

export interface NotificationFilterValidation {
  isValid: boolean;
  errors: string[];
}

export interface NotificationFilterConfig {
  maxLimit: number;
  defaultLimit: number;
  maxOffset: number;
  allowedSortFields: string[];
}