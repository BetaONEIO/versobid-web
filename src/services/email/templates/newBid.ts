import { EmailTemplate } from '../types';
import { getAppUrl } from '../../../utils/email/emailUtils';

interface NewBidParams {
  itemTitle: string;
  bidAmount: number;
  itemId: string;
}

export const newBidTemplate: EmailTemplate<NewBidParams> = {
  name: 'new-bid',
  subject: 'New Bid Received',
  getParams: (data?: NewBidParams) => ({
    item_title: data?.itemTitle ?? '',
    bid_amount: data?.bidAmount?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? '$0.00',
    item_link: data?.itemId ? `${getAppUrl()}/items/${data.itemId}` : ''
  })
};