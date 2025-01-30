import { EmailTemplate } from '../types';

interface ItemSoldParams {
  itemTitle: string;
  saleAmount: number;
  buyerName: string;
}

export const itemSoldTemplate: EmailTemplate<ItemSoldParams> = {
  name: 'item-sold',
  subject: 'Your Item Has Been Sold! - VersoBid',
  getParams: (data?: ItemSoldParams) => ({
    item_title: data?.itemTitle || '',
    sale_amount: data?.saleAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || '',
    buyer_name: data?.buyerName || ''
  })
};