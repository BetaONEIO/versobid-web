import React from 'react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-300">
          [Your privacy policy content will go here]
        </p>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg mt-8">
          <p className="text-yellow-800 dark:text-yellow-200">
            This is a placeholder page. Please replace this content with your actual privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}