import React from 'react';

interface PriceSuggestionProps {
  priceAnalysis: {
    suggestedRange: {
      minPrice: number;
      maxPrice: number;
      marketPrice: number;
    };
    confidence: string;
    basedOn: number;
    note: string;
  } | null;
  onAcceptRange: (minPrice: number, maxPrice: number) => void;
}

export const PriceSuggestion: React.FC<PriceSuggestionProps> = ({
  priceAnalysis,
  onAcceptRange
}) => {
  if (!priceAnalysis) return null;

  const { suggestedRange, confidence, basedOn, note } = priceAnalysis;

  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
      <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
        Suggested Price Range
      </h3>
      <div className="mt-2">
        <p className="text-blue-800 dark:text-blue-200">
          £{suggestedRange.minPrice} - £{suggestedRange.maxPrice}
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
          Market price: £{suggestedRange.marketPrice}
        </p>
        <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
          {note} ({confidence} confidence, based on {basedOn} items)
        </p>
      </div>
      <button
        onClick={() => onAcceptRange(suggestedRange.minPrice, suggestedRange.maxPrice)}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
      >
        Use This Range
      </button>
    </div>
  );
};