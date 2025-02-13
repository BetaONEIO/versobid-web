import { PostcodeResponse } from './types';

export const postcodeService = {
  async lookup(postcode: string): Promise<PostcodeResponse | null> {
    try {
      const formattedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      const response = await fetch(`https://api.postcodes.io/postcodes/${formattedPostcode}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to lookup postcode');
      }

      const data = await response.json();
      
      return {
        postcode: data.result.postcode,
        latitude: data.result.latitude,
        longitude: data.result.longitude,
        region: data.result.region,
        district: data.result.admin_district
      };
    } catch (error) {
      console.error('Postcode lookup error:', error);
      throw error;
    }
  },

  async validate(postcode: string): Promise<boolean> {
    try {
      const formattedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      const response = await fetch(`https://api.postcodes.io/postcodes/${formattedPostcode}/validate`);
      
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      return false;
    }
  }
};