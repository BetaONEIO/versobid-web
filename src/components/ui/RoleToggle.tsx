import React from 'react';
import { Switch } from '@headlessui/react';
import { useUser } from '../../contexts/UserContext';

export const RoleToggle: React.FC = () => {
  const { role, toggleRole } = useUser();
  const isSeller = role === 'seller';

  return (
    <Switch.Group>
      <div className="flex items-center">
        <Switch.Label className="mr-3 text-sm text-gray-600 dark:text-gray-300">
          {isSeller ? 'Seller' : 'Buyer'}
        </Switch.Label>
        <Switch
          checked={isSeller}
          onChange={toggleRole}
          className={`${
            isSeller ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        >
          <span
            className={`${
              isSeller ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>
    </Switch.Group>
  );
};