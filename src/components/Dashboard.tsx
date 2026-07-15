/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GeneratedPlan, WorkoutDay } from '../types';
import WorkoutPlanner from './WorkoutPlanner';
import NutritionDashboard from './NutritionDashboard';
import GoogleTasksSync from './GoogleTasksSync';
import { 
  Dumbbell, 
  Flame, 
  Activity, 
  RotateCcw, 
  Scale, 
  Award,
  CheckSquare
} from 'lucide-react';

interface DashboardProps {
  plan: GeneratedPlan;
  onUpdateDays: (updatedDays: WorkoutDay[]) => void;
  onUpdatePlan: (updatedPlan: GeneratedPlan) => void;
  onReset: () => void;
  isArabic: boolean;
  isScrolled?: boolean;
}

type TabType = 'workout' | 'nutrition' | 'googleTasks';

export default function Dashboard({ plan, onUpdateDays, onUpdatePlan, onReset, isArabic, isScrolled = false }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('workout');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isSidebarExpanded || isHovered;
  const { profile, macros, days } = plan;

  // Translations
  const t = {
    en: {
      workoutTab: "Training Program",
      nutritionTab: "Nutrition & Macros",
      googleTasksTab: "Google Tasks Sync",
      welcome: "Welcome back,",
      reset: "Reset Plan",
      level: "Level",
      goal: "Goal",
      system: "System",
      weight: "Weight",
      height: "Height",
      bulking: "Bulking",
      cutting: "Cutting",
      maintenance: "Maintenance",
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced"
    },
    ar: {
      workoutTab: "الجدول الرياضي",
      nutritionTab: "التغذية والسعرات",
      googleTasksTab: "مزامنة جوجل",
      welcome: "أهلاً بك مجدداً،",
      reset: "إعادة تعيين الخطة",
      level: "المستوى",
      goal: "الهدف",
      system: "النظام",
      weight: "الوزن",
      height: "الطول",
      bulking: "تضخيم",
      cutting: "تنشيف",
      maintenance: "محافظة",
      beginner: "مبتدئ",
      intermediate: "متوسط",
      advanced: "متقدم"
    }
  };

  const currentT = isArabic ? t.ar : t.en;

  const translateGoal = (goal: string) => {
    if (goal === 'bulking') return currentT.bulking;
    if (goal === 'cutting') return currentT.cutting;
    return currentT.maintenance;
  };

  const translateLevel = (lvl: string) => {
    if (lvl === 'beginner') return currentT.beginner;
    if (lvl === 'intermediate') return currentT.intermediate;
    return currentT.advanced;
  };

  const systemName = () => {
    const map: Record<string, string> = {
      arnold: isArabic ? "تقسيم أرنولد" : "Arnold Split",
      ppl: isArabic ? "دفع سحب أرجل (PPL)" : "Push Pull Legs",
      upper_lower: isArabic ? "علوي / سفلي" : "Upper / Lower Split",
      bro_split: isArabic ? "برو سبليت كلاسيك" : "Bro Split",
    };
    return map[profile.trainingSystem] || profile.trainingSystem;
  };

  return (
    <div 
      className="w-full max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 relative items-start" 
      id="dashboard-module"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarExpanded && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarExpanded(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          bg-zinc-950/80 border border-zinc-900/80 rounded-[24px] backdrop-blur-xl
          flex flex-col justify-between py-5 px-2.5 shadow-2xl transition-all duration-300 ease-in-out shrink-0
          ${isExpanded 
            ? 'absolute z-40 w-60 shadow-emerald-500/5' 
            : 'relative w-14'
          }
          md:sticky md:top-[100px] md:h-[calc(100vh-140px)]
          ${isExpanded ? 'md:w-60' : 'md:w-20'}
        `}
      >
        <div className="space-y-6 flex-grow">
          {/* Top Header / Collapse Toggle */}
          <div className={`flex items-center ${isExpanded ? 'justify-between px-2' : 'justify-center'} border-b border-zinc-900/60 pb-4 mb-4`}>
            {isExpanded && (
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest animate-fade-in">
                {isArabic ? "قائمة الخيارات" : "Navigation"}
              </span>
            )}
            <button 
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-emerald-400 rounded-xl transition-all duration-300"
              title={isArabic ? "توسيع القائمة" : "Toggle Sidebar"}
            >
              <Activity size={16} className={isSidebarExpanded ? "rotate-90 text-emerald-400 transition-all duration-300" : "transition-all duration-300"} />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {/* Workout Split Tab */}
            <button
              onClick={() => {
                setActiveTab('workout');
                setIsSidebarExpanded(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition duration-300 ${
                activeTab === 'workout'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <Dumbbell size={18} className="shrink-0" />
              {isExpanded && (
                <span className="text-xs font-bold font-display truncate animate-fade-in">
                  {currentT.workoutTab}
                </span>
              )}
            </button>

            {/* Nutrition Tab */}
            <button
              onClick={() => {
                setActiveTab('nutrition');
                setIsSidebarExpanded(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition duration-300 ${
                activeTab === 'nutrition'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <Flame size={18} className="shrink-0" />
              {isExpanded && (
                <span className="text-xs font-bold font-display truncate animate-fade-in">
                  {currentT.nutritionTab}
                </span>
              )}
            </button>

            {/* Google Sync Tab */}
            <button
              onClick={() => {
                setActiveTab('googleTasks');
                setIsSidebarExpanded(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition duration-300 ${
                activeTab === 'googleTasks'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <CheckSquare size={18} className="shrink-0" />
              {isExpanded && (
                <span className="text-xs font-bold font-display truncate animate-fade-in">
                  {currentT.googleTasksTab}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Quick Reset at Bottom */}
        {isExpanded && (
          <div className="pt-4 border-t border-zinc-900/60 animate-fade-in">
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/40 text-red-400 hover:text-red-300 hover:border-red-900/50 transition text-xs font-semibold"
            >
              <RotateCcw size={12} />
              <span>{currentT.reset}</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Workspace Viewport Area */}
      <div className="flex-grow min-w-0 w-full space-y-8">
        
        {/* Dashboard Top Header */}
        <div 
          className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950/40 rounded-3xl border border-zinc-900/60 relative overflow-hidden backdrop-blur-md transition-all duration-500 ease-in-out ${
            isScrolled 
              ? 'opacity-0 h-0 p-0 my-0 border-none scale-95 pointer-events-none' 
              : 'p-6 opacity-100'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-zinc-950 font-display font-black text-xl shadow-lg shadow-emerald-500/10 shrink-0">
              {profile.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-xs text-zinc-500 block font-semibold uppercase tracking-wider">
                {currentT.welcome}
              </span>
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <span>{profile.name || "Champion"}</span>
                <span className="text-xs py-0.5 px-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-full font-sans">
                  Active LifeOS
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-white hover:border-zinc-700 transition text-xs font-semibold self-end md:self-center"
          >
            <RotateCcw size={14} />
            <span>{currentT.reset}</span>
          </button>
        </div>

        {/* Quick Biometrics Grid Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Weight */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
              <Scale size={18} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">
                {currentT.weight}
              </span>
              <span className="text-base font-mono font-bold text-white">{profile.weight} kg</span>
            </div>
          </div>

          {/* Height */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl shrink-0">
              <Activity size={18} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">
                {currentT.height}
              </span>
              <span className="text-base font-mono font-bold text-white">{profile.height} cm</span>
            </div>
          </div>

          {/* Goal */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl shrink-0">
              <Award size={18} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">
                {currentT.goal}
              </span>
              <span className="text-xs font-semibold text-white">{translateGoal(profile.goal)}</span>
            </div>
          </div>

          {/* Training split */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden">
            <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl shrink-0">
              <Dumbbell size={18} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">
                {currentT.system}
              </span>
              <span className="text-xs font-semibold text-white">{systemName()}</span>
            </div>
          </div>
        </div>

        {/* Selected Workspace Content View */}
        <div className="transition-all duration-300">
          {activeTab === 'workout' && (
            <WorkoutPlanner days={days} onUpdateDays={onUpdateDays} isArabic={isArabic} googleTaskListId={plan.googleTaskListId} />
          )}
          {activeTab === 'nutrition' && (
            <NutritionDashboard days={days} onUpdateDays={onUpdateDays} macros={macros} profile={profile} isArabic={isArabic} googleTaskListId={plan.googleTaskListId} />
          )}
          {activeTab === 'googleTasks' && (
            <GoogleTasksSync plan={plan} onUpdatePlan={onUpdatePlan} isArabic={isArabic} />
          )}
        </div>

      </div>
    </div>
  );
}
