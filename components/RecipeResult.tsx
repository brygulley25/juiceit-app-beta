import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useResponsive } from '@/hooks/useResponsive';
import { createTypographyScale, colors } from '@/styles/typography';
import { TouchableCard } from '@/components/ui/TouchableCard';
import { router } from 'expo-router';
import { UsageBadge } from '@/components/ui/UsageBadge';
import { Recipe } from '@/types/app';
import { useAuth } from '@/hooks/useAuth';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { track, AnalyticsEvents } from '@/lib/analytics';
import { AuthModal } from './AuthModal';

interface RecipeResultProps {
  recipe: Recipe;
  serverUsage?: {
    remainingToday: number;
    limit: number;
    pro: boolean;
  };
  onGenerateAnother: () => void;
  hideGenerateButton?: boolean;
  onSaveSuccess?: () => void;
}

export function RecipeResult({ recipe, serverUsage, onGenerateAnother, hideGenerateButton = false, onSaveSuccess }: RecipeResultProps) {
  const { user } = useAuth();
  const { saveRecipe } = useSavedRecipes();
  const { spacing, fontSizes, isSmallScreen, minTouchTarget } = useResponsive();
  const typography = createTypographyScale(fontSizes);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSave = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    console.log('💾 Attempting to save recipe:', recipe.name);
    
    // Track save attempt
    track(AnalyticsEvents.SAVE_CLICKED, {
      recipe_name: recipe.name,
      mood: recipe.moodId,
      goal: recipe.goalId,
    });
    
    try {
      await saveRecipe(recipe);
      console.log('✅ Recipe saved successfully');
      Alert.alert('Success', 'Recipe saved to favorites!');
      onSaveSuccess?.();
    } catch (error) {
      console.error('❌ Failed to save recipe:', error);
      Alert.alert('Error', 'Failed to save recipe');
    }
  };

  const handleAuthSuccess = () => {
    console.log('✅ Auth successful, attempting to save recipe');
    setShowAuthModal(false);
    // After successful auth, try to save the recipe again
    handleSave();
  };
  return (
    <SafeScreen edges={['top', 'left', 'right']}>
      <View style={[styles.usageBadgeContainer, { 
        padding: spacing.lg,
        paddingBottom: 0,
      }]}>
        <UsageBadge serverUsage={serverUsage || recipe.usage} />
      </View>
      
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={[styles.header, { 
          backgroundColor: recipe.color,
          padding: spacing.lg,
          paddingTop: spacing.xl,
        }]}>
          <Text style={[styles.emoji, { fontSize: isSmallScreen ? 40 : 48 }]}>{recipe.emoji}</Text>
          <Text style={[typography.xl, { 
            color: colors.text.primary, 
            textAlign: 'center', 
            marginBottom: spacing.sm,
            fontWeight: '800'
          }]}>
            {recipe.name}
          </Text>
          <Text style={[typography.md, { 
            color: colors.text.secondary, 
            textAlign: 'center', 
            marginBottom: spacing.sm 
          }]}>
            {recipe.description}
          </Text>
          <View style={styles.meta}>
            <Text style={[typography.sm, { color: colors.text.primary, fontWeight: '600' }]}>
              {recipe.prepTime} min
            </Text>
            <Text style={[typography.sm, { color: colors.text.primary, fontWeight: '600' }]}>•</Text>
            <Text style={[typography.sm, { color: colors.text.primary, fontWeight: '600' }]}>
              {recipe.servings} serving
            </Text>
          </View>
        </View>

        {/* Ingredients */}
        <View style={[styles.section, { padding: spacing.lg }]}>
          <Text style={[typography.lg, { 
            color: colors.text.primary, 
            fontWeight: '700', 
            marginBottom: spacing.md 
          }]}>
            Ingredients
          </Text>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} style={[styles.ingredient, { 
              backgroundColor: colors.background.primary,
              padding: spacing.md,
              borderRadius: 12,
              marginBottom: spacing.sm,
            }]}>
              <Text style={[typography.md, { color: colors.text.secondary }]}>
                {ingredient.amount} {ingredient.unit} {ingredient.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Steps */}
        <View style={[styles.section, { padding: spacing.lg }]}>
          <Text style={[typography.lg, { 
            color: colors.text.primary, 
            fontWeight: '700', 
            marginBottom: spacing.md 
          }]}>
            Instructions
          </Text>
          {recipe.steps.map((step, index) => (
            <View key={index} style={[styles.step, { marginBottom: spacing.md }]}>
              <Text style={[styles.stepNumber, { 
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: colors.accent.primary,
                color: colors.text.inverse,
                fontSize: typography.sm.fontSize,
                fontWeight: '600',
                textAlign: 'center',
                lineHeight: 24,
                marginRight: spacing.sm,
              }]}>
                {index + 1}
              </Text>
              <Text style={[typography.md, { 
                flex: 1, 
                color: colors.text.secondary, 
                lineHeight: 24 
              }]}>
                {step}
              </Text>
            </View>
          ))}
        </View>

        {/* Benefits */}
        {recipe.benefits.length > 0 && (
          <View style={[styles.section, { padding: spacing.lg }]}>
            <Text style={[typography.lg, { 
              color: colors.text.primary, 
              fontWeight: '700', 
              marginBottom: spacing.md 
            }]}>
              Why you'll love it
            </Text>
            {recipe.benefits.map((benefit, index) => (
              <View key={index} style={[styles.benefit, { marginBottom: spacing.sm }]}>
                <Text style={[styles.benefitBullet, { 
                  fontSize: typography.md.fontSize,
                  color: colors.accent.primary,
                  marginRight: spacing.sm,
                  fontWeight: '600',
                }]}>
                  •
                </Text>
                <Text style={[typography.md, { flex: 1, color: colors.text.secondary }]}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Disclaimer */}
        <Text style={[typography.xs, { 
          color: colors.text.tertiary, 
          textAlign: 'center', 
          padding: spacing.lg,
          fontStyle: 'italic' 
        }]}>
          ⚠️ Always consult with a healthcare provider and check for personal allergies before trying new recipes.
        </Text>
      </ScrollView>

      {/* Actions */}
      <View style={[styles.actions, { 
        flexDirection: 'row',
        padding: spacing.lg,
        paddingBottom: isSmallScreen ? 90 : 100, // Account for tab bar
        gap: spacing.sm,
        justifyContent: 'center',
      }]}>
        {hideGenerateButton ? (
          <TouchableOpacity 
            style={[styles.fullWidthButton, { 
              paddingHorizontal: spacing.xl,
              backgroundColor: colors.accent.primary,
              padding: spacing.md,
              borderRadius: 12,
              minHeight: minTouchTarget,
              minWidth: 120,
            }]} 
            onPress={() => onGenerateAnother()}
          >
            <Text style={[typography.md, { 
              color: colors.text.inverse, 
              fontWeight: '600', 
              textAlign: 'center' 
            }]}>
              Close
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.saveButton, { 
                paddingHorizontal: spacing.lg,
                backgroundColor: colors.background.primary,
                padding: spacing.md,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: colors.accent.primary,
                minHeight: minTouchTarget,
                minWidth: 100,
              }]} 
              onPress={handleSave}
            >
              <Text style={[typography.md, { 
                color: colors.accent.primary, 
                fontWeight: '600', 
                textAlign: 'center' 
              }]}>
                Save
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.generateButton, { 
                paddingHorizontal: spacing.lg,
                backgroundColor: colors.accent.primary,
                padding: spacing.md,
                borderRadius: 12,
                minHeight: minTouchTarget,
                minWidth: 140,
              }]} 
              onPress={onGenerateAnother}
            >
              <Text style={[typography.md, { 
                color: colors.text.inverse, 
                fontWeight: '600', 
                textAlign: 'center' 
              }]}>
                Generate Another
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  usageBadgeContainer: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
  },
  emoji: {
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  section: {},
  ingredient: {},
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {},
  benefit: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitBullet: {},
  actions: {},
  saveButton: {},
  generateButton: {},
  fullWidthButton: {},
});