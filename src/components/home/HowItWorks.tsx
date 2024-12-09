import React from 'react';

const steps = [
  {
    title: 'Create an Account',
    description: 'Sign up for free and join our bidding community',
    icon: '👤',
  },
  {
    title: 'Browse Items',
    description: 'Explore a wide range of products and services',
    icon: '🔍',
  },
  {
    title: 'Place Bids',
    description: "Bid on items you're interested in",
    icon: '🎯',
  },
  {
    title: 'Win & Purchase',
    description: 'Win auctions and complete secure transactions',
    icon: '🏆',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Get started with VersoBid in four simple steps
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="text-center"
            >
              <div className="flex justify-center">
                <span className="text-4xl mb-4">{step.icon}</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};