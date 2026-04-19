export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
}

export interface RecipeSuggestion {
  id: string;
  name: string;
  matchPercentage: number;
  missingIngredients: string[];
  availableIngredients: string[];
  estimatedTime: number;
  difficulty: 'fácil' | 'medio' | 'difícil';
  dietaryTags: string[];
  servings: number;
  imageQuery?: string;
  imageUrl?: string | null;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  duration?: number | null;
}

export interface RecipeDetail extends RecipeSuggestion {
  steps: RecipeStep[];
  tips: string;
  calories?: number | null;
}

export interface ShoppingItem {
  name: string;
  emoji: string;
  forRecipe: string;
}
