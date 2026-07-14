/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female';
  height: number; // in cm
  weight: number; // in kg
  goal: 'bulking' | 'cutting' | 'maintenance';
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  trainingSystem: 'arnold' | 'ppl' | 'upper_lower' | 'bro_split';
  daysPerWeek: number; // 3 to 6
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
}

export interface Macros {
  calories: number;
  protein: number; // in g
  carbs: number; // in g
  fat: number; // in g
  water: number; // in liters
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  category: string;
  notes: string;
  swapOptions: string[]; // List of other exercises that can swap this one
}

export interface MealIngredient {
  name: string;
  arabicName: string;
  amount: string;
  arabicAmount: string;
  swapOptions: { name: string; arabicName: string; amount: string; arabicAmount: string }[];
}

export interface Meal {
  id: string;
  name: string; // e.g. "Meal 1: Breakfast"
  arabicName: string;
  calories: number;
  protein: number; // in g
  carbs: number; // in g
  fat: number; // in g
  ingredients: MealIngredient[];
  isEaten: boolean;
  swapOptions: { name: string; arabicName: string; calories: number; protein: number; carbs: number; fat: number; ingredients: MealIngredient[] }[]; // alternatives for the entire meal
}

export interface WorkoutDay {
  dayNumber: number; // 1 to 7
  dayName: string; // "Monday", etc.
  focus: string; // e.g., "Chest & Back" or "Rest Day"
  isRest: boolean;
  exercises: Exercise[];
  meals: Meal[]; // Generated daily meals
}

export interface GeneratedPlan {
  profile: UserProfile;
  macros: Macros;
  days: WorkoutDay[];
}

