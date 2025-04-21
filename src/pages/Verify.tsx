import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const VerifyPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('Invalid verification link.');
        return;
      }

      const { data, error } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !data || new Date(data.expires_at) < new Date()) {
        setStatus('Link expired or invalid.');
        return;
      }

      const update = await supabase.auth.admin.updateUserById(data.user_id, {
        email_confirm: true,
      });

      if (update.error) {
        setStatus('Failed to verify email.');
      } else {
        setStatus('Email verified successfully!');
        await supabase
          .from('email_verifications')
          .update({ verified_at: new Date().toISOString() })
          .eq('token', token);
      }
    };

    verifyToken();
  }, []);

  return <div>{status}</div>;
};
