import { ShippingOption, InputsType } from "../WantedItemForm/WantedItemForm.types"
import { UseFormSetValue, UseFormRegister  } from 'react-hook-form';

export interface DeliveryOptionPropsTypes {
  shippingData: ShippingOption[]
  setValue: UseFormSetValue<InputsType>;
  register: UseFormRegister<InputsType>;
}
