/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, GeneratedPlan, WorkoutDay } from './types';
import { calculateMacros, generateWorkoutPlan } from './utils/fitnessLogic';
import OnboardingForm from './components/OnboardingForm';
import Dashboard from './components/Dashboard';
import GoogleTasksSync from './components/GoogleTasksSync';
import { Sparkles, Globe, LogOut, Dumbbell, RotateCcw, User, CheckSquare } from 'lucide-react';

const STORAGE_KEY = 'athlete_lifeos_plan';
const LANG_KEY = 'athlete_lifeos_lang';

export default function App() {
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [isArabic, setIsArabic] = useState<boolean>(true); // Default to Arabic as requested by user's intro
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [showTasksOnboarding, setShowTasksOnboarding] = useState<boolean>(false);

  // Monitor page scroll position to trigger sticky transitions
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load plan and language from localStorage on mount
  useEffect(() => {
    const savedPlan = localStorage.getItem(STORAGE_KEY);
    if (savedPlan) {
      try {
        setPlan(JSON.parse(savedPlan));
      } catch (e) {
        console.error("Error parsing saved athletic plan:", e);
      }
    }

    const savedLang = localStorage.getItem(LANG_KEY);
    if (savedLang) {
      setIsArabic(savedLang === 'ar');
    }
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => {
    // 1. Calculate caloric and macro distributions
    const macros = calculateMacros(profile);
    
    // 2. Generate customized adaptive training plan splits & daily meals
    const days = generateWorkoutPlan(profile);

    const newPlan: GeneratedPlan = {
      profile,
      macros,
      days
    };

    setPlan(newPlan);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlan));
    setShowTasksOnboarding(true); // Trigger Google Tasks sync prompt!
  };

  const handleUpdatePlan = (updatedPlan: GeneratedPlan) => {
    setPlan(updatedPlan);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlan));
  };

  const handleUpdateDays = (updatedDays: WorkoutDay[]) => {
    if (!plan) return;
    const newPlan: GeneratedPlan = {
      ...plan,
      days: updatedDays
    };
    handleUpdatePlan(newPlan);
  };

  const handleReset = () => {
    if (window.confirm(isArabic ? "هل أنت متأكد من رغبتك في إعادة تعيين خطتك وتصميم خطة جديدة؟" : "Are you sure you want to reset your plan and start onboarding over?")) {
      setPlan(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const toggleLanguage = () => {
    const nextLang = !isArabic;
    setIsArabic(nextLang);
    localStorage.setItem(LANG_KEY, nextLang ? 'ar' : 'en');
  };

  // Helper to resolve translation of split name
  const getSystemLabel = (system: string) => {
    const map: Record<string, string> = {
      arnold: isArabic ? "تقسيم أرنولد" : "Arnold Split",
      ppl: isArabic ? "دفع سحب أرجل" : "Push Pull Legs",
      upper_lower: isArabic ? "علوي / سفلي" : "Upper / Lower",
      bro_split: isArabic ? "برو سبليت" : "Bro Split",
    };
    return map[system] || system;
  };

  const getGoalLabel = (goal: string) => {
    const map: Record<string, string> = {
      bulking: isArabic ? "تضخيم" : "Bulking",
      cutting: isArabic ? "تنشيف" : "Cutting",
      maintenance: isArabic ? "ثبات" : "Maintenance",
    };
    return map[goal] || goal;
  };

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950 w-full overflow-x-hidden relative" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Absolute ambient lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Global Navigation Header - sticky with scroll-driven layout shift */}
      <header className={`border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md z-50 sticky top-0 transition-all duration-300 ${
        isScrolled ? 'py-2 px-4 shadow-xl border-emerald-500/10' : 'py-4 px-4'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Header Left: Branding & Dynamic Scrolling Greeting */}
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-gradient-to-tr from-emerald-500 to-emerald-600 rounded-xl text-zinc-950 shadow-lg shadow-emerald-500/10 transition-all duration-300 ${
              isScrolled ? 'scale-90 p-1.5' : ''
            }`}>
              <Dumbbell size={isScrolled ? 16 : 20} className="stroke-[2.5]" />
            </div>
            
            {/* Transition-driven visual container */}
            <div className="flex items-center gap-3">
              <span className="font-display font-extrabold text-md md:text-lg text-white tracking-tight flex items-center gap-1">
                <span>Athlete LifeOS</span>
                {!isScrolled && (
                  <span className="text-[9px] py-0.5 px-1.5 bg-zinc-900 border border-zinc-800 text-zinc-500 font-bold rounded-full ml-1">
                    v1.1.0
                  </span>
                )}
              </span>

              {/* Dynamic scroll indicator: Greeting & biometrics shift into header */}
              {isScrolled && plan && (
                <div className="flex items-center gap-2 border-r md:border-l border-zinc-800 pr-3 pl-3 animate-fade-in text-xs">
                  <div className="w-6 h-6 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center font-bold text-[10px]">
                    {plan.profile.name.substring(0, 1).toUpperCase()}
                  </div>
                  <span className="text-white font-medium">
                    {isArabic ? "مرحباً، " : "Hi, "}
                    <span className="text-emerald-400 font-bold">{plan.profile.name}</span>
                  </span>
                  
                  {/* Subtle split & goal chips in header */}
                  <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] text-zinc-400 font-mono">
                    {getSystemLabel(plan.profile.trainingSystem)}
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[10px] text-emerald-400 font-mono font-semibold">
                    {getGoalLabel(plan.profile.goal)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Header Right: Language & Reset actions */}
          <div className="flex items-center gap-2">
            
            {/* Small reset button shortcut inside header when scrolled */}
            {isScrolled && plan && (
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg border border-zinc-900 bg-zinc-950/40 text-zinc-500 hover:text-red-400 hover:border-zinc-800 transition"
                title={isArabic ? "إعادة تعيين الخطة" : "Reset Plan"}
              >
                <RotateCcw size={14} />
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-white hover:border-zinc-700 transition text-xs font-semibold"
            >
              <Globe size={14} className="text-emerald-500 shrink-0" />
              <span>{isArabic ? 'English' : 'العربية'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-grow flex flex-col items-center justify-center relative z-10 pb-16">
        {plan ? (
          <>
            <Dashboard 
              plan={plan} 
              onUpdateDays={handleUpdateDays} 
              onUpdatePlan={handleUpdatePlan}
              onReset={handleReset} 
              isArabic={isArabic} 
              isScrolled={isScrolled}
            />
            {showTasksOnboarding && (
              <GoogleTasksSync 
                plan={plan} 
                onUpdatePlan={handleUpdatePlan} 
                isArabic={isArabic} 
                showOnboardingPromptInitially={true} 
                onClose={() => setShowTasksOnboarding(false)} 
              />
            )}
          </>
        ) : (
          <OnboardingForm 
            onComplete={handleOnboardingComplete} 
            isArabic={isArabic} 
          />
        )}
      </main>

      {/* Humble credit footer */}
      <footer className="border-t border-zinc-900/60 bg-zinc-950/20 py-6 text-center text-xs text-zinc-600 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Athlete LifeOS. Built for athletes and strength developers.</span>
          <span className="flex items-center gap-1 text-[10px]">
            <Sparkles size={10} className="text-emerald-400 animate-pulse" />
            Designed by Ahmed & AI Architect
          </span>
        </div>
      </footer>
    </div>
  );
}
