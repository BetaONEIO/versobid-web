import React from 'react';
import { Modal } from './Modal';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Terms & Conditions">
      <div className="prose dark:prose-invert max-w-none">
        <h3>1. Acceptance of Terms</h3>
        <p>
          By accessing and using this website, you accept and agree to be bound by the terms and
          provision of this agreement.
        </p>

        <h3>2. Use License</h3>
        <p>
          Permission is granted to temporarily download one copy of the materials (information or
          software) on VersoBid's website for personal, non-commercial transitory viewing only.
        </p>

        <h3>3. Disclaimer</h3>
        <p>
          The materials on VersoBid's website are provided on an 'as is' basis. VersoBid makes no
          warranties, expressed or implied, and hereby disclaims and negates all other warranties
          including, without limitation, implied warranties or conditions of merchantability, fitness
          for a particular purpose, or non-infringement of intellectual property or other violation
          of rights.
        </p>
      </div>
    </Modal>
  );
};