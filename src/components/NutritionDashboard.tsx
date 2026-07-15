/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WorkoutDay, Meal, MealIngredient, Macros, UserProfile } from '../types';
import { getAccessToken, syncMealToGoogleTasks } from '../utils/googleTasksService';
import { 
  Flame, 
  Droplet, 
  Plus, 
  Minus, 
  Sparkles,
  Utensils,
  Lightbulb,
  Check,
  RefreshCw,
  ChevronDown,
  CalendarDays,
  Shuffle,
  TrendingUp,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
import { useNotification } from './NotificationProvider';

interface NutritionDashboardProps {
  days: WorkoutDay[];
  onUpdateDays: (updatedDays: WorkoutDay[]) => void;
  macros: Macros;
  profile: UserProfile;
  isArabic: boolean;
  googleTaskListId?: string;
}

export default function NutritionDashboard({ days, onUpdateDays, macros, profile, isArabic, googleTaskListId }: NutritionDashboardProps) {
  const { alert, confirm } = useNotification();
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [consumedWater, setConsumedWater] = useState<number>(0);
  const [activeSwapMealId, setActiveSwapMealId] = useState<string | null>(null);
  const [activeSwapIngredientKey, setActiveSwapIngredientKey] = useState<string | null>(null);

  const activeDay = days[activeDayIndex] || days[0] || { dayNumber: 1, dayName: "Monday", focus: "Rest", isRest: true, exercises: [], meals: [] };
  const dailyMeals = activeDay.meals || [];

  // Calculate consumed macros based on checked/eaten meals for the ACTIVE day
  const consumedCalories = dailyMeals.reduce((sum, meal) => sum + (meal.isEaten ? meal.calories : 0), 0);
  const consumedProtein = dailyMeals.reduce((sum, meal) => sum + (meal.isEaten ? meal.protein : 0), 0);
  const consumedCarbs = dailyMeals.reduce((sum, meal) => sum + (meal.isEaten ? meal.carbs : 0), 0);
  const consumedFat = dailyMeals.reduce((sum, meal) => sum + (meal.isEaten ? meal.fat : 0), 0);

  const addWater = (amount: number) => {
    setConsumedWater(prev => Math.max(0, parseFloat((prev + amount).toFixed(2))));
  };

  const toggleMealEaten = (mealId: string) => {
    const updatedDays = days.map((day, idx) => {
      if (idx !== activeDayIndex) return day;
      return {
        ...day,
        meals: day.meals.map(m => {
          if (m.id === mealId) {
            return { ...m, isEaten: !m.isEaten };
          }
          return m;
        })
      };
    });
    onUpdateDays(updatedDays);
  };

  const handleSwapMeal = async (mealId: string, swapToOption: any) => {
    const updatedDays = days.map((day, idx) => {
      if (idx !== activeDayIndex) return day;
      return {
        ...day,
        meals: day.meals.map(m => {
          if (m.id === mealId) {
            const currentAsOption = {
              name: m.name,
              arabicName: m.arabicName,
              calories: m.calories,
              protein: m.protein,
              carbs: m.carbs,
              fat: m.fat,
              ingredients: m.ingredients
            };
            const remainingSwaps = m.swapOptions.filter(so => so.name !== swapToOption.name);
            return {
              ...m,
              name: swapToOption.name,
              arabicName: swapToOption.arabicName,
              calories: swapToOption.calories,
              protein: swapToOption.protein,
              carbs: swapToOption.carbs,
              fat: swapToOption.fat,
              ingredients: swapToOption.ingredients,
              swapOptions: [currentAsOption, ...remainingSwaps],
              isEaten: false // reset eaten state on swap
            };
          }
          return m;
        })
      };
    });
    onUpdateDays(updatedDays);
    setActiveSwapMealId(null);

    // Ask user to sync to Google Tasks if they are logged in
    const token = getAccessToken();
    if (token && googleTaskListId) {
      const activeUpdatedDay = updatedDays[activeDayIndex];
      const updatedMeal = activeUpdatedDay.meals.find(m => m.id === mealId);
      const mealIndex = activeUpdatedDay.meals.findIndex(m => m.id === mealId);
      if (updatedMeal) {
        const shouldSync = await confirm(
          isArabic 
            ? "لقد قمت بتعديل الوجبة الغذائية. هل ترغب في تحديث ومزامنة هذا التعديل الجديد في مهام جوجل (Google Tasks)؟" 
            : "You modified the meal. Would you like to update and sync this new change to Google Tasks?",
          {
            title: isArabic ? "مزامنة التعديلات مع جوجل؟" : "Sync Changes with Google?",
            confirmText: isArabic ? "نعم، مزامنة" : "Yes, Sync",
            cancelText: isArabic ? "ليس الآن" : "Not now",
            type: 'info'
          }
        );
        if (shouldSync) {
          try {
            const updatedTask = await syncMealToGoogleTasks(token, googleTaskListId, updatedMeal, activeUpdatedDay.dayNumber, mealIndex, isArabic);
            if (updatedTask && updatedTask.id) {
              const finalDays = updatedDays.map((d, dIdx) => {
                if (dIdx !== activeDayIndex) return d;
                return {
                  ...d,
                  meals: d.meals.map(m => m.id === mealId ? { ...m, googleTaskId: updatedTask.id } : m)
                };
              });
              onUpdateDays(finalDays);
              await alert(
                isArabic ? "تم تحديث الوجبة بنجاح في مهام جوجل!" : "Successfully updated meal in Google Tasks!",
                {
                  title: isArabic ? "مزامنة ناجحة" : "Sync Successful",
                  type: 'success'
                }
              );
            }
          } catch (error) {
            console.error("Error syncing meal to Google Tasks:", error);
            await alert(
              isArabic ? "حدث خطأ أثناء المزامنة. يرجى المحاولة مرة أخرى." : "An error occurred during sync. Please try again.",
              {
                title: isArabic ? "خطأ في المزامنة" : "Sync Error",
                type: 'error'
              }
            );
          }
        }
      }
    }
  };

  const handleSwapIngredient = async (mealId: string, ingredientIndex: number, swapToOption: any) => {
    const updatedDays = days.map((day, idx) => {
      if (idx !== activeDayIndex) return day;
      return {
        ...day,
        meals: day.meals.map(m => {
          if (m.id === mealId) {
            const updatedIngredients = m.ingredients.map((ing, iIdx) => {
              if (iIdx === ingredientIndex) {
                const currentAsOption = {
                  name: ing.name,
                  arabicName: ing.arabicName,
                  amount: ing.amount,
                  arabicAmount: ing.arabicAmount
                };
                const remainingSwaps = ing.swapOptions.filter(so => so.name !== swapToOption.name);
                return {
                  ...ing,
                  name: swapToOption.name,
                  arabicName: swapToOption.arabicName,
                  amount: swapToOption.amount,
                  arabicAmount: swapToOption.arabicAmount,
                  swapOptions: [currentAsOption, ...remainingSwaps]
                };
              }
              return ing;
            });
            return {
              ...m,
              ingredients: updatedIngredients
            };
          }
          return m;
        })
      };
    });
    onUpdateDays(updatedDays);
    setActiveSwapIngredientKey(null);

    // Ask user to sync to Google Tasks if they are logged in
    const token = getAccessToken();
    if (token && googleTaskListId) {
      const activeUpdatedDay = updatedDays[activeDayIndex];
      const updatedMeal = activeUpdatedDay.meals.find(m => m.id === mealId);
      const mealIndex = activeUpdatedDay.meals.findIndex(m => m.id === mealId);
      if (updatedMeal) {
        const shouldSync = await confirm(
          isArabic 
            ? "لقد قمت بتعديل مكونات الوجبة. هل ترغب في تحديث ومزامنة هذا التعديل الجديد في مهام جوجل (Google Tasks)؟" 
            : "You modified the meal ingredients. Would you like to update and sync this new change to Google Tasks?",
          {
            title: isArabic ? "مزامنة التعديلات مع جوجل؟" : "Sync Changes with Google?",
            confirmText: isArabic ? "نعم، مزامنة" : "Yes, Sync",
            cancelText: isArabic ? "ليس الآن" : "Not now",
            type: 'info'
          }
        );
        if (shouldSync) {
          try {
            const updatedTask = await syncMealToGoogleTasks(token, googleTaskListId, updatedMeal, activeUpdatedDay.dayNumber, mealIndex, isArabic);
            if (updatedTask && updatedTask.id) {
              const finalDays = updatedDays.map((d, dIdx) => {
                if (dIdx !== activeDayIndex) return d;
                return {
                  ...d,
                  meals: d.meals.map(m => m.id === mealId ? { ...m, googleTaskId: updatedTask.id } : m)
                };
              });
              onUpdateDays(finalDays);
              await alert(
                isArabic ? "تم تحديث مكونات الوجبة بنجاح في مهام جوجل!" : "Successfully updated meal ingredients in Google Tasks!",
                {
                  title: isArabic ? "مزامنة ناجحة" : "Sync Successful",
                  type: 'success'
                }
              );
            }
          } catch (error) {
            console.error("Error syncing meal ingredients to Google Tasks:", error);
            await alert(
              isArabic ? "حدث خطأ أثناء المزامنة. يرجى المحاولة مرة أخرى." : "An error occurred during sync. Please try again.",
              {
                title: isArabic ? "خطأ في المزامنة" : "Sync Error",
                type: 'error'
              }
            );
          }
        }
      }
    }
  };

  const dayLabel = (name: string) => {
    const map: Record<string, string> = {
      Monday: isArabic ? "الإثنين" : "Monday",
      Tuesday: isArabic ? "الثلاثاء" : "Tuesday",
      Wednesday: isArabic ? "الأربعاء" : "Wednesday",
      Thursday: isArabic ? "الخميس" : "Thursday",
      Friday: isArabic ? "الجمعة" : "Friday",
      Saturday: isArabic ? "السبت" : "Saturday",
      Sunday: isArabic ? "الأحد" : "Sunday",
    };
    return map[name] || name;
  };

  // Coaching tips
  const coachAdvice = {
    en: {
      title: "Coach's Nutrition Protocol",
      desc: "For maximum hyper-recovery, hydrate before meals. Toggling meals as 'eaten' tracks your dynamic calories. Swap ingredients if items are unavailable in your kitchen."
    },
    ar: {
      title: "بروتوكول الكابتن الغذائي",
      desc: "لتحقيق أقصى استشفاء وبناء عضلي، احرص على الترطيب وشرب الماء قبل الوجبات. تسجيل تناول الوجبة يحسب سعراتك المستهلكة بدقة وتلقائياً. يمكنك استبدال أي عنصر غير متوفر بمطابخك ببديل مكافئ."
    }
  };

  const advice = isArabic ? coachAdvice.ar : coachAdvice.en;

  // Percentage calculations for progress gauges
  const calPct = Math.min(Math.round((consumedCalories / macros.calories) * 100), 120);
  const proPct = Math.min(Math.round((consumedProtein / macros.protein) * 100), 120);
  const carbPct = Math.min(Math.round((consumedCarbs / macros.carbs) * 100), 120);
  const fatPct = Math.min(Math.round((consumedFat / macros.fat) * 100), 120);

  return (
    <div className="space-y-6 animate-fade-in" id="nutrition-module">
      
      {/* Day Selector for Meal Plans */}
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const isActive = idx === activeDayIndex;
          const eatenCount = (day.meals || []).filter(m => m.isEaten).length;
          const totalMeals = (day.meals || []).length;

          return (
            <button
              key={day.dayNumber}
              onClick={() => {
                setActiveDayIndex(idx);
                setActiveSwapMealId(null);
                setActiveSwapIngredientKey(null);
              }}
              className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md glow-emerald'
                  : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
              }`}
            >
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase opacity-50">
                {isArabic ? `اليوم ${day.dayNumber}` : `DAY 0${day.dayNumber}`}
              </span>
              <span className="text-sm font-display font-semibold mt-1">
                {dayLabel(day.dayName).substring(0, isArabic ? 7 : 3)}
              </span>
              
              {/* Daily Meal Check Progress */}
              <div className="flex items-center gap-1 mt-2 text-[10px] font-mono text-zinc-500">
                <Utensils size={10} className={eatenCount === totalMeals && totalMeals > 0 ? "text-emerald-400" : ""} />
                <span>{eatenCount}/{totalMeals}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Consumed Calories & Macro Gauges */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                  {isArabic ? "متابع الطاقة والمغذيات الكبرى" : "DYNAMIC ENERGY & MACROS METERS"}
                </span>
                <h3 className="text-xl font-display font-bold text-white mt-1">
                  {isArabic 
                    ? `تغذية وسعرات: ${dayLabel(activeDay.dayName)}` 
                    : `Nutrition tracker: ${dayLabel(activeDay.dayName)}`}
                </h3>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase font-bold">
                    {isArabic ? "مستهلك / مستهدف" : "CONSUMED / TARGET"}
                  </span>
                  <span className="text-lg font-mono font-black text-white">
                    {consumedCalories} <span className="text-zinc-500 text-xs">/ {macros.calories} kcal</span>
                  </span>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
                  <Flame size={20} className="animate-pulse" />
                </div>
              </div>
            </div>

            {/* Micro Progress Line for Calories */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">{isArabic ? "نسبة إتمام سعرات اليوم:" : "Caloric energy progress:"}</span>
                <span className="text-emerald-400 font-bold">{calPct}%</span>
              </div>
              <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(calPct, 100)}%` }}
                />
              </div>
            </div>

            {/* Protein, Carbs, Fats Tracker Grid */}
            <div className="grid grid-cols-3 gap-4">
              
              {/* Protein Tracker */}
              <div className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-4 text-center relative overflow-hidden">
                <span className="text-xs text-zinc-500 font-bold block uppercase">
                  {isArabic ? "بروتين" : "Protein"}
                </span>
                <span className="text-xl font-mono font-black text-emerald-400 block mt-2">
                  {consumedProtein}g <span className="text-zinc-600 text-xs">/ {macros.protein}g</span>
                </span>
                <div className="w-full bg-zinc-900 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${proPct}%` }} />
                </div>
                <span className="text-[10px] font-mono text-zinc-500 block mt-2">
                  {proPct}% {isArabic ? "مكتمل" : "done"}
                </span>
              </div>

              {/* Carbs Tracker */}
              <div className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-4 text-center relative overflow-hidden">
                <span className="text-xs text-zinc-500 font-bold block uppercase">
                  {isArabic ? "كربوهيدرات" : "Carbs"}
                </span>
                <span className="text-xl font-mono font-black text-blue-400 block mt-2">
                  {consumedCarbs}g <span className="text-zinc-600 text-xs">/ {macros.carbs}g</span>
                </span>
                <div className="w-full bg-zinc-900 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${carbPct}%` }} />
                </div>
                <span className="text-[10px] font-mono text-zinc-500 block mt-2">
                  {carbPct}% {isArabic ? "مكتمل" : "done"}
                </span>
              </div>

              {/* Fats Tracker */}
              <div className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-4 text-center relative overflow-hidden">
                <span className="text-xs text-zinc-500 font-bold block uppercase">
                  {isArabic ? "دهون" : "Fats"}
                </span>
                <span className="text-xl font-mono font-black text-purple-400 block mt-2">
                  {consumedFat}g <span className="text-zinc-600 text-xs">/ {macros.fat}g</span>
                </span>
                <div className="w-full bg-zinc-900 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${fatPct}%` }} />
                </div>
                <span className="text-[10px] font-mono text-zinc-500 block mt-2">
                  {fatPct}% {isArabic ? "مكتمل" : "done"}
                </span>
              </div>

            </div>
          </div>

          {/* Meals List for Selected Day */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h4 className="text-md font-display font-bold text-white flex items-center gap-2">
                <Utensils size={16} className="text-emerald-400" />
                <span>{isArabic ? "جدول وجبات اليوم" : "Today's Meal Schedule"}</span>
              </h4>
              <span className="text-xs text-zinc-500 font-mono">
                {isArabic ? "اضغط على الوجبة لتسجيل تناولها" : "Check meals once eaten"}
              </span>
            </div>

            {dailyMeals.length === 0 ? (
              <div className="glass-panel rounded-3xl p-8 text-center text-zinc-500">
                {isArabic ? "لم يتم العثور على وجبات لهذا اليوم." : "No meals found for this day."}
              </div>
            ) : (
              dailyMeals.map((meal) => {
                const isSwappingMeal = activeSwapMealId === meal.id;

                return (
                  <div 
                    key={meal.id}
                    className={`glass-panel rounded-3xl p-5 border transition-all duration-300 relative ${
                      meal.isEaten 
                        ? 'bg-zinc-950/30 border-emerald-500/20 opacity-70' 
                        : 'bg-zinc-950/60 border-zinc-900 hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* Left Side: Checkbox, Meal Name & Macros */}
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleMealEaten(meal.id)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-1 transition-all ${
                            meal.isEaten
                              ? 'bg-emerald-500 border-emerald-400 text-zinc-950'
                              : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-transparent'
                          }`}
                        >
                          <Check size={14} className="stroke-[3]" />
                        </button>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`text-base font-semibold ${meal.isEaten ? 'line-through text-zinc-500' : 'text-white'}`}>
                              {isArabic ? meal.arabicName : meal.name}
                            </h4>
                            <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-[10px] text-orange-400 font-mono font-bold rounded-md">
                              {meal.calories} kcal
                            </span>
                          </div>

                          {/* Meal Macros breakdown chips */}
                          <div className="flex gap-2.5 mt-2 text-[10px] font-mono text-zinc-500">
                            <span>P: <span className="text-emerald-400 font-bold">{meal.protein}g</span></span>
                            <span>C: <span className="text-blue-400 font-bold">{meal.carbs}g</span></span>
                            <span>F: <span className="text-purple-400 font-bold">{meal.fat}g</span></span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Meal swapping button */}
                      {meal.swapOptions && meal.swapOptions.length > 0 && (
                        <div className="relative self-end md:self-center">
                          <button
                            onClick={() => {
                              setActiveSwapMealId(isSwappingMeal ? null : meal.id);
                              setActiveSwapIngredientKey(null);
                            }}
                            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition flex items-center gap-1.5 text-xs font-semibold"
                          >
                            <Shuffle size={12} className="text-emerald-500 animate-pulse" />
                            <span>{isArabic ? "استبدال الوجبة بالكامل" : "Swap Meal"}</span>
                          </button>

                          {/* Meal Swap Dropdown */}
                          {isSwappingMeal && (
                            <div className={`absolute z-30 mt-2 w-72 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-2 font-sans ${
                              isArabic ? 'left-0 right-auto' : 'right-0'
                            }`}>
                              <div className="px-3 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider border-b border-zinc-900 mb-1">
                                {isArabic ? "اختر وجبة بديلة مكافئة:" : "Select macro-equivalent meal:"}
                              </div>
                              {meal.swapOptions.map((option) => (
                                <button
                                  key={option.name}
                                  onClick={() => handleSwapMeal(meal.id, option)}
                                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-zinc-300 hover:bg-emerald-500 hover:text-zinc-950 transition-all font-medium flex flex-col gap-1"
                                >
                                  <div className="flex justify-between items-center w-full font-semibold">
                                    <span>{isArabic ? option.arabicName : option.name}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 bg-zinc-900 rounded text-orange-400">{option.calories} kcal</span>
                                  </div>
                                  <div className="flex gap-2 text-[9px] text-zinc-500 font-mono">
                                    <span>P: {option.protein}g</span>
                                    <span>C: {option.carbs}g</span>
                                    <span>F: {option.fat}g</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Ingredients List with individual swap buttons */}
                    <div className="mt-4 pt-4 border-t border-zinc-900 space-y-3">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold block">
                        {isArabic ? "مكونات الوجبة ومقاديرها:" : "INGREDIENTS & PORTIONS:"}
                      </span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {meal.ingredients.map((ing, ingIdx) => {
                          const ingredientKey = `${meal.id}_${ingIdx}`;
                          const isSwappingIngredient = activeSwapIngredientKey === ingredientKey;

                          return (
                            <div 
                              key={ingIdx}
                              className="p-3 bg-zinc-950/40 border border-zinc-900/60 rounded-xl flex justify-between items-center text-xs relative"
                            >
                              <div>
                                <span className="font-semibold text-zinc-300 block">
                                  {isArabic ? ing.arabicName : ing.name}
                                </span>
                                <span className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5 block">
                                  {isArabic ? ing.arabicAmount : ing.amount}
                                </span>
                              </div>

                              {/* Ingredient Swap option trigger */}
                              {ing.swapOptions && ing.swapOptions.length > 0 && (
                                <div className="relative">
                                  <button
                                    onClick={() => {
                                      setActiveSwapIngredientKey(isSwappingIngredient ? null : ingredientKey);
                                      setActiveSwapMealId(null);
                                    }}
                                    className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-400 transition"
                                    title={isArabic ? "استبدال هذا المكون ببديل صحي" : "Swap ingredient"}
                                  >
                                    <RefreshCw size={12} />
                                  </button>

                                  {/* Ingredient Swap Dropdown */}
                                  {isSwappingIngredient && (
                                    <div className={`absolute z-30 mt-2 w-64 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-1.5 font-sans ${
                                      isArabic ? 'left-0 right-auto' : 'right-0'
                                    }`}>
                                      <div className="px-2.5 py-1.5 text-[9px] font-mono text-zinc-500 uppercase tracking-wider border-b border-zinc-900 mb-1">
                                        {isArabic ? "بدائل صحية بنفس القيمة:" : "Healthier equivalents:"}
                                      </div>
                                      {ing.swapOptions.map((opt) => (
                                        <button
                                          key={opt.name}
                                          onClick={() => handleSwapIngredient(meal.id, ingIdx, opt)}
                                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-emerald-500 hover:text-zinc-950 transition-all font-medium flex items-center justify-between"
                                        >
                                          <span>{isArabic ? opt.arabicName : opt.name}</span>
                                          <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">{isArabic ? opt.arabicAmount : opt.amount}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar: Hydration Tracker & Coach Box */}
        <div className="space-y-6">
          
          {/* Water Hydration Tracker */}
          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="text-center mb-6">
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider block mb-1">
                {isArabic ? "مؤشر ترطيب الخلايا والمفاصل" : "DAILY HYDRATION TARGET"}
              </span>
              <h4 className="text-lg font-display font-bold text-white">
                {isArabic ? "متابع شرب المياه" : "Hydration Tracker"}
              </h4>
            </div>

            <div className="flex flex-col items-center justify-center py-4 relative">
              {/* Visual Glass Water Indicator */}
              <div className="relative w-28 h-36 border-4 border-zinc-800 rounded-b-3xl rounded-t-lg overflow-hidden flex items-end justify-center mb-4 bg-zinc-950 shadow-inner">
                <div 
                  className="bg-blue-500/20 border-t border-blue-400 w-full transition-all duration-500 flex items-center justify-center"
                  style={{ height: `${Math.min((consumedWater / macros.water) * 100, 100)}%` }}
                >
                  {consumedWater > 0 && (
                    <span className="text-xs font-mono font-bold text-blue-400 animate-pulse absolute bottom-4">
                      {Math.round((consumedWater / macros.water) * 100)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="text-center">
                <span className="text-2xl font-mono font-black text-white">{consumedWater}</span>
                <span className="text-zinc-500 font-mono text-sm"> / {macros.water} L</span>
              </div>

              {/* Quick Adjust Buttons */}
              <div className="flex gap-2 mt-6 w-full">
                <button 
                  onClick={() => addWater(-0.5)}
                  className="flex-1 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-zinc-400 p-2.5 rounded-xl transition flex justify-center items-center"
                  title="-500ml"
                >
                  <Minus size={14} />
                </button>
                <button 
                  onClick={() => addWater(0.25)}
                  className="flex-2 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500 hover:text-zinc-950 text-blue-400 p-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1"
                >
                  <Plus size={12} />
                  <span>250ml</span>
                </button>
                <button 
                  onClick={() => addWater(0.5)}
                  className="flex-2 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500 hover:text-zinc-950 text-blue-400 p-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1"
                >
                  <Plus size={12} />
                  <span>500ml</span>
                </button>
              </div>
            </div>
          </div>

          {/* Expert Coach Box */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-2 text-orange-400 mb-3">
              <Lightbulb size={18} />
              <h5 className="font-display font-bold text-sm">
                {advice.title}
              </h5>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {advice.desc}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
