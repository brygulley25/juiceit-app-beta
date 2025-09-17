import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useResponsive } from '@/hooks/useResponsive';
import { createTypographyScale, colors } from '@/styles/typography';
import { TouchableCard } from '@/components/ui/TouchableCard';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/AuthModal';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { spacing, fontSizes, minTouchTarget } = useResponsive();
  const typography = createTypographyScale(fontSizes);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleSignIn = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Don't redirect - stay on profile screen
  };

  const handleManageSubscription = () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to manage subscription');
      return;
    }

    const portalLink = process.env.EXPO_PUBLIC_STRIPE_CUSTOMER_PORTAL || 'https://billing.stripe.com/p/login/5kQcN5aiM79sdwga8fcwg00';
    
    if (!portalLink) {
      Alert.alert('Error', 'Subscription management not configured');
      return;
    }

    WebBrowser.openBrowserAsync(
      `${portalLink}?prefilled_email=${encodeURIComponent(user.email || '')}`,
      {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      }
    );
  };

  if (!user) {
    return (
      <SafeScreen>
        <View style={styles.emptyContent}>
          <Text style={[typography.display, { 
            color: colors.text.primary, 
            padding: spacing.lg,
            paddingTop: spacing.xl 
          }]}>
            Profile
          </Text>
          
          <View style={styles.emptyState}>
            <Text style={[styles.emptyEmoji, { fontSize: 64 }]}>👤</Text>
            <Text style={[typography.xl, { 
              color: colors.text.primary, 
              fontWeight: '700', 
              marginBottom: spacing.sm,
              textAlign: 'center' 
            }]}>
              Sign in to your account
            </Text>
            <Text style={[typography.md, { 
              color: colors.text.secondary, 
              textAlign: 'center', 
              lineHeight: 24, 
              marginBottom: spacing.xl 
            }]}>
              Create an account to save your favorite recipes and unlock unlimited generations
            </Text>
            
            <TouchableOpacity 
              style={[styles.signInButton, { 
                backgroundColor: colors.accent.primary,
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.md,
                borderRadius: 12,
                minWidth: 200,
                minHeight: minTouchTarget,
              }]} 
              onPress={handleSignIn}
            >
              <Text style={[typography.md, { 
                color: colors.text.inverse, 
                fontWeight: '600', 
                textAlign: 'center' 
              }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <AuthModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={[styles.content, { 
        flex: 1,
        padding: spacing.lg,
        paddingTop: spacing.xl 
      }]}>
        <Text style={[typography.display, { 
          color: colors.text.primary, 
          marginBottom: spacing.xl 
        }]}>
          Profile
        </Text>
        
        <View style={[styles.section, { 
          backgroundColor: colors.background.primary,
          padding: spacing.lg,
          borderRadius: 16,
          marginBottom: spacing.lg,
        }]}>
          <Text style={[typography.md, { 
            color: colors.text.secondary, 
            fontWeight: '500' 
          }]}>
            {user.email}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, { 
            backgroundColor: colors.accent.primary,
            padding: spacing.md,
            borderRadius: 12,
            marginBottom: spacing.sm,
            minHeight: minTouchTarget,
          }]} 
          onPress={handleManageSubscription}
        >
          <Text style={[typography.md, { 
            color: colors.text.inverse, 
            fontWeight: '600', 
            textAlign: 'center' 
          }]}>
            Manage Subscription
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.signOutButton, { 
            backgroundColor: colors.background.primary,
            padding: spacing.md,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.status.error,
            minHeight: minTouchTarget,
          }]} 
          onPress={handleSignOut}
        >
          <Text style={[typography.md, { 
            color: colors.status.error, 
            fontWeight: '600', 
            textAlign: 'center' 
          }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {},
  emptyContent: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    marginBottom: 20,
  },
  signInButton: {},
  section: {},
  button: {},
  signOutButton: {},
});