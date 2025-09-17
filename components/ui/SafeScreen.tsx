import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '@/hooks/useResponsive';

interface SafeScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function SafeScreen({ children, style, edges = ['top', 'bottom', 'left', 'right'] }: SafeScreenProps) {
  const { spacing } = useResponsive();
  
  return (
    <SafeAreaView 
      style={[
        { 
          flex: 1, 
          backgroundColor: '#f8fffe',
        }, 
        style
      ]} 
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
}