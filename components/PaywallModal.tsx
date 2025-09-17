import React from 'react';
import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { track, AnalyticsEvents } from '@/lib/analytics';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  isGuest?: boolean;
}

export function PaywallModal({ visible, onClose, onUpgrade, isGuest = false }: PaywallModalProps) {
  const { user } = useAuth();

  // Track paywall view when modal becomes visible
  useEffect(() => {
    if (visible) {
      track(AnalyticsEvents.PAYWALL_VIEWED, {
        user_type: isGuest ? 'guest' : 'authenticated',
        trigger: isGuest ? 'guest_limit' : 'auth_limit',
      });
    }
  }, [visible, isGuest]);

  const handleUpgrade = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to upgrade');
      return;
    }

    try {
      const paymentLink = process.env.EXPO_PUBLIC_STRIPE_PAYMENT_LINK;
      
      if (!paymentLink) {
        Alert.alert('Error', 'Payment system not configured');
        return;
      }

      // Open Stripe Checkout in browser
      const result = await WebBrowser.openBrowserAsync(
        `${paymentLink}?client_reference_id=${user.id}`,
        {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        }
      );

      if (result.type === 'dismiss') {
        // User closed the browser, check if they completed payment
        // In a real app, you'd have a webhook that updates the subscription
        // For now, we'll simulate success after a delay
        setTimeout(async () => {
          try {
            const { error } = await supabase.functions.invoke('sync-subscription', {
              body: {
                userId: user.id,
                status: 'active',
              },
            });

            if (!error) {
              onUpgrade();
              Alert.alert('Success!', 'Your subscription is now active');
            }
          } catch (err) {
            console.error('Sync error:', err);
          }
        }, 2000);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open payment page');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.emoji}>🚀</Text>
          <Text style={styles.title}>
            {isGuest ? 'Out of free recipes today' : 'Upgrade to Pro'}
          </Text>
          <Text style={styles.subtitle}>
            {isGuest 
              ? "You've used all 3 free recipes today. Upgrade for unlimited access!"
              : "You've reached your daily limit of 3 free recipes"
            }
          </Text>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>Unlimited recipe generation</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>Save unlimited favorites</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>Priority AI processing</Text>
            </View>
          </View>

          <View style={styles.pricing}>
            <Text style={styles.price}>$10/year</Text>
            <Text style={styles.priceSubtext}>Less than $1 per month</Text>
          </View>

          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
            <Text style={styles.upgradeButtonText}>
              {isGuest ? 'Go Unlimited • $10/yr' : 'Upgrade Now'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.laterButton}>
            <Text style={styles.laterButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '600',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
  },
  pricing: {
    alignItems: 'center',
    marginBottom: 32,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: '#22c55e',
  },
  priceSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  upgradeButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 200,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  laterButton: {
    paddingVertical: 12,
  },
  laterButtonText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});