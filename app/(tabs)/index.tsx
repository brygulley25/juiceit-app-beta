import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { PaywallModal } from '@/components/PaywallModal';
import { UsageBadge } from '@/components/ui/UsageBadge';
import { MoodSelector } from '@/components/MoodSelector';
import { GoalSelector } from '@/components/GoalSelector';
import { RecipeResult } from '../../components/RecipeResult';
import { LoadingState } from '@/components/LoadingState';
import { useAuth } from '@/hooks/useAuth';
import { useRecipeGeneration as useRecipes } from '@/hooks/useRecipes';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useResponsive } from '@/hooks/useResponsive';
import { useGuestUsage } from '@/hooks/useGuestUsage';
import { track, AnalyticsEvents } from '@/lib/analytics';
import { MOODS, GOALS } from '@/data/constants';
import type { Recipe } from '@/types/app';

type Step = 'mood' | 'goal' | 'loading' | 'result';

export default function HomeScreen() {
  // Call ALL hooks first - never conditionally
  const { user } = useAuth();
  const { generateRecipe, loading, networkError, retryGeneration } = useRecipes();
  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();
  const { spacing } = useResponsive();
  const guestUsage = useGuestUsage();
  const [currentStep, setCurrentStep] = useState<Step>('mood');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [serverUsage, setServerUsage] = useState<{
    remainingToday: number;
    limit: number;
    pro: boolean;
  } | null>(null);

  // Handle conditional rendering AFTER all hooks are called

  if (hasCompletedOnboarding === false) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  if (hasCompletedOnboarding === null) {
    return (
      <SafeScreen>
        <LoadingState />
      </SafeScreen>
    );
  }

  const handleMoodSelect = (moodId: string) => {
    // Clear any previous network errors
    retryGeneration();
    
    setSelectedMood(moodId);
    setCurrentStep('goal');
    
    // Track flow start
    track(AnalyticsEvents.FLOW_START, {
      mood: moodId,
      user_type: user ? 'authenticated' : 'guest',
    });
  };

  const handleGoalSelect = async (goalId: string) => {
    // Prevent multiple simultaneous requests
    if (isGenerating) return;
    
    // Debounce: prevent multiple rapid calls and mark as generating
    setIsGenerating(true);
    
    // For guest users only, check usage limit BEFORE making any request
    if (!user) {
      if (guestUsage.remainingToday <= 0) {
        setShowPaywall(true);
        setIsGenerating(false);
        return;
      }
    }
    
    setSelectedGoal(goalId);
    setCurrentStep('loading');
    
    try {
      const recipe = await generateRecipe(user?.id || null, selectedMood, goalId);
      
      // Check if this is a limit reached response
      if (recipe.isLimitReached) {
        console.log('🚫 Limit reached response received, showing paywall');
        setShowPaywall(true);
        setCurrentStep('mood');
        setIsGenerating(false);
        return;
      }
      
      // Update usage data from server response (authenticated users)
      if (user && recipe.usage) {
        console.log('📊 Updating server usage:', recipe.usage);
        setServerUsage(recipe.usage);
      } else if (!user) {
        // Guest user - increment guest usage
        await guestUsage.incrementUsage();
      }

      setCurrentRecipe(recipe);
      setCurrentStep('result');
      
      // Track flow complete
      track(AnalyticsEvents.FLOW_COMPLETE, {
        mood: selectedMood,
        goal: goalId,
        recipe_name: recipe.name,
        user_type: user ? 'authenticated' : 'guest',
        remaining_today: recipe.usage?.remainingToday || 0,
      });
    } catch (error) {
      console.error('❌ Recipe generation error:', error);
      
      // Handle network errors gracefully
      if (networkError) {
        // Network error is already set by the hook, just reset to goal step
        setCurrentStep('goal');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
        setCurrentStep('goal');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNetworkRetry = () => {
    retryGeneration();
    // Stay on current step, user can try selecting goal again
  };

  const handleUpgrade = () => {
    setShowPaywall(false);
    // Refresh the current step to allow generating again
    setCurrentStep('goal');
  };

  const handleGenerateAnother = () => {
    setSelectedMood('');
    setSelectedGoal('');
    setCurrentRecipe(null);
    setIsGenerating(false);
    retryGeneration(); // Clear any network errors
    // Don't reset serverUsage - keep it for the badge
    setCurrentStep('mood');
  };

  const handleSaveSuccess = () => {
    // Reset to home state after successful save
    handleGenerateAnother();
  };

  if (currentStep === 'loading') {
    return (
      <SafeScreen>
        <LoadingState />
      </SafeScreen>
    );
  }

  if (currentStep === 'result' && currentRecipe) {
    return (
      <RecipeResult
        recipe={currentRecipe}
        serverUsage={currentRecipe.usage}
        onGenerateAnother={handleGenerateAnother}
        onSaveSuccess={handleSaveSuccess}
      />
    );
  }

  // Show network error state
  if (networkError) {
    return (
      <SafeScreen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>📡</Text>
          <Text style={styles.errorTitle}>No internet connection</Text>
          <Text style={styles.errorMessage}>
            Please check your connection and try again.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={handleNetworkRetry}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      {currentStep === 'mood' && (
        <>
          <UsageBadge serverUsage={serverUsage} />
        <MoodSelector
          moods={MOODS}
          onMoodSelect={handleMoodSelect}
        />
        </>
      )}
      
      {currentStep === 'goal' && (
        <>
          <UsageBadge serverUsage={serverUsage} />
        <GoalSelector
          goals={GOALS}
          onGoalSelect={handleGoalSelect}
        />
        </>
      )}

      <PaywallModal
        visible={showPaywall}
        isGuest={!user}
        onClose={() => setShowPaywall(false)}
        onUpgrade={handleUpgrade}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
