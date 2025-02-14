import { EmailTemplate } from '../types';
import { formatCurrency } from '../../../utils/email/emailUtils';

export interface BidAcceptedParams {
  itemTitle: string;
  bidAmount: number;
  sellerName: string;
  paymentLink: string;
}

export const bidAcceptedTemplate: EmailTemplate<BidAcceptedParams> = {
  name: 'bid-accepted',
  subject: 'Your Bid Was Accepted!',
  getParams: (data) => ({
    item_title: data!.itemTitle,
    bid_amount: formatCurrency(data!.bidAmount),
    seller_name: data!.sellerName,
    payment_link: data!.paymentLink
  })
};