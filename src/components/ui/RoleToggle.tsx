import React from 'react';
import { Switch } from '@headlessui/react';
import { useUser } from '../../contexts/UserContext';
import { UserRole } from '../../types/user';

export const RoleToggle: React.FC = () => {
  const { role, toggleRole } = useUser();
  const isSeller = role === 'seller';

  const RoleIcon = ({ role }: { role: UserRole }) => {
    return (
      <span className="text-lg">
        {role === 'buyer' ? '🛒' : '💰'}
      </span>
    );
  };

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
      <RoleIcon role={role} />
      <Switch.Group>
        <div className="flex items-center ml-2">
          <Switch.Label className="mr-3">
            <span className={`text-sm font-medium ${
              isSeller 
                ? 'text-gray-400 dark:text-gray-500' 
                : 'text-indigo-600 dark:text-indigo-400 font-bold'
            }`}>
              Buyer
            </span>
          </Switch.Label>
          <Switch
            checked={isSeller}
            onChange={toggleRole}
            className={`${
              isSeller ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                isSeller ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <Switch.Label className="ml-3">
            <span className={`text-sm font-medium ${
              isSeller 
                ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
                : 'text-gray-400 dark:text-gray-500'
            }`}>
              Seller
            </span>
          </Switch.Label>
        </div>
      </Switch.Group>
    </div>
  );
};