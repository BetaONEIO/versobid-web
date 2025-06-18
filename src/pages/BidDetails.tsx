import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { bidService } from '../services/bidService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useBidDetails } from '../hooks/useBidDetails';

export const BidDetails: React.FC = () => {
  const { bidId } = useParams<{ bidId: string }>();
  const navigate = useNavigate();
  const { role } = useUser();
  const { addNotification } = useNotification();
  
  const { bid, loading, error, setBid } = useBidDetails(bidId);
  const [counterAmount, setCounterAmount] = useState<number>(0);
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Set counter amount when bid loads
  React.useEffect(() => {
    if (bid) {
      setCounterAmount(bid.counter_amount || bid.amount);
    }
  }, [bid]);

  // Handle errors from the hook
  React.useEffect(() => {
    if (error) {
      addNotification('error', error);
      navigate('/bids');
    }
  }, [error, addNotification, navigate]);

  const handleAcceptBid = async () => {
    if (!bid) return;
    
    setActionLoading(true);
    try {
      const success = await bidService.updateBidStatus(bid.id, 'accepted');
      if (success) {
        addNotification('success', 'Bid accepted! Redirecting to payment...');
        navigate('/payment/checkout', { state: { bidId: bid.id, amount: bid.amount } });
      } else {
        addNotification('error', 'Failed to accept bid');
      }
    } catch (error) {
      console.error('Error accepting bid:', error);
      addNotification('error', 'Failed to accept bid');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectBid = async () => {
    if (!bid) return;
    
    setActionLoading(true);
    try {
      const success = await bidService.updateBidStatus(bid.id, 'rejected');
      if (success) {
        addNotification('success', 'Bid rejected');
        navigate('/bids');
      } else {
        addNotification('error', 'Failed to reject bid');
      }
    } catch (error) {
      console.error('Error rejecting bid:', error);
      addNotification('error', 'Failed to reject bid');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCounterOffer = async () => {
    if (!bid || counterAmount <= 0) return;
    
    setActionLoading(true);
    try {
      const success = await bidService.updateBidStatus(bid.id, 'countered', counterAmount);
      if (success) {
        addNotification('success', 'Counter offer sent!');
        navigate('/bids');
      } else {
        addNotification('error', 'Failed to send counter offer');
      }
    } catch (error) {
      console.error('Error sending counter offer:', error);
      addNotification('error', 'Failed to send counter offer');
    } finally {
      setActionLoading(false);
      setShowCounterForm(false);
    }
  };

  const handleRespondToCounter = async (accept: boolean) => {
    if (!bid) return;
    
    setActionLoading(true);
    try {
      if (accept) {
        console.log('Accepting counter offer for bid:', bid.id);
        const success = await bidService.updateBidStatus(bid.id, 'accepted');
        if (success) {
          // Update local state immediately to show the change
          setBid(prevBid => prevBid ? { ...prevBid, status: 'accepted' } : null);
          
          addNotification('success', 'Counter offer accepted!');
          
          // Add a small delay so user can see the status change before navigation
          setTimeout(() => {
            navigate('/bids');
          }, 1500);
        } else {
          addNotification('error', 'Failed to accept counter offer');
        }
      } else {
        // When seller rejects counter, delete the bid entirely
        console.log('Rejecting counter offer and deleting bid:', bid.id);
        const success = await bidService.deleteBid(bid.id);
        if (success) {
          addNotification('success', 'Counter offer rejected. Bid has been removed.');
          setTimeout(() => {
            navigate('/bids');
          }, 1500);
        } else {
          addNotification('error', 'Failed to reject counter offer');
        }
      }
    } catch (error) {
      console.error('Error responding to counter:', error);
      addNotification('error', 'Failed to respond to counter offer');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading bid details...</div>;
  }

  if (!bid) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">Bid not found</p>
        </div>
      </div>
    );
  }

  const isBuyer = role === 'buyer';
  const canAcceptReject = isBuyer && bid.status === 'pending';
  const isCountered = bid.status === 'countered';
  const canRespondToCounter = !isBuyer && isCountered;
  const canMakeCounter = isBuyer && bid.status === 'pending' && !bid.counter_amount; // Only allow 1 counter
  
  // Add logic to detect if seller accepted a counter offer
  const sellerAcceptedCounter = !isBuyer && bid.status === 'accepted' && bid.counter_amount;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bid Details
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                bid.status === 'accepted' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : bid.status === 'confirmed'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : bid.status === 'rejected'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : bid.status === 'countered'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Bid Information */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Item Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Item Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Item
                    </label>
                    <p className="text-gray-900 dark:text-white">{bid.item?.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Description
                    </label>
                    <p className="text-gray-900 dark:text-white">{bid.item?.description}</p>
                  </div>
                  <div className="flex space-x-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Min Price
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {bid.item && formatCurrency(bid.item.minPrice)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Max Price
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {bid.item && formatCurrency(bid.item.maxPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Bid Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Bid Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {isBuyer ? 'Bidder' : 'Your Bid'}
                    </label>
                    <p className="text-gray-900 dark:text-white">{bid.bidder?.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Original Amount
                    </label>
                    <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(bid.amount)}
                    </p>
                  </div>
                  {bid.counter_amount && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Counter Offer
                      </label>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {formatCurrency(bid.counter_amount)}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Date
                    </label>
                    <p className="text-gray-900 dark:text-white">{formatDate(bid.created_at)}</p>
                  </div>
                  {bid.message && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Message
                      </label>
                      <p className="text-gray-900 dark:text-white">{bid.message}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
            {canAcceptReject && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAcceptBid}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Accept Bid'}
                </button>
                <button
                  onClick={handleRejectBid}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Reject Bid'}
                </button>
                {canMakeCounter && (
                  <button
                    onClick={() => setShowCounterForm(true)}
                    disabled={actionLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  >
                    Counter Offer
                  </button>
                )}
              </div>
            )}

            {canRespondToCounter && (
              <div className="flex flex-wrap gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 w-full">
                  The buyer has made a counter offer of {formatCurrency(bid.counter_amount!)}
                </p>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to accept the counter offer of ${formatCurrency(bid.counter_amount!)}?`)) {
                      handleRespondToCounter(true);
                    }
                  }}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Accept Counter'}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reject this counter offer and delete the bid? This action cannot be undone.')) {
                      handleRespondToCounter(false);
                    }
                  }}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Reject & Delete Bid'}
                </button>
              </div>
            )}

            {showCounterForm && canMakeCounter && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Make Counter Offer
                </h4>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Counter Amount
                    </label>
                    <input
                      type="number"
                      value={counterAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Remove leading zeros but allow valid decimal numbers
                        const cleanValue = value.replace(/^0+(?=\d)/, '');
                        setCounterAmount(Number(cleanValue) || 0);
                      }}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={handleCounterOffer}
                    disabled={actionLoading || counterAmount <= 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  >
                    {actionLoading ? 'Sending...' : 'Send Counter'}
                  </button>
                  <button
                    onClick={() => setShowCounterForm(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {sellerAcceptedCounter && (
              <div className="text-center">
                <p className="text-green-600 dark:text-green-400 font-medium">
                  You accepted the counter offer of {formatCurrency(bid.counter_amount!)}
                </p>
              </div>
            )}

            {bid.status === 'accepted' && !sellerAcceptedCounter && (
              <div className="text-center">
                <p className="text-green-600 dark:text-green-400 font-medium mb-4">
                  This bid has been accepted!
                </p>
                {isBuyer && (
                  <button
                    onClick={() => navigate('/payment/checkout', { state: { bidId: bid.id, amount: bid.counter_amount || bid.amount } })}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                  >
                    Complete Payment
                  </button>
                )}
              </div>
            )}

            {bid.status === 'confirmed' && (
              <div className="text-center">
                <p className="text-green-600 dark:text-green-400 font-medium mb-4">
                  Payment has been completed!
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  The seller has been notified and will arrange delivery.
                </p>
              </div>
            )}

            {bid.status === 'rejected' && (
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400 font-medium">
                  This bid has been rejected.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 