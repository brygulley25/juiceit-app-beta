import { useEffect, useState } from 'react';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export function useFrameworkReady() {
  const [isReady, setIsReady] = useState(false);
  
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for fonts to load
        if (fontsLoaded || fontError) {
          // Hide the splash screen
          await SplashScreen.hideAsync();
          setIsReady(true);
        }
      } catch (e) {
        console.warn('Error during app preparation:', e);
        // Even if there's an error, we should still hide splash screen and continue
        await SplashScreen.hideAsync();
        setIsReady(true);
      }
    }

    prepare();
  }, [fontsLoaded, fontError]);

  return isReady;
}