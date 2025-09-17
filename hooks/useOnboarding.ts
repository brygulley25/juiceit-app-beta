import { useState, useEffect } from 'react';
import { safeStorage } from '@/lib/storage';

export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = () => {
      const completed = safeStorage.getItem('onboarding_completed');
      setHasCompletedOnboarding(completed === 'true');
    };

    checkOnboarding();
  }, []);

  const completeOnboarding = () => {
    safeStorage.setItem('onboarding_completed', 'true');
    setHasCompletedOnboarding(true);
  };

  return {
    hasCompletedOnboarding,
    completeOnboarding,
  };
}