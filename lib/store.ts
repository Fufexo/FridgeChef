'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Filters, Ingredient, RecipeSuggestion, ShoppingItem } from '@/types';

interface AppStore {
  // True once persisted state has been loaded from localStorage
  hasHydrated: boolean;

  // Ingredientes seleccionados
  selectedIngredients: Ingredient[];
  addIngredient: (ingredient: Ingredient) => void;
  removeIngredient: (id: string) => void;
  clearIngredients: () => void;

  // Recetas
  recipes: RecipeSuggestion[];
  /** Cache key of the ingredient set `recipes` were generated for */
  recipesFor: string | null;
  setRecipes: (recipes: RecipeSuggestion[], recipesFor?: string | null) => void;
  appendRecipes: (recipes: RecipeSuggestion[]) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  isLoadingMore: boolean;
  setIsLoadingMore: (val: boolean) => void;

  // Filtros
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;

  // Lista de compras
  shoppingList: ShoppingItem[];
  addToShoppingList: (items: ShoppingItem[]) => void;
  removeFromShoppingList: (name: string) => void;
  clearShoppingList: () => void;
}

const EMPTY_RESULTS = { recipes: [], recipesFor: null, isLoading: false };

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      hasHydrated: false,

      // Ingredientes
      selectedIngredients: [],
      addIngredient: (ingredient) =>
        set((state) => {
          if (state.selectedIngredients.find((i) => i.id === ingredient.id)) return state;
          return { selectedIngredients: [...state.selectedIngredients, ingredient] };
        }),
      removeIngredient: (id) =>
        set((state) => {
          const selectedIngredients = state.selectedIngredients.filter((i) => i.id !== id);
          return selectedIngredients.length ? { selectedIngredients } : { selectedIngredients, ...EMPTY_RESULTS };
        }),
      clearIngredients: () => set({ selectedIngredients: [], ...EMPTY_RESULTS }),

      // Recetas
      recipes: [],
      recipesFor: null,
      setRecipes: (recipes, recipesFor = null) => set({ recipes, recipesFor }),
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
    }),
    {
      name: 'fridgechef',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedIngredients: state.selectedIngredients,
        recipes: state.recipes,
        recipesFor: state.recipesFor,
        shoppingList: state.shoppingList,
      }),
      // Rehydrated manually by <Providers /> after mount to avoid SSR hydration mismatches
      skipHydration: true,
      onRehydrateStorage: () => () => useStore.setState({ hasHydrated: true }),
    }
  )
);
