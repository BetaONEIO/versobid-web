import { supabase } from '../../lib/supabase';

export const storageService = {
  async uploadImage(file: File, userId: string): Promise<string> {
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload the file
      const { data, error } = await supabase.storage
        .from('wanted-items')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('wanted-items')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  async deleteImage(path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('wanted-items')
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
};