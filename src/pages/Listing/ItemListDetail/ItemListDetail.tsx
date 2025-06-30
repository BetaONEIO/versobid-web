import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { useListing } from "../../../hooks/useListing";

import { useUser } from "../../../contexts/UserContext";
import { useNotification } from "../../../contexts/NotificationContext";

import { itemService } from "../../../services/itemService";

import { DeleteListingModal } from "../../../components/ui/DeleteListingModal";
import { BidForm } from "../components";

// import { MockItemListDetail } from "./mockItemListDetail";

const ItemListDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { listing, loading, error } = useListing(id!); // berhubungan dengan backend di dalamnya MockItemListDetail replace dgn listing ya
  const { auth } = useUser();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasPendingBids, setHasPendingBids] = useState(false);

  const handleDeleteClick = async () => {
    if (!id) return;
    const hasBids = await itemService.checkPendingBids(id);
    setHasPendingBids(hasBids);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const success = await itemService.deleteListing(id!);
      if (!success) {
        throw new Error('Failed to archive listing');
      }
      addNotification("success", "Listing deleted successfully");
      navigate("/listings");
    } catch (error) {
      addNotification("error", "Failed to delete listing");
    }
    setShowDeleteModal(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading listing details...</div>;
  }

  if (error || !listing) {
    return <div className="text-center text-red-600 py-8">{error || 'Listing not found'}</div>;
  }

  const isOwner = auth.user?.id === listing.buyerId;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {listing.title}
          </h1>
          {isOwner && (
            <button
              onClick={handleDeleteClick}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete Listing
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-600 dark:text-gray-300">
                {listing.description}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Details</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">
                    Category
                  </dt>
                  <dd className="text-gray-900 dark:text-white">
                    {listing.category}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">
                    Price Range
                  </dt>
                  <dd className="text-gray-900 dark:text-white">
                    £{listing.minPrice} - £{listing.maxPrice}
                  </dd>
                </div>
                <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">
                    Posted by
                  </dt>
                  <dd className="text-gray-900 dark:text-white">
                    <Link to={`/profile/${listing.buyerUsername}`}>
                      {listing.buyerUsername}
                    </Link>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {!isOwner && (
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Place a Bid</h2>
              <BidForm 
                item={listing}
              />
            </div>
          )}
        </div>
      </div>

      <DeleteListingModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        hasPendingBids={hasPendingBids}
      />
    </div>
  );
};

export default ItemListDetail;
