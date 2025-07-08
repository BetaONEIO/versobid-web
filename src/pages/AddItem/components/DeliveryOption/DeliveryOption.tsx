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
        const isChecked = shippingData === item.id;
        return (
          <div key={item.id} className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="shipping_type"
                value={item.id}
                checked={isChecked}
                onChange={() => {
                  setValue("shipping_type", item.id as ShippingType);
                }}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.name}
              </span>
            </label>
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
