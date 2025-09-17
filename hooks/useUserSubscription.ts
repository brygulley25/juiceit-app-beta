import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './useAuth';

export type SubscriptionStatus = 'free' | 'active' | 'canceled';

export function useUserSubscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>('free');
  const [loading, setLoading] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setStatus('free');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Subscription fetch error:', error);
        setStatus('free');
        return;
      }

      const subscriptionStatus = data?.status || 'free';
      setStatus(subscriptionStatus === 'active' ? 'active' : 'free');
      console.log('💎 Subscription status:', subscriptionStatus);
    } catch (error) {
      console.error('Subscription fetch failed:', error);
      setStatus('free');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refetchSubscription = useCallback(async () => {
    console.log('🔄 Refetching subscription status...');
    await fetchSubscription();
  }, [fetchSubscription]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    status,
    loading,
    isPro: status === 'active',
    refetchSubscription,
  };
}