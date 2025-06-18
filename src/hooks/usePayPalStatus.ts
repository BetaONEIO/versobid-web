import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';

export const usePayPalStatus = () => {
  const { auth } = useUser();
  const [isLinked, setIsLinked] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPayPalStatus = async () => {
    if (!auth.user?.id) {
      setIsLinked(false);
      setPaypalEmail(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('paypal_email')
        .eq('id', auth.user.id)
        .single();

      if (error) throw error;

      const email = data?.paypal_email || null;
      setPaypalEmail(email);
      setIsLinked(!!email);
    } catch (error) {
      console.error('Error loading PayPal status:', error);
      setIsLinked(false);
      setPaypalEmail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayPalStatus();
  }, [auth.user?.id]);

  const refreshStatus = () => {
    loadPayPalStatus();
  };

  return {
    isLinked,
    paypalEmail,
    loading,
    refreshStatus
  };
}; 