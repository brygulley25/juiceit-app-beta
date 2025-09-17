import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { track, AnalyticsEvents } from '@/lib/analytics';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout() {
  useFrameworkReady();
  const { refetchSubscription } = useUserSubscription();

  useEffect(() => {
    // Handle deep links from Stripe checkout
    const handleDeepLink = (url: string) => {
      console.log('🔗 Deep link received:', url);
      
      // Check if this is a return from Stripe
      if (url.includes('stripe') || url.includes('checkout') || url.includes('success')) {
        console.log('💳 Stripe return detected, refetching subscription...');
        
        // Delay to allow webhook processing
        setTimeout(async () => {
          await refetchSubscription();
          await track(AnalyticsEvents.PURCHASE_COMPLETED, {
            source: 'deep_link',
            url: url.substring(0, 50), // Truncate for privacy
          });
        }, 2000);
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Handle app launch from deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => subscription?.remove();
  }, [refetchSubscription]);

  return (
    <ErrorBoundary>
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#f8fffe' }
      }}>
        <Stack.Screen name="+not-found" />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            gestureEnabled: false 
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ErrorBoundary>
  );
}
