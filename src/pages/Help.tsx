import React from 'react';
import { HelpHeader } from '../components/help/HelpHeader';
import { FAQSection } from '../components/help/FAQSection';
import { ContactSection } from '../components/help/ContactSection';
import { QuickGuides } from '../components/help/QuickGuides';

export const Help: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <HelpHeader />
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <FAQSection />
        <QuickGuides />
      </div>
      <ContactSection />
    </div>
  );
};