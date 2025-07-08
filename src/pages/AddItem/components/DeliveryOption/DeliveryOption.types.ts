import { ShippingType, InputsType } from "../WantedItemForm/WantedItemForm.types"
import { UseFormSetValue } from 'react-hook-form';

export interface DeliveryOptionPropsTypes {
  shippingData: ShippingType
  setValue: UseFormSetValue<InputsType>;
}
