import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { checkNetworkConnectivity } from '@/lib/networkUtils';
import { getCachedFavorites, setCachedFavorites, addToCache } from '@/lib/offlineCache';
import type { Recipe } from '@/types/app';

interface SavedRecipeData {
  id: string;
  created_at: string;
  payload: Recipe | null;
}

export function useSavedRecipes() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSavedRecipes = useCallback(async (isRefreshing = false) => {
    if (!user) {
      setSavedRecipes([]);
      return;
    }

    // Prevent multiple simultaneous loads, but allow refresh
    if (loading && !isRefreshing) return;

    if (!isRefreshing) {
      setLoading(true);
    }
    setError(null);

    try {
      // Check network connectivity
      const isConnected = await checkNetworkConnectivity();
      setIsOffline(!isConnected);

      if (!isConnected) {
        // Load from cache when offline
        console.log('📱 Offline mode: Loading cached favorites');
        const cachedFavorites = await getCachedFavorites();
        setSavedRecipes(cachedFavorites);
        
        if (cachedFavorites.length > 0) {
          setError('Showing cached favorites (offline)');
        } else {
          setError('No cached favorites available offline');
        }
        return;
      }

      // Online: fetch from Supabase
      console.log('🔄 Online mode: Loading saved recipes from Supabase');
      
      const { data, error: supabaseError } = await supabase
        .from('saved_recipes')
        .select('id, created_at, payload')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.error('❌ Database error:', supabaseError);
        throw supabaseError;
      }

      const recipes = data
        ?.filter((item: SavedRecipeData) => item.payload !== null)
        .map((item: SavedRecipeData) => ({
          ...item.payload!,
          savedId: item.id,
          id: item.payload!.id || item.id,
        })) || [];

      console.log('✅ Loaded recipes from Supabase:', recipes.length);
      setSavedRecipes(recipes);
      
      // Update cache with fresh data
      await setCachedFavorites(recipes);
      
    } catch (error) {
      console.error('❌ Error loading saved recipes:', error);
      
      // Fallback to cached data on error
      try {
        const cachedFavorites = await getCachedFavorites();
        if (cachedFavorites.length > 0) {
          console.log('📱 Using cached favorites after error:', cachedFavorites.length);
          setSavedRecipes(cachedFavorites);
          setError('Showing cached favorites (connection error)');
        } else {
          setError(error instanceof Error ? error.message : 'Failed to load saved recipes');
          setSavedRecipes([]);
        }
      } catch (cacheError) {
        console.error('❌ Cache error:', cacheError);
        setError(error instanceof Error ? error.message : 'Failed to load saved recipes');
        setSavedRecipes([]);
      }
    } finally {
      if (!isRefreshing) {
        setLoading(false);
      }
    }
  }, [user]);

  // Initialize on mount
  useEffect(() => {
    if (user) {
      loadSavedRecipes();
    }
  }, [user, loadSavedRecipes]);

  const saveRecipe = useCallback(async (recipe: Recipe) => {
    if (!user) {
      const error = new Error('User not authenticated');
      console.error('❌ Save recipe failed:', error.message);
      throw error;
    }

    // Check network connectivity before saving
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      throw new Error('No internet connection. Please try again when online.');
    }

    console.log('💾 Saving recipe:', recipe.name);
    
    try {
      // First, save the recipe to the recipes table
      const { data: savedRecipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          name: recipe.name,
          mood: recipe.moodId,
          goal: recipe.goalId,
          ingredients: recipe.ingredients,
          instructions: recipe.steps,
          benefits: recipe.benefits.join(', '),
          prep_time: `${recipe.prepTime} min`,
          servings: recipe.servings.toString(),
          color: [recipe.color, recipe.color], // Use same color for gradient
        })
        .select()
        .single();

      if (recipeError) {
        console.error('❌ Error saving to recipes table:', recipeError);
        throw recipeError;
      }

      // Then save the reference in saved_recipes with the full recipe as payload
      const { error: savedError } = await supabase
        .from('saved_recipes')
        .insert({
          user_id: user.id,
          recipe_id: savedRecipe.id,
          payload: recipe,
        });

      if (savedError) {
        console.error('❌ Error saving to saved_recipes table:', savedError);
        throw savedError;
      }

      // Add to cache and update local state
      await addToCache(recipe);
      setSavedRecipes(prev => [recipe, ...prev.slice(0, 9)]); // Keep 10 total
      
      console.log('✅ Recipe saved successfully');
    } catch (error) {
      console.error('❌ Error in saveRecipe:', error);
      throw error;
    }
  }, [user]);

  return {
    saveRecipe,
    savedRecipes,
    loadSavedRecipes,
    isOffline,
    error,
    loading,
  };
}