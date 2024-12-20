import { EmailTemplate } from '../types';
import { formatCurrency, getAppUrl } from '../../../utils/email/emailUtils';

export const newBidTemplate: EmailTemplate = {
  name: 'new-bid',
  subject: 'New Bid Received',
  getParams: (data: { itemTitle: string; bidAmount: number; itemId: string }) => ({
    item_title: data.itemTitle,
    bid_amount: formatCurrency(data.bidAmount),
    item_link: `${getAppUrl()}/items/${data.itemId}`
  })
};