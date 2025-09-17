import { useState, useEffect, useCallback } from 'react';
import { 
  getGuestUsageCountForToday, 
  incrementGuestUsageForToday, 
  resetGuestUsageIfNewDay,
  getGuestRemainingToday 
} from '@/utils/usage';

export function useGuestUsage() {
  const [guestUsageCount, setGuestUsageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadGuestUsage = useCallback(async () => {
    try {
      await resetGuestUsageIfNewDay();
      const count = await getGuestUsageCountForToday();
      setGuestUsageCount(count);
    } catch (error) {
      console.error('Error loading guest usage:', error);
      setGuestUsageCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const incrementUsage = useCallback(async () => {
    try {
      console.log('📊 Before increment - current count:', guestUsageCount);
      await incrementGuestUsageForToday();
      const newCount = await getGuestUsageCountForToday();
      console.log('📊 After increment - new count:', newCount);
      setGuestUsageCount(newCount);
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  }, []);

  useEffect(() => {
    loadGuestUsage();
  }, [loadGuestUsage]);

  const remainingToday = getGuestRemainingToday(guestUsageCount);
  const hasReachedLimit = remainingToday <= 0;

  console.log('🎯 useGuestUsage state:', {
    guestUsageCount,
    remainingToday,
    hasReachedLimit,
    loading
  });

  return {
    guestUsageCount,
    remainingToday,
    hasReachedLimit,
    incrementUsage,
    loading,
    refreshUsage: loadGuestUsage,
  };
}