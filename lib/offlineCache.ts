import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Recipe } from '@/types/app';

const CACHE_KEY = 'cached_favorites';
const MAX_CACHED_ITEMS = 10; // Exactly 10 as specified

export async function getCachedFavorites(): Promise<Recipe[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (!cached) return [];
    
    const favorites = JSON.parse(cached);
    console.log(`📱 Loaded ${favorites.length} cached favorites`);
    return favorites;
  } catch (error) {
    console.error('Failed to load cached favorites:', error);
    return [];
  }
}

export async function setCachedFavorites(favorites: Recipe[]): Promise<void> {
  try {
    // Keep exactly the most recent 10 items
    const recentFavorites = favorites.slice(0, MAX_CACHED_ITEMS);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(recentFavorites));
    console.log(`📱 Cached ${recentFavorites.length} favorites`);
  } catch (error) {
    console.error('Failed to cache favorites:', error);
  }
}

export async function addToCache(recipe: Recipe): Promise<void> {
  try {
    const currentFavorites = await getCachedFavorites();
    
    // Remove if already exists (to avoid duplicates)
    const filteredFavorites = currentFavorites.filter(fav => fav.id !== recipe.id);
    
    // Add to beginning and keep only 10
    const updatedFavorites = [recipe, ...filteredFavorites].slice(0, MAX_CACHED_ITEMS);
    
    await setCachedFavorites(updatedFavorites);
    console.log(`📱 Added recipe to cache: ${recipe.name}`);
  } catch (error) {
    console.error('Failed to add recipe to cache:', error);
  }
}

export async function removeFromCache(recipeId: string): Promise<void> {
  try {
    const currentFavorites = await getCachedFavorites();
    const updatedFavorites = currentFavorites.filter(fav => fav.id !== recipeId);
    
    await setCachedFavorites(updatedFavorites);
    console.log(`📱 Removed recipe from cache: ${recipeId}`);
  } catch (error) {
    console.error('Failed to remove recipe from cache:', error);
  }
}

export async function clearCachedFavorites(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('📱 Cleared cached favorites');
  } catch (error) {
    console.error('Failed to clear cached favorites:', error);
  }
}