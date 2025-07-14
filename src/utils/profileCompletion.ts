import { User } from '../types/user';

export interface ProfileCompletionStatus {
  isComplete: boolean;
  canList: boolean;
  canBid: boolean;
  missingFields: string[];
  requiredFields: {
    fullName: boolean;
    shippingAddress: boolean;
    paypalEmail: boolean;
  };
}

export interface ShippingAddress {
  street: string | null;
  city: string | null;
  postcode: string | null;
  country: string | null;
}

export const checkProfileCompletion = (user: User | null): ProfileCompletionStatus => {
  if (!user) {
    return {
      isComplete: false,
      canList: false,
      canBid: false,
      missingFields: ['User authentication'],
      requiredFields: {
        fullName: false,
        shippingAddress: false,
        paypalEmail: false,
      },
    };
  }

  const missingFields: string[] = [];
  const requiredFields = {
    fullName: false,
    shippingAddress: false,
    paypalEmail: false,
  };

  // Check full name
  if (!user.name || user.name.trim().length === 0) {
    missingFields.push('Full name');
  } else {
    requiredFields.fullName = true;
  }

  // Check shipping address
  const hasValidShippingAddress = user.shipping_address && 
    user.shipping_address.street && 
    user.shipping_address.city && 
    user.shipping_address.postcode && 
    user.shipping_address.country;

  if (!hasValidShippingAddress) {
    missingFields.push('Complete shipping address');
  } else {
    requiredFields.shippingAddress = true;
  }

  // Check PayPal email
  if (!user.paypal_email || user.paypal_email.trim().length === 0) {
    missingFields.push('PayPal email');
  } else {
    requiredFields.paypalEmail = true;
  }

  const isComplete = missingFields.length === 0;
  
  // For listing: need full name and shipping address
  const canList = requiredFields.fullName && requiredFields.shippingAddress;
  
  // For bidding: need all fields (including PayPal for payments)
  const canBid = isComplete;

  return {
    isComplete,
    canList,
    canBid,
    missingFields,
    requiredFields,
  };
};

export const getProfileCompletionMessage = (status: ProfileCompletionStatus, action: 'list' | 'bid'): string => {
  if (action === 'list' && !status.canList) {
    const listingMissing = [];
    if (!status.requiredFields.fullName) listingMissing.push('full name');
    if (!status.requiredFields.shippingAddress) listingMissing.push('shipping address');
    
    return `To list items, please complete your profile by adding: ${listingMissing.join(', ')}.`;
  }
  
  if (action === 'bid' && !status.canBid) {
    return `To place bids, please complete your profile by adding: ${status.missingFields.join(', ')}.`;
  }
  
  return '';
};

export const getProfileCompletionSteps = (status: ProfileCompletionStatus): { step: string; completed: boolean; description: string }[] => {
  return [
    {
      step: 'Personal Information',
      completed: status.requiredFields.fullName,
      description: 'Add your full name to your profile',
    },
    {
      step: 'Shipping Address',
      completed: status.requiredFields.shippingAddress,
      description: 'Add your complete shipping address for deliveries',
    },
    {
      step: 'Payment Setup',
      completed: status.requiredFields.paypalEmail,
      description: 'Link your PayPal account for secure payments',
    },
  ];
}; 