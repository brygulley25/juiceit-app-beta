import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { createTypographyScale, colors } from '@/styles/typography';
import { useAuth } from '@/hooks/useAuth';
import { useGuestUsage } from '@/hooks/useGuestUsage';
import { useUserSubscription } from '@/hooks/useUserSubscription';

interface UsageBadgeProps {
  serverUsage?: {
    remainingToday: number;
    limit: number;
    pro: boolean;
  };
}

export function UsageBadge({ serverUsage }: UsageBadgeProps) {
  const { user } = useAuth();
  const { spacing, fontSizes } = useResponsive();
  const typography = createTypographyScale(fontSizes);
  const guestUsage = useGuestUsage();
  const { isPro } = useUserSubscription();
  
  // Show loading state only briefly for guests, never for auth users
  if (!user && guestUsage.loading) {
    return null;
  }

  const getBadgeContent = () => {
    if (user) {
      // Authenticated user
      if (isPro || serverUsage?.pro) {
        return {
          text: 'Pro • Unlimited',
          color: colors.accent.primary,
          backgroundColor: colors.accent.light,
        };
      } else if (serverUsage) {
        const used = serverUsage.limit - serverUsage.remainingToday;
        return {
          text: `Free uses today: ${used}/${serverUsage.limit} • ${serverUsage.remainingToday} left`,
          color: colors.text.secondary,
          backgroundColor: colors.background.primary,
        };
      } else {
        // Show default state immediately for auth users instead of "Loading..."
        return {
          text: 'Free uses today: 0/3 • 3 left',
          color: colors.text.secondary,
          backgroundColor: colors.background.primary,
        };
      }
    } else {
      // Guest user
      const guestRemaining = guestUsage.remainingToday;
      const guestUsed = 3 - guestRemaining;
      return {
        text: `Free uses today: ${guestUsed}/3 • ${guestRemaining} left`,
        color: colors.text.secondary,
        backgroundColor: colors.background.primary,
      };
    }
  };

  const badgeContent = getBadgeContent();

  if (!badgeContent) {
    return null;
  }

  return (
    <View style={[styles.badge, { 
      backgroundColor: badgeContent.backgroundColor,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.text.tertiary + '20',
    }]}>
      <Text style={[typography.xs, { 
        color: badgeContent.color,
        fontWeight: '600',
        textAlign: 'center',
      }]}>
        {badgeContent.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});