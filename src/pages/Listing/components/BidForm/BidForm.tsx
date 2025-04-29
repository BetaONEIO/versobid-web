import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUser } from '../../../../contexts/UserContext';
import { useNotification } from '../../../../contexts/NotificationContext';

// import { bidService } from '../../../../services/bidService';

import { BidFormProps } from './BidForm.types';

const BidForm: React.FC<BidFormProps> = ({ item }) => {
  const navigate = useNavigate();
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const [amount, setAmount] = useState<number>(item?.minPrice ?? 0);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;

    // berhubungan dengan backend untuk submit form bid
    try {
      // await bidService.createBid(item.id, amount, message);
      addNotification('success', 'Bid placed successfully!');
      navigate('/bids')
    } catch (error) {
      // berhubungan dengan backend untuk handle kalau submitnya tidak berhasil
      addNotification('error', 'Failed to place bid');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Your Offer</label>
        <input
          type="number"
          required
          min={item?.minPrice}
          max={item?.maxPrice}
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Message (Optional)</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
      >
        Place Bid
      </button>
    </form>
  );
};

export default BidForm;