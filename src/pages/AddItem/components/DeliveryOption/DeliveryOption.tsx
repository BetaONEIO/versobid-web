import { ShippingType } from "../WantedItemForm/WantedItemForm.types";
import { DeliveryOptionPropsTypes } from "./DeliveryOption.types";

const SHIPPING_OPTION = [
  {
    id: "shipping",
    name: "Ship to me",
  },
  {
    id: "seller-pickup",
    name: "Collection",
  },
];

const DeliveryOption = ({
  shippingData,
  setValue,
  register,
}: DeliveryOptionPropsTypes) => {
  return (
    <div>
      <label
        htmlFor="delivery"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Delivery Preferences
      </label>
      {SHIPPING_OPTION.map((item) => {
        const isChecked = shippingData?.some((opt) => opt === item.id);
        return (
          <div key={item.id} className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {
                  const current = [...shippingData];
                  const exists = current.find((data) => data === item.id);

                  const updated = exists
                    ? current.filter((data) => data !== item.id)
                    : [...current, item.id as ShippingType]; // Add more fields like `cost` or `location` as needed

                  setValue("shipping_type", updated);
                }}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.name}
              </span>
            </label>
            {isChecked && item.id === "shipping" && (
              <div className="ml-6 mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  I'm happy to pay up to:
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">£</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("shipping_cost")}
                    className="mt-1 block w-full pl-7 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            )}
            {isChecked && item.id === "seller-pickup" && (
              <div className="ml-6">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  I am happy to collect the item
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DeliveryOption;
