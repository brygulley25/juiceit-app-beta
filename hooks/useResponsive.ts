import { useWindowDimensions } from 'react-native';
import { PixelRatio } from 'react-native';

export interface ResponsiveBreakpoints {
  sm: boolean;  // ≤ 360pt
  md: boolean;  // 361-414pt  
  lg: boolean;  // 415-480pt
  xl: boolean;  // > 480pt
}

export interface ResponsiveSizes {
  breakpoints: ResponsiveBreakpoints;
  fontSizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    display: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  minTouchTarget: number;
  isSmallScreen: boolean;
  isLargeScreen: boolean;
}

export function useResponsive(): ResponsiveSizes {
  const { width, height, fontScale } = useWindowDimensions();
  const pixelRatio = PixelRatio.get();
  
  // Convert to points (iOS standard)
  const widthPt = width / pixelRatio;
  
  const breakpoints: ResponsiveBreakpoints = {
    sm: widthPt <= 360,
    md: widthPt > 360 && widthPt <= 414,
    lg: widthPt > 414 && widthPt <= 480,
    xl: widthPt > 480,
  };

  // Base font sizes that respect system font scaling
  const baseFontSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    display: 28,
  };

  // Apply font scale but cap it to prevent extreme scaling
  const cappedFontScale = Math.min(fontScale, 1.3);
  
  const fontSizes = {
    xs: Math.round(baseFontSizes.xs * cappedFontScale),
    sm: Math.round(baseFontSizes.sm * cappedFontScale),
    md: Math.round(baseFontSizes.md * cappedFontScale),
    lg: Math.round(baseFontSizes.lg * cappedFontScale),
    xl: Math.round(baseFontSizes.xl * cappedFontScale),
    display: Math.round(baseFontSizes.display * cappedFontScale),
  };

  // 8pt spacing system
  const spacing = {
    xs: 4,   // 0.5x
    sm: 8,   // 1x
    md: 16,  // 2x
    lg: 24,  // 3x
    xl: 32,  // 4x
    xxl: 40, // 5x
  };

  return {
    breakpoints,
    fontSizes,
    spacing,
    minTouchTarget: 44, // iOS minimum
    isSmallScreen: breakpoints.sm,
    isLargeScreen: breakpoints.lg || breakpoints.xl,
  };
}