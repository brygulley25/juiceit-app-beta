import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { checkNetworkConnectivity } from '@/lib/networkUtils';
import type { Recipe } from '@/types/app';

interface NetworkError extends Error {
  isNetworkError: boolean;
}

export function useRecipeGeneration() {
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const generateRecipe = async (
    userId: string | null,
    moodId: string,
    goalId: string
  ): Promise<Recipe> => {
    setLoading(true);
    setNetworkError(null);

    try {
      // Check network connectivity first
      const isConnected = await checkNetworkConnectivity();
      
      if (!isConnected) {
        const error = new Error('No internet connection. Please check your connection and try again.') as NetworkError;
        error.isNetworkError = true;
        throw error;
      }

      if (!isSupabaseConfigured) {
        // Return mock recipe for development
        const mockRecipe: Recipe = {
          id: crypto.randomUUID(),
          name: 'Green Energy Boost',
          emoji: '🥤',
          color: '#22c55e',
          description: 'A refreshing blend to energize your day',
          ingredients: [
            { name: 'Spinach', amount: '2', unit: 'cups' },
            { name: 'Green apple', amount: '1', unit: 'medium' },
            { name: 'Lemon', amount: '1/2', unit: 'juice of' },
            { name: 'Ginger', amount: '1', unit: 'inch' },
          ],
          steps: [
            'Wash all ingredients thoroughly',
            'Add spinach and apple to blender',
            'Add lemon juice and ginger',
            'Blend until smooth',
            'Serve immediately',
          ],
          benefits: [
            'High in iron for energy',
            'Natural detox support',
            'Rich in vitamin C',
          ],
          prepTime: 5,
          servings: 1,
          moodId,
          goalId,
          usage: {
            remainingToday: 2,
            limit: 3,
            pro: false,
          },
        };

        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate loading
        return mockRecipe;
      }

      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: { userId, moodId, goalId },
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        
        // Check if it's a network-related error
        if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('connection')) {
          const networkErr = new Error('Connection failed. Please check your internet and try again.') as NetworkError;
          networkErr.isNetworkError = true;
          throw networkErr;
        }
        
        throw error;
      }
      
      console.log('🔄 useRecipes: Edge function response:', data);
      
      // All responses should now be 200 with proper usage data
      return {
        ...data,
        usage: data.usage || { remainingToday: 2, limit: 3, pro: false }
      };
    } catch (error) {
      console.error('❌ Recipe generation error:', error);
      
      // Handle network errors specifically
      if ((error as NetworkError).isNetworkError) {
        setNetworkError(error.message);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const retryGeneration = () => {
    setNetworkError(null);
  };

  return {
    generateRecipe,
    retryGeneration,
    networkError,
    loading,
  };
}