import React from 'react';
import { useUserContext } from '../context/UserContext';

export default function UserToggle() {
  const { userRole, setUserRole } = useUserContext();

  return (
    <div className="flex items-center space-x-3">
      <span className={`text-sm ${userRole === 'buyer' ? 'text-white' : 'text-gray-300'}`}>Buyer</span>
      <button
        onClick={() => setUserRole(userRole === 'buyer' ? 'seller' : 'buyer')}
        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
        style={{ backgroundColor: userRole === 'seller' ? 'rgb(79, 70, 229)' : 'rgb(209, 213, 219)' }}
        role="switch"
        aria-checked={userRole === 'seller'}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            userRole === 'seller' ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <span className={`text-sm ${userRole === 'seller' ? 'text-white' : 'text-gray-300'}`}>Seller</span>
    </div>
  );
}