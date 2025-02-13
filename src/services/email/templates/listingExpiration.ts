import { EmailTemplate } from '../types';
import { getAppUrl } from '../../../utils/email/emailUtils';

interface ListingExpirationParams {
  itemTitle: string;
  daysRemaining: number;
  bidCount: number;
  listingId: string;
}

export const listingExpirationTemplate: EmailTemplate<ListingExpirationParams> = {
  name: 'listing-expiration',
  subject: 'Your Listing is Expiring Soon - VersoBid',
  getParams: (data?: ListingExpirationParams) => ({
    item_title: data?.itemTitle ?? '',
    days_remaining: data?.daysRemaining ?? 0,
    bid_count: data?.bidCount ?? 0,
    listing_link: data?.listingId ? `${getAppUrl()}/listings/${data.listingId}` : ''
  })
};