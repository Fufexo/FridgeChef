'use client';

import { create } from 'zustand';
import { Ingredient, RecipeSuggestion, ShoppingItem } from '@/types';

interface Filters {
  maxTime: number | null;
  difficulty: string | null;
  dietaryTag: string | null;
}

interface AppStore {
  // Ingredientes seleccionados
  selectedIngredients: Ingredient[];
  addIngredient: (ingredient: Ingredient) => void;
  removeIngredient: (id: string) => void;
  clearIngredients: () => void;

  // Recetas
  recipes: RecipeSuggestion[];
  setRecipes: (recipes: RecipeSuggestion[]) => void;
  appendRecipes: (recipes: RecipeSuggestion[]) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  isLoadingMore: boolean;
  setIsLoadingMore: (val: boolean) => void;

  // Filtros
  filters: Filters;
  setFilter: (key: keyof Filters, value: number | string | null) => void;

  // Lista de compras
  shoppingList: ShoppingItem[];
  addToShoppingList: (items: ShoppingItem[]) => void;
  removeFromShoppingList: (name: string) => void;
  clearShoppingList: () => void;
}

export const useStore = create<AppStore>((set) => ({
  // Ingredientes
  selectedIngredients: [],
  addIngredient: (ingredient) =>
    set((state) => {
      if (state.selectedIngredients.find((i) => i.id === ingredient.id)) return state;
      return { selectedIngredients: [...state.selectedIngredients, ingredient] };
    }),
  removeIngredient: (id) =>
    set((state) => ({
      selectedIngredients: state.selectedIngredients.filter((i) => i.id !== id),
    })),
  clearIngredients: () => set({ selectedIngredients: [] }),

  // Recetas
  recipes: [],
  setRecipes: (recipes) => set({ recipes }),
  appendRecipes: (more) => set((state) => ({ recipes: [...state.recipes, ...more] })),
  isLoading: false,
  setIsLoading: (val) => set({ isLoading: val }),
  isLoadingMore: false,
  setIsLoadingMore: (val) => set({ isLoadingMore: val }),

  // Filtros
  filters: { maxTime: null, difficulty: null, dietaryTag: null },
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  // Lista de compras
  shoppingList: [],
  addToShoppingList: (items) =>
    set((state) => {
      const existing = new Set(state.shoppingList.map((i) => i.name));
      const newItems = items.filter((i) => !existing.has(i.name));
      return { shoppingList: [...state.shoppingList, ...newItems] };
    }),
  removeFromShoppingList: (name) =>
    set((state) => ({
      shoppingList: state.shoppingList.filter((i) => i.name !== name),
    })),
  clearShoppingList: () => set({ shoppingList: [] }),
}));
