import { EmailTemplate } from '../types';
import { formatCurrency, getAppUrl } from '../../../utils/email/emailUtils';

interface PriceChangeParams {
  itemTitle: string;
  oldPrice: number;
  newPrice: number;
  itemId: string;
}

export const priceChangeTemplate: EmailTemplate<PriceChangeParams> = {
  name: 'price-change',
  subject: 'Price Update for Watched Item - VersoBid',
  getParams: (data?: PriceChangeParams) => ({
    item_title: data?.itemTitle ?? '',
    old_price: data?.oldPrice ? formatCurrency(data.oldPrice) : '$0.00',
    new_price: data?.newPrice ? formatCurrency(data.newPrice) : '$0.00',
    item_link: data?.itemId ? `${getAppUrl()}/items/${data.itemId}` : ''
  })
};