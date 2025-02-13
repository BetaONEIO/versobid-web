import { EmailTemplate } from '../types';

interface ShippingUpdateParams {
  itemTitle: string;
  shippingStatus: string;
  trackingNumber: string;
  carrier: string;
  trackingUrl: string;
}

export const shippingUpdateTemplate: EmailTemplate<ShippingUpdateParams> = {
  name: 'shipping-update',
  subject: 'Shipping Update - VersoBid',
  getParams: (data) => ({
    item_title: data?.itemTitle,
    shipping_status: data?.shippingStatus,
    tracking_number: data?.trackingNumber,
    carrier: data?.carrier,
    tracking_link: data?.trackingUrl
  })
};