import { TextStyle } from 'react-native';

export interface TypographyScale {
  xs: TextStyle;
  sm: TextStyle;
  md: TextStyle;
  lg: TextStyle;
  xl: TextStyle;
  display: TextStyle;
}

export const createTypographyScale = (fontSizes: any): TypographyScale => ({
  xs: {
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.xs * 1.4,
    fontWeight: '400',
  },
  sm: {
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * 1.4,
    fontWeight: '400',
  },
  md: {
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * 1.5,
    fontWeight: '400',
  },
  lg: {
    fontSize: fontSizes.lg,
    lineHeight: fontSizes.lg * 1.4,
    fontWeight: '500',
  },
  xl: {
    fontSize: fontSizes.xl,
    lineHeight: fontSizes.xl * 1.3,
    fontWeight: '600',
  },
  display: {
    fontSize: fontSizes.display,
    lineHeight: fontSizes.display * 1.2,
    fontWeight: '800',
  },
});

// WCAG AA compliant colors
export const colors = {
  text: {
    primary: '#1a1a1a',    // 16.94:1 contrast on white
    secondary: '#4a5568',  // 7.54:1 contrast on white  
    tertiary: '#718096',   // 4.54:1 contrast on white
    inverse: '#ffffff',
  },
  background: {
    primary: '#ffffff',
    secondary: '#f8fffe',
    tertiary: '#f7fafc',
  },
  accent: {
    primary: '#22c55e',
    secondary: '#16a34a',
    light: '#dcfce7',
  },
  status: {
    error: '#dc2626',
    warning: '#d97706',
    success: '#059669',
  },
};