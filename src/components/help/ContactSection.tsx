import React from 'react';
import { ContactForm } from './ContactForm';

export const ContactSection: React.FC = () => {
  return (
    <div className="mt-12">
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