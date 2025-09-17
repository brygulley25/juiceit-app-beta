import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export async function checkNetworkConnectivity(): Promise<boolean> {
  // Use navigator.onLine for web platform
  if (Platform.OS === 'web') {
    return navigator.onLine;
  }

  // Use NetInfo for native platforms
  try {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected === true && (netInfo.isInternetReachable === true || netInfo.isInternetReachable === null);
  } catch (error) {
    console.error('Network check failed:', error);
    // Fallback to navigator.onLine if NetInfo fails
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }
}

export function subscribeToNetworkChanges(callback: (isConnected: boolean) => void) {
  // Use online/offline events for web platform
  if (Platform.OS === 'web') {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  // Use NetInfo for native platforms
  return NetInfo.addEventListener(state => {
    const isConnected = state.isConnected === true && (state.isInternetReachable === true || state.isInternetReachable === null);
    callback(isConnected);
  });
}