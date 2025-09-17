import React from 'react';
import { TouchableOpacity, View, ViewStyle, TouchableOpacityProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';

interface TouchableCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  hapticFeedback?: boolean;
  minHeight?: number;
}

export function TouchableCard({ 
  children, 
  style, 
  onPress, 
  hapticFeedback = true,
  minHeight,
  ...props 
}: TouchableCardProps) {
  const { spacing, minTouchTarget } = useResponsive();

  const handlePress = (event: any) => {
    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: '#ffffff',
          borderRadius: 16,
          padding: spacing.md,
          minHeight: minHeight || minTouchTarget,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        },
        style
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}