import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { WantedItemForm } from './components';
import { ServiceItemForm } from '../../components/items/ServiceItemForm';
import { useProfileCompletion } from '../../hooks/useProfileCompletion';
import { ProfileCompletionBanner, ProfileCompletionProgress } from '../../components/profile/ProfileCompletionBanner';
// import { WantedItemForm } from '../../components/items/WantedItemForm';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const AddItem: React.FC = () => {
  const [categories] = useState(['Item', 'Service']);
  const profileStatus = useProfileCompletion();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Place a Listing</h1>
      
      {/* Profile completion guidance */}
      <div className="mb-6 space-y-4">
        <ProfileCompletionBanner status={profileStatus} action="list" />
        {!profileStatus.isComplete && (
          <ProfileCompletionProgress status={profileStatus} />
        )}
      </div>
      
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-indigo-900/20 p-1">
          {categories.map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white/60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-indigo-700 shadow dark:bg-gray-800 dark:text-indigo-400'
                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-white dark:text-gray-400'
                )
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-6">
          <Tab.Panel>
            <WantedItemForm />
          </Tab.Panel>
          <Tab.Panel>
            <ServiceItemForm />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default AddItem;