import { EmailTemplate } from '../types';
import { formatCurrency } from '../../../utils/email/emailUtils';

export const bidAcceptedTemplate: EmailTemplate = {
  name: 'bid-accepted',
  subject: 'Your Bid Was Accepted!',
  getParams: (data: { 
    itemTitle: string; 
    bidAmount: number; 
    sellerName: string; 
    paymentLink: string 
  }) => ({
    item_title: data.itemTitle,
    bid_amount: formatCurrency(data.bidAmount),
    seller_name: data.sellerName,
    payment_link: data.paymentLink
  })
};