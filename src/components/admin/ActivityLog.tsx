import React from 'react';
import { formatDate } from '../../utils/formatters';

interface ActivityLogProps {
  activities: Array<{
    id: string;
    action: string;
    target_type: string;
    details: any;
    created_at: string;
    admin: { username: string };
  }>;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ activities }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
      <div className="space-y-2">
        {activities.map((activity) => (
          <div 
            key={activity.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {activity.admin.username} - {activity.action}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.target_type}
                </p>
                {activity.details && (
                  <pre className="mt-2 text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded">
                    {JSON.stringify(activity.details, null, 2)}
                  </pre>
                )}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(activity.created_at)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};