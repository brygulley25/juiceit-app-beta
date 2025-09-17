import AsyncStorage from '@react-native-async-storage/async-storage';

const FREE_LIMIT = 3;

function getTodayKey(): string {
  // Use UTC date to match server timezone
  const today = new Date();
  const utcToday = new Date(today.getTime() + (today.getTimezoneOffset() * 60000));
  return `guestUsage:${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export async function getGuestUsageCountForToday(): Promise<number> {
  try {
    const key = getTodayKey();
    const data = await AsyncStorage.getItem(key);
    
    if (!data) {
      return 0;
    }
    
    const parsed = JSON.parse(data);
    return parsed.count || 0;
  } catch (error) {
    console.error('Error getting guest usage count:', error);
    return 0;
  }
}

export async function incrementGuestUsageForToday(): Promise<void> {
  try {
    const key = getTodayKey();
    const currentCount = await getGuestUsageCountForToday();
    const newCount = currentCount + 1;
    
    await AsyncStorage.setItem(key, JSON.stringify({
      count: newCount,
      lastUpdated: new Date().toISOString(),
    }));
    
    console.log(`📊 Guest usage incremented from ${currentCount} to ${newCount}`);
  } catch (error) {
    console.error('Error incrementing guest usage:', error);
  }
}

export async function resetGuestUsageIfNewDay(): Promise<void> {
  try {
    const key = getTodayKey();
    const data = await AsyncStorage.getItem(key);
    
    if (!data) {
      // No data for today, start fresh
      await AsyncStorage.setItem(key, JSON.stringify({
        count: 0,
        lastUpdated: new Date().toISOString(),
      }));
    }
  } catch (error) {
    console.error('Error resetting guest usage:', error);
  }
}

export function getGuestRemainingToday(count: number): number {
  return Math.max(0, FREE_LIMIT - count);
}

export { FREE_LIMIT };