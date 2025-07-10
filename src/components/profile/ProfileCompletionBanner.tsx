import { useUser } from '../../contexts/UserContext';
import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ProfileCompletionStatus, getProfileCompletionSteps } from '../../utils/profileCompletion';

interface ProfileCompletionBannerProps {
  status: ProfileCompletionStatus;
  action?: 'list' | 'bid';
  className?: string;
}

export const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = ({ 
  status, 
  action,
  className = '' 
}) => {
  const { auth } = useUser();
  const username = auth.user?.username;

  // Don't show banner if profile is complete
  if (status.isComplete) {
    return null;
  }

  // Don't show banner if user can perform the specific action
  if (action === 'list' && status.canList) {
    return null;
  }
  if (action === 'bid' && status.canBid) {
    return null;
  }

  const steps = getProfileCompletionSteps(status);
  const incompleteSteps = steps.filter(step => !step.completed);

  const getBannerMessage = () => {
    if (action === 'list' && !status.canList) {
      return 'Complete your profile to start listing items';
    }
    if (action === 'bid' && !status.canBid) {
      return 'Complete your profile to place bids';
    }
    return 'Complete your profile to access all features';
  };

  return (
    <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            {getBannerMessage()}
          </h3>
          <div className="mt-2">
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              <p className="mb-2">Missing requirements:</p>
              <ul className="space-y-1">
                {incompleteSteps.map((step, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-4 h-4 rounded-full border-2 border-yellow-500 mr-2 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    </div>
                    <span>{step.step}: {step.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4">
            <Link
            to={`/profile/${username}?edit=true`}
            className="text-sm font-medium text-yellow-800 dark:text-yellow-200 underline hover:text-yellow-900 dark:hover:text-yellow-100"
            >
              Complete your profile →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Variant for showing completion progress
export const ProfileCompletionProgress: React.FC<{ status: ProfileCompletionStatus }> = ({ status }) => {
  const { auth } = useUser();
  const username = auth.user?.username;
  const steps = getProfileCompletionSteps(status);
  const completedCount = steps.filter(step => step.completed).length;
  const progressPercentage = (completedCount / steps.length) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Profile Setup
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {completedCount}/{steps.length} completed
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
        <div 
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              {step.completed ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                step.completed 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {step.step}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!status.isComplete && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            to={`/profile/${username}?edit=true`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            Complete Profile
          </Link>
        </div>
      )}
    </div>
  );
}; 