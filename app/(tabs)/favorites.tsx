import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useResponsive } from '@/hooks/useResponsive';
import { createTypographyScale, colors } from '@/styles/typography';
import { TouchableCard } from '@/components/ui/TouchableCard';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { RecipeResult } from '@/components/RecipeResult';
import type { Recipe } from '@/types/app';

export default function FavoritesScreen() {
  const { user } = useAuth();
  const { spacing, fontSizes, isSmallScreen } = useResponsive();
  const typography = createTypographyScale(fontSizes);
  const { savedRecipes, loadSavedRecipes, loading, error, isOffline } = useSavedRecipes();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Load recipes when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        console.log('🔄 Favorites screen focused, loading saved recipes...');
        loadSavedRecipes();
      }
    }, [user, loadSavedRecipes])
  );

  const handleRefresh = useCallback(async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      await loadSavedRecipes(true); // Pass refresh flag
    } finally {
      setRefreshing(false);
    }
  }, [user, loadSavedRecipes]);

  const handleRecipePress = useCallback((recipe: Recipe) => {
    console.log('📱 Recipe selected:', recipe.name);
    setSelectedRecipe(recipe);
  }, []);

  const handleModalClose = useCallback(() => {
    console.log('❌ Modal closed');
    setSelectedRecipe(null);
  }, []);

  const handleRetry = useCallback(() => {
    loadSavedRecipes();
  }, [loadSavedRecipes]);

  const renderRecipe = useCallback(({ item }: { item: Recipe }) => (
    <TouchableCard
      style={[styles.recipeCard, { marginBottom: spacing.sm }]}
      onPress={() => handleRecipePress(item)}
    >
      <Text style={[styles.recipeEmoji, { fontSize: isSmallScreen ? 28 : 32, marginRight: spacing.md }]}>
        {item.emoji}
      </Text>
      <View style={styles.recipeInfo}>
        <Text style={[typography.lg, { 
          color: colors.text.primary, 
          fontWeight: '600', 
          marginBottom: spacing.xs 
        }]}>
          {item.name}
        </Text>
        <Text style={[typography.sm, { 
          color: colors.text.secondary, 
          marginBottom: spacing.xs 
        }]}>
          {item.description}
        </Text>
        <Text style={[typography.xs, { color: colors.text.tertiary }]}>
          {item.prepTime} min • {item.servings} serving{item.servings > 1 ? 's' : ''}
        </Text>
      </View>
      {isOffline && (
        <View style={[styles.offlineIndicator, { 
          backgroundColor: colors.background.tertiary,
          paddingHorizontal: spacing.xs,
          paddingVertical: 2,
          borderRadius: 4,
          alignSelf: 'flex-start',
        }]}>
          <Text style={[typography.xs, { 
            color: colors.text.tertiary,
            fontSize: 10,
          }]}>
            offline
          </Text>
        </View>
      )}
    </TouchableCard>
  ), [handleRecipePress]);

  // Guest user state
  if (!user) {
    return (
      <SafeScreen>
        <Text style={[typography.display, { 
          color: colors.text.primary, 
          padding: spacing.lg,
          paddingTop: spacing.xl 
        }]}>
          Your Favorites
        </Text>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyEmoji, { fontSize: isSmallScreen ? 40 : 48 }]}>🔒</Text>
          <Text style={[typography.xl, { 
            color: colors.text.primary, 
            fontWeight: '600', 
            marginBottom: spacing.sm,
            textAlign: 'center' 
          }]}>
            Sign in to view favorites
          </Text>
          <Text style={[typography.md, { 
            color: colors.text.secondary, 
            textAlign: 'center' 
          }]}>
            Create an account to save your favorite recipes
          </Text>
        </View>
      </SafeScreen>
    );
  }

  // Loading state
  if (loading && !refreshing) {
    return (
      <SafeScreen>
        <Text style={[typography.display, { 
          color: colors.text.primary, 
          padding: spacing.lg,
          paddingTop: spacing.xl 
        }]}>
          Your Favorites
        </Text>
        <View style={[styles.loadingContainer, { padding: spacing.xl }]}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={[typography.md, { 
            color: colors.text.secondary, 
            marginTop: spacing.md,
            textAlign: 'center' 
          }]}>
            {isOffline ? 'Loading cached recipes...' : 'Loading your saved recipes...'}
          </Text>
        </View>
      </SafeScreen>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeScreen>
        <Text style={[typography.display, { 
          color: colors.text.primary, 
          padding: spacing.lg,
          paddingTop: spacing.xl 
        }]}>
          Your Favorites
        </Text>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyEmoji, { fontSize: isSmallScreen ? 40 : 48 }]}>
            {isOffline ? '📱' : '⚠️'}
          </Text>
          <Text style={[typography.xl, { 
            color: colors.text.primary, 
            fontWeight: '600', 
            marginBottom: spacing.sm,
            textAlign: 'center' 
          }]}>
            {isOffline ? 'No cached favorites' : 'Error loading favorites'}
          </Text>
          <Text style={[typography.md, { 
            color: colors.text.secondary, 
            textAlign: 'center',
            marginBottom: spacing.md 
          }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { 
              backgroundColor: colors.accent.primary,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
              borderRadius: 8,
            }]} 
            onPress={handleRetry}
          >
            <Text style={[typography.md, { 
              color: colors.text.inverse, 
              fontWeight: '600' 
            }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  // Empty state
  if (savedRecipes.length === 0) {
    return (
      <SafeScreen>
        <Text style={[typography.display, { 
          color: colors.text.primary, 
          padding: spacing.lg,
          paddingTop: spacing.xl 
        }]}>
          Your Favorites
        </Text>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyEmoji, { fontSize: isSmallScreen ? 40 : 48 }]}>💚</Text>
          <Text style={[typography.xl, { 
            color: colors.text.primary, 
            fontWeight: '600', 
            marginBottom: spacing.sm,
            textAlign: 'center' 
          }]}>
            No favorites yet
          </Text>
          <Text style={[typography.md, { 
            color: colors.text.secondary, 
            textAlign: 'center' 
          }]}>
            Save recipes you love to find them here
          </Text>
        </View>
      </SafeScreen>
    );
  }

  // Main content
  return (
    <SafeScreen>
      <View style={[styles.header, { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: spacing.lg,
        paddingTop: spacing.xl 
      }]}>
        <Text style={[typography.display, { color: colors.text.primary }]}>
          Your Favorites
        </Text>
        {error && (
          <View style={[styles.statusIndicator, { 
            backgroundColor: isOffline ? colors.accent.light : colors.status.warning + '20',
            paddingHorizontal: spacing.xs,
            paddingVertical: 2,
            borderRadius: 4,
          }]}>
            <Text style={[typography.xs, { 
              color: isOffline ? colors.accent.primary : colors.status.warning,
              fontSize: 10,
              fontWeight: '600',
            }]}>
              {isOffline ? 'offline' : 'error'}
            </Text>
          </View>
        )}
      </View>
      
      <FlatList
        data={savedRecipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.savedId || item.id} // Use savedId for unique keys
        contentContainerStyle={[styles.list, { 
          padding: spacing.lg,
          paddingTop: 0,
          paddingBottom: isSmallScreen ? 90 : 100, // Account for tab bar
        }]}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        getItemLayout={(data, index) => ({
          length: 100, // Approximate item height
          offset: 100 * index,
          index,
        })}
      />

      <Modal
        visible={!!selectedRecipe}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleModalClose}
      >
        {selectedRecipe && (
          <RecipeResult
            recipe={selectedRecipe}
            onGenerateAnother={handleModalClose}
            hideGenerateButton={true}
          />
        )}
      </Modal>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: {},
  statusIndicator: {},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {},
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeEmoji: {},
  recipeInfo: {
    flex: 1,
  },
  offlineIndicator: {},
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {},
});