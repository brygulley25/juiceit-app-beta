import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthModal } from './AuthModal';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'auth'>('welcome');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGetStarted = () => {
    // Complete onboarding directly
    onComplete();
  };

  const handleAuthComplete = () => {
    setShowAuthModal(false);
    onComplete();
  };

  const handleSkipAuth = () => {
    setShowAuthModal(false);
    onComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentStep === 'welcome' && (
        <View style={styles.content}>
          <Text style={styles.emoji}>🥤</Text>
          <Text style={styles.title}>Welcome to JuiceIT</Text>
          <Text style={styles.subtitle}>
            Get personalized juice recipes based on how you're feeling and your health goals
          </Text>
          
          <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      )}

      <AuthModal
        visible={showAuthModal}
        onClose={handleSkipAuth}
        onSuccess={handleAuthComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 48,
  },
  primaryButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
});