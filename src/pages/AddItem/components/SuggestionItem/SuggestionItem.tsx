import { isEmpty } from "ramda";
import { forwardRef } from "react";

import { SuggestionItemPropsTypes } from "./SuggestionItem.types";

const SuggestionItem = forwardRef<HTMLDivElement, SuggestionItemPropsTypes>(
  ({ loading, data, handleSuggestionSelect, title, showSuggestion }, ref) => {

    console.log('data----->',data)

    return (
      <div ref={ref}>
        {loading && showSuggestion && (
          <div className="absolute right-3 top-9">
            <div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
          </div>
        )}

        {!loading && (
          <div
            className="absolute w-full z-10 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg"
            
          >
            {/* No Results Message */}
            {isEmpty(data) && !isEmpty(title) && showSuggestion && (
              <p className="text-gray-600 dark:text-gray-300 text-center p-4">
                Sorry, we can't find that item, but you can still post itttt!
              </p>
            )}

            {/* Search Results */}
            {!isEmpty(data) && showSuggestion && (
              <ul className="max-h-60 overflow-auto divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((suggestion) => (
                  <li
                    key={suggestion.title} // should be an id as a key
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <div className="flex items-start space-x-4">
                      {suggestion.imageUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={suggestion.imageUrl}
                            alt={suggestion.title}
                            className="w-16 h-16 object-contain rounded bg-white"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                          {suggestion.title}
                        </p>
                        {suggestion.price !== undefined && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            £{suggestion.price.toFixed(2)}
                          </p>
                        )}
                        {suggestion.brand && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Brand: {suggestion.brand}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  }
);

export default SuggestionItem;
