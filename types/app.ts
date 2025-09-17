export interface Mood {
  id: string;
  label: string;
  emoji: string;
}

export interface Goal {
  id: string;
  label: string;
}

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  benefits: string[];
  prepTime: number;
  servings: number;
  moodId: string;
  goalId: string;
  isLimitReached?: boolean;
  usage?: {
    remainingToday: number;
    limit: number;
    pro: boolean;
  };
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface SavedRecipe {
  id: string;
  user_id: string;
  payload: Recipe;
  created_at: string;
}