import React from "react";

import { Bid } from "../../../../types";

import { BidListProps } from "./BidListCards.types";

const BidList: React.FC<BidListProps> = ({ bids, onBidSelect }) => {
  const getStatusColor = (status: Bid["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "countered":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {bids.map((bid) => (
        <div
          key={bid.id}
          className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
          onClick={() => onBidSelect?.(bid)}
        >
          <h3 className="text-lg font-semibold text-gray-900">
            {bid.item?.title || "Untitled Item"}
          </h3>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">
              ${bid.amount.toLocaleString()}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                bid.status
              )}`}
            >
              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BidList;
