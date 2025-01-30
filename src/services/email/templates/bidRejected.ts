import { EmailTemplate } from '../types';
import { formatCurrency, getAppUrl } from '../../../utils/email/emailUtils';

export interface BidRejectedParams {
  itemTitle: string;
  bidAmount: number;
}

export const bidRejectedTemplate: EmailTemplate<BidRejectedParams> = {
  name: 'bid-rejected',
  subject: 'Update on Your Bid - VersoBid',
  getParams: (data) => ({
    item_title: data!.itemTitle,
    bid_amount: formatCurrency(data!.bidAmount),
    browse_link: `${getAppUrl()}/listings`
  })
};