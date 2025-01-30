import React from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { faqs } from '../../utils/helpContent';

export const FAQSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <Disclosure key={faq.id}>
            {({ open }) => (
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <Disclosure.Button className="flex justify-between w-full text-left">
                  <span className="text-gray-900 dark:text-white font-medium">
                    {faq.question}
                  </span>
                  <ChevronUpIcon
                    className={`${
                      open ? 'transform rotate-180' : ''
                    } w-5 h-5 text-gray-500`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="mt-2 text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        ))}
      </div>
    </div>
  );
};