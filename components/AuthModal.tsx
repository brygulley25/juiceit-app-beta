import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useResponsive } from '@/hooks/useResponsive';
import { createTypographyScale, colors } from '@/styles/typography';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ visible, onClose, onSuccess }: AuthModalProps) {
  const { signInWithPassword, signUp } = useAuth();
  const { spacing, fontSizes, minTouchTarget } = useResponsive();
  const typography = createTypographyScale(fontSizes);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setLoading(true);
    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signInWithPassword(email, password);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        if (onSuccess) {
          onSuccess();
        } else {
          // Default success behavior - just close modal
          onClose();
        }
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeScreen>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={[styles.header, { padding: spacing.lg }]}>
            <TouchableOpacity 
              onPress={onClose} 
              style={[styles.closeButton, { 
                width: minTouchTarget, 
                height: minTouchTarget,
                borderRadius: minTouchTarget / 2 
              }]}
            >
              <Text style={[typography.md, { color: colors.text.secondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollContent}
            contentContainerStyle={[styles.content, { padding: spacing.lg }]}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.emoji}>🥤</Text>
            <Text style={[typography.display, { 
              color: colors.text.primary, 
              textAlign: 'center', 
              marginBottom: spacing.sm 
            }]}>
              {isSignUp ? 'Join JuiceIT' : 'Welcome Back'}
            </Text>
            <Text style={[typography.md, { 
              color: colors.text.secondary, 
              textAlign: 'center', 
              lineHeight: 22, 
              marginBottom: spacing.xl 
            }]}>
              {isSignUp 
                ? 'Create your account to save favorite recipes and unlock unlimited generations'
                : 'Sign in to access your saved recipes and continue your healthy journey'
              }
            </Text>

            <TextInput
              style={[styles.input, { 
                padding: spacing.md,
                fontSize: fontSizes.md,
                marginBottom: spacing.md,
                minHeight: minTouchTarget,
              }]}
              placeholder="Email"
              placeholderTextColor={colors.text.tertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <TextInput
              style={[styles.input, { 
                padding: spacing.md,
                fontSize: fontSizes.md,
                marginBottom: spacing.md,
                minHeight: minTouchTarget,
              }]}
              placeholder="Password"
              placeholderTextColor={colors.text.tertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />

            <TouchableOpacity
              style={[styles.authButton, { 
                padding: spacing.md,
                marginBottom: spacing.md,
                minHeight: minTouchTarget,
              }, loading && styles.authButtonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={[typography.md, { color: colors.text.inverse, fontWeight: '600' }]}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            {isSignUp && (
              <Text style={[typography.xs, { 
                color: colors.text.tertiary, 
                textAlign: 'center', 
                marginBottom: spacing.md,
                lineHeight: 16 
              }]}>
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </Text>
            )}

            <TouchableOpacity 
              onPress={toggleMode} 
              style={[styles.toggleButton, { 
                padding: spacing.md,
                marginBottom: spacing.lg,
                minHeight: minTouchTarget,
              }]}
            >
              <Text style={[typography.md, { color: colors.accent.primary, fontWeight: '500' }]}>
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"
                }
              </Text>
            </TouchableOpacity>

            <View style={[styles.benefits, { padding: spacing.lg }]}>
              <Text style={[typography.md, { 
                color: colors.text.primary, 
                fontWeight: '600', 
                marginBottom: spacing.md,
                textAlign: 'center' 
              }]}>
                Why create an account?
              </Text>
              <View style={[styles.benefit, { marginBottom: spacing.sm }]}>
                <Text style={[styles.benefitIcon, { fontSize: fontSizes.md, marginRight: spacing.sm, width: 20 }]}>💾</Text>
                <Text style={[typography.sm, { color: colors.text.secondary, flex: 1 }]}>Save your favorite recipes</Text>
              </View>
              <View style={[styles.benefit, { marginBottom: spacing.sm }]}>
                <Text style={[styles.benefitIcon, { fontSize: fontSizes.md, marginRight: spacing.sm, width: 20 }]}>🚀</Text>
                <Text style={[typography.sm, { color: colors.text.secondary, flex: 1 }]}>Upgrade for unlimited generations</Text>
              </View>
              <View style={styles.benefit}>
                <Text style={[styles.benefitIcon, { fontSize: fontSizes.md, marginRight: spacing.sm, width: 20 }]}>📱</Text>
                <Text style={[typography.sm, { color: colors.text.secondary, flex: 1 }]}>Sync across all your devices</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeScreen>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
  },
  authButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    alignItems: 'center',
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  toggleButton: {
    alignItems: 'center',
  },
  benefits: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    // Styles applied inline for responsiveness
  },
});