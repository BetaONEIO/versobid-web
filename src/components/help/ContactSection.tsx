import React from 'react';
import { EnvelopeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { ContactForm } from './ContactForm';

export const ContactSection: React.FC = () => {
  return (
    <div className="mt-12 space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Quick Support Options
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex items-start space-x-4">
            <EnvelopeIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Email Support
              </h3>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Get help within 24 hours
              </p>
              <a
                href="mailto:support@versobid.com"
                className="mt-2 inline-block text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              >
                support@versobid.com
              </a>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Live Chat
              </h3>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Available Monday to Friday, 9am-5pm EST
              </p>
              <button
                className="mt-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                onClick={() => console.log('Open chat')}
              >
                Start chat
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Need more help? Contact us today
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Fill out the form below and we'll get back to you as soon as possible.
          </p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
};