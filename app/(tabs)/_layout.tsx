import { Tabs } from 'expo-router';
import { Chrome as Home, Heart, User } from 'lucide-react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { spacing, isSmallScreen } = useResponsive();
  
  const tabBarHeight = isSmallScreen ? 70 : 80;
  const bottomPadding = Platform.OS === 'ios' ? 8 : 12;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          paddingBottom: bottomPadding,
          paddingTop: spacing.sm,
          height: tabBarHeight,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
          position: 'absolute',
          bottom: spacing.sm,
          left: spacing.sm,
          right: spacing.sm,
          borderRadius: 16,
        },
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: isSmallScreen ? 10 : 11,
          fontWeight: '600',
          marginTop: spacing.xs,
        },
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
          tabBarTestID: 'home-tab',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ size, color }) => (
            <Heart size={size} color={color} />
          ),
          tabBarTestID: 'favorites-tab',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
          tabBarTestID: 'profile-tab',
        }}
      />
    </Tabs>
  );
}