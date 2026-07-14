/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WorkoutDay, Exercise } from '../types';
import { 
  Dumbbell, 
  Check, 
  RefreshCw, 
  Award, 
  Info,
  ChevronDown,
  CalendarDays,
  Shuffle
} from 'lucide-react';

interface WorkoutPlannerProps {
  days: WorkoutDay[];
  onUpdateDays: (updatedDays: WorkoutDay[]) => void;
  isArabic: boolean;
}

export default function WorkoutPlanner({ days, onUpdateDays, isArabic }: WorkoutPlannerProps) {
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [activeSwapExerciseId, setActiveSwapExerciseId] = useState<string | null>(null);

  const activeDay = days[activeDayIndex] || days[0];

  const toggleComplete = (id: string) => {
    setCompletedExercises(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSwapExercise = (exerciseId: string, swapToName: string) => {
    // Locate the exercise, swap its name, find if we can update notes, and update state
    const updatedDays = days.map(day => {
      return {
        ...day,
        exercises: day.exercises.map(ex => {
          if (ex.id === exerciseId) {
            // Find notes or keep existing
            return {
              ...ex,
              name: swapToName,
              notes: isArabic 
                ? "تمرين بديل تم اختياره للتوافق مع رغبتك أو حالتك الصحية."
                : "Alternative exercise selected for personal preference or joint-friendliness."
            };
          }
          return ex;
        })
      };
    });

    onUpdateDays(updatedDays);
    setActiveSwapExerciseId(null);
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

  return (
    <div className="space-y-6" id="workout-planner-module">
      {/* Week Day Selector - Horizontal Grid */}
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const isActive = idx === activeDayIndex;
          const isRest = day.isRest;
          const allDone = !isRest && day.exercises.length > 0 && day.exercises.every(ex => completedExercises[ex.id]);

          return (
            <button
              key={day.dayNumber}
              onClick={() => {
                setActiveDayIndex(idx);
                setActiveSwapExerciseId(null);
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
              
              {/* Indicators */}
              <div className="flex gap-1 mt-2">
                {isRest ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" title="Rest Day" />
                ) : allDone ? (
                  <Check size={10} className="text-emerald-400" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Focus Area for Selected Day */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        {/* Decorative corner glows */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-900 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays size={16} className="text-emerald-400" />
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold">
                {isArabic ? `تفاصيل اليوم ${activeDay.dayNumber}` : `DAY ${activeDay.dayNumber} OVERVIEW`}
              </span>
            </div>
            <h3 className="text-2xl font-display font-bold text-white">
              {dayLabel(activeDay.dayName)} - <span className="text-zinc-400 font-normal text-lg">{activeDay.focus}</span>
            </h3>
          </div>

          <div className="flex gap-2">
            {activeDay.isRest ? (
              <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold rounded-full">
                {isArabic ? "استشفاء نشط" : "Recovery Mode"}
              </span>
            ) : (
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1">
                <Dumbbell size={12} />
                {activeDay.exercises.length} {isArabic ? "تمارين" : "Exercises"}
              </span>
            )}
          </div>
        </div>

        {/* Exercises List */}
        {activeDay.isRest ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-900 text-zinc-500">
              <Award size={40} className="stroke-[1.5]" />
            </div>
            <div className="max-w-md">
              <h4 className="text-lg font-semibold text-white mb-2">
                {isArabic ? "يوم استشفاء ونمو عضلي" : "Muscle Recovery & Growth Day"}
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {isArabic
                  ? "العضلات لا تنمو أثناء التمرين بل تنمو أثناء الراحة! ركز اليوم على التغذية السليمة، شرب المياه، والنوم لمدة 7-8 ساعات، مع المشي الخفيف أو الإطالات."
                  : "Muscles are torn in the gym, fed in the kitchen, and built in bed. Prioritize high-quality protein, hydration, stretching, and 7-9 hours of sound sleep."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeDay.exercises.map((exercise) => {
              const isCompleted = completedExercises[exercise.id];
              const isSwapping = activeSwapExerciseId === exercise.id;

              return (
                <div 
                  key={exercise.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 relative ${
                    isCompleted 
                      ? 'bg-zinc-950/30 border-emerald-500/20 opacity-60' 
                      : 'bg-zinc-950/60 border-zinc-900 hover:border-zinc-800'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Checkbox + Name */}
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleComplete(exercise.id)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-1 transition-all ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-400 text-zinc-950'
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-transparent'
                        }`}
                      >
                        <Check size={14} className="stroke-[3]" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-base font-semibold ${isCompleted ? 'line-through text-zinc-500' : 'text-white'}`}>
                            {exercise.name}
                          </h4>
                          <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 font-mono rounded">
                            {exercise.category}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 flex items-start gap-1 leading-relaxed">
                          <Info size={12} className="text-zinc-500 shrink-0 mt-0.5" />
                          <span>{exercise.notes}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right: Sets & Reps + Swap Button */}
                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-none pt-3 md:pt-0 border-zinc-900">
                      <div className="flex gap-4 text-xs font-mono">
                        <div className="text-zinc-500">
                          {isArabic ? "المجموعات:" : "SETS:"} <span className="text-emerald-400 font-bold text-sm ml-1">{exercise.sets}</span>
                        </div>
                        <div className="text-zinc-500">
                          {isArabic ? "التكرارات:" : "REPS:"} <span className="text-emerald-400 font-bold text-sm ml-1">{exercise.reps}</span>
                        </div>
                      </div>

                      {/* Swap trigger */}
                      {exercise.swapOptions && exercise.swapOptions.length > 0 && (
                        <div className="relative">
                          <button
                            onClick={() => {
                              setActiveSwapExerciseId(isSwapping ? null : exercise.id);
                            }}
                            className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition flex items-center gap-1.5 text-xs"
                            title={isArabic ? "استبدال التمرين يدوياً" : "Swap exercise"}
                          >
                            <Shuffle size={14} className="text-emerald-500" />
                            <span className="hidden sm:inline">{isArabic ? "استبدال" : "Swap"}</span>
                          </button>

                          {/* Swap dropdown overlay */}
                          {isSwapping && (
                            <div className={`absolute right-0 z-20 mt-2 w-64 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-2 font-sans ${
                              isArabic ? 'left-0 right-auto' : 'right-0'
                            }`}>
                              <div className="px-3 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider border-b border-zinc-900 mb-1">
                                {isArabic ? "اختر تمرينًا بديلًا مناسبًا:" : "Select alternative exercise:"}
                              </div>
                              {exercise.swapOptions.map((option) => (
                                <button
                                  key={option}
                                  onClick={() => handleSwapExercise(exercise.id, option)}
                                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-emerald-500 hover:text-zinc-950 transition-all font-medium flex items-center justify-between"
                                >
                                  <span>{option}</span>
                                  <RefreshCw size={10} className="opacity-50" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
