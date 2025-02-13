import React from 'react';
import { Modal } from './Modal';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Privacy Policy">
      <div className="prose dark:prose-invert max-w-none">
        <h3>1. Information Collection</h3>
        <p>
          We collect information that you provide directly to us, including when you create an
          account, make a purchase, or contact us for support.
        </p>

        <h3>2. Use of Information</h3>
        <p>
          We use the information we collect to operate, maintain, and provide you with the features
          and functionality of our service, as well as to communicate directly with you.
        </p>

        <h3>3. Data Protection</h3>
        <p>
          We implement appropriate technical and organizational measures to maintain the security of
          your personal information, including protecting against unauthorized or unlawful processing
          and against accidental loss, destruction, or damage.
        </p>
      </div>
    </Modal>
  );
};