/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import NumberSpinner from './NumberSpinner';
import { 
  User, 
  ChevronRight, 
  ChevronLeft, 
  Flame, 
  Dumbbell, 
  Scale, 
  Compass, 
  Activity, 
  Sparkles,
  Calendar,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface OnboardingFormProps {
  onComplete: (profile: UserProfile) => void;
  isArabic: boolean;
}

export default function OnboardingForm({ onComplete, isArabic }: OnboardingFormProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [form, setForm] = useState<UserProfile>({
    name: '',
    age: 26,
    gender: 'male',
    height: 175,
    weight: 75,
    goal: 'bulking',
    fitnessLevel: 'intermediate',
    trainingSystem: 'ppl',
    daysPerWeek: 4,
    activityLevel: 'moderately_active',
  });

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(form);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateField = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Translations
  const t = {
    en: {
      title: "Athlete LifeOS",
      subtitle: "Personalized Workout & Nutrition Architect",
      next: "Next Step",
      back: "Back",
      generate: "Architect My Plan",
      stepOf: "Step {step} of {total}",
      // Step 1
      nameLabel: "What should we call you?",
      namePlaceholder: "e.g., Captain Ahmed",
      ageLabel: "How old are you?",
      genderLabel: "Gender",
      male: "Male",
      female: "Female",
      // Step 2
      heightLabel: "Height (cm)",
      weightLabel: "Weight (kg)",
      // Step 3
      activityLabel: "Daily Activity Level",
      sedentary: "Sedentary (Office job, minimal exercise)",
      lightly: "Lightly Active (1-3 days/week light workout)",
      moderately: "Moderately Active (3-5 days/week intense workout)",
      very: "Very Active (6-7 days/week hard labor / sports)",
      extra: "Extra Active (Double daily workouts / extreme athlete)",
      fitnessLabel: "Fitness Experience",
      beginner: "Beginner (New to lifting or returning)",
      intermediate: "Intermediate (1-3 years consistent lifting)",
      advanced: "Advanced (3+ years serious strength training)",
      // Step 4
      goalLabel: "Primary Goal",
      bulking: "Bulking (Build maximum muscle & power)",
      cutting: "Cutting (Shred fat, preserve lean mass)",
      maintenance: "Recomp / Maintain (Build strength, burn fat slowly)",
      trainingLabel: "Preferred Training split",
      arnoldSplit: "Arnold Split (Chest/Back, Shoulders/Arms, Legs)",
      pplSplit: "Push Pull Legs (Scientific movement group)",
      upperLower: "Upper / Lower Split (Excellent recovery)",
      broSplit: "Bro Split (Hyper-focus one muscle daily)",
      daysLabel: "Commitment (Days per week to train)",
      daysHelp: "We will automatically insert recovery days dynamically."
    },
    ar: {
      title: "Athlete LifeOS",
      subtitle: "مهندس الأنظمة الغذائية والتمارين الرياضية المخصصة",
      next: "الخطوة التالية",
      back: "السابق",
      generate: "تصميم برنامجي الرياضي",
      stepOf: "الخطوة {step} من {total}",
      // Step 1
      nameLabel: "كيف تود أن نناديك؟",
      namePlaceholder: "مثل: الكابتن أحمد",
      ageLabel: "كم عمرك؟",
      genderLabel: "الجنس",
      male: "ذكر",
      female: "أنثى",
      // Step 2
      heightLabel: "الطول (سم)",
      weightLabel: "الوزن (كجم)",
      // Step 3
      activityLabel: "مستوى النشاط اليومي",
      sedentary: "خامل (عمل مكتبي، تمرين شبه منعدم)",
      lightly: "نشاط خفيف (تمرين خفيف 1-3 أيام/الأسبوع)",
      moderately: "نشط متوسطاً (تمرين متوسط 3-5 أيام/الأسبوع)",
      very: "نشط جداً (تمرين قوي 6-7 أيام/الأسبوع)",
      extra: "نشاط مضاعف (تمرينين يومياً / رياضي محترف)",
      fitnessLabel: "المستوى الرياضي الحالي",
      beginner: "مبتدئ (جديد في اللعبة أو عائد من انقطاع)",
      intermediate: "متوسط (من سنة لـ 3 سنوات تمرين مستمر)",
      advanced: "متقدم (أكثر من 3 سنوات رفع أثقال مكثف)",
      // Step 4
      goalLabel: "الهدف الرئيسي",
      bulking: "تضخيم وبناء عضلات (Bulking)",
      cutting: "تنشيف وحرق دهون (Cutting)",
      maintenance: "المحافظة وإعادة الهيكلة (Maintenance)",
      trainingLabel: "نظام التمارين المفضل",
      arnoldSplit: "تقسيم أرنولد (صدر/ظهر، أكتاف/ذراعين، أرجل)",
      pplSplit: "دفع / سحب / أرجل (تقسيم تشريحي علمي)",
      upperLower: "علوي / سفلي (استشفاء ممتاز وتكرار عالٍ)",
      broSplit: "برو سبليت (عضلة واحدة مركزة يومياً)",
      daysLabel: "أيام التفرغ (كم يوم في الأسبوع؟)",
      daysHelp: "سنقوم بإدراج أيام الراحة والاستشفاء تلقائياً وبذكاء."
    }
  };

  const currentT = isArabic ? t.ar : t.en;

  // Render Step Content
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: isArabic ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isArabic ? 50 : -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
            id="onboarding-step-1"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                <User size={20} />
              </div>
              <h3 className="text-xl font-display font-semibold text-white">
                {isArabic ? "المعلومات الشخصية" : "Personal Profile"}
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                {currentT.nameLabel}
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => updateField('name', e.target.value)}
                placeholder={currentT.namePlaceholder}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition font-sans"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center justify-center bg-zinc-950/30 border border-zinc-900/50 p-4 rounded-2xl">
                <label className="block text-sm font-medium text-zinc-400 mb-2 text-center">
                  {currentT.ageLabel}
                </label>
                <NumberSpinner
                  value={form.age}
                  min={14}
                  max={80}
                  unit={isArabic ? "سنة" : "years"}
                  isArabic={isArabic}
                  onChange={val => updateField('age', val)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  {currentT.genderLabel}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateField('gender', 'male')}
                    className={`py-3 rounded-xl border text-sm font-semibold transition ${
                      form.gender === 'male'
                        ? 'bg-emerald-500/15 border-emerald-500 text-white'
                        : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {currentT.male}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('gender', 'female')}
                    className={`py-3 rounded-xl border text-sm font-semibold transition ${
                      form.gender === 'female'
                        ? 'bg-emerald-500/15 border-emerald-500 text-white'
                        : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {currentT.female}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: isArabic ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isArabic ? 50 : -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
            id="onboarding-step-2"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
                <Scale size={20} />
              </div>
              <h3 className="text-xl font-display font-semibold text-white">
                {isArabic ? "المقاييس الحيوية" : "Biometrics"}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Height Spinner Box */}
              <div className="flex flex-col items-center justify-center bg-zinc-950/30 border border-zinc-900/50 p-4 rounded-2xl">
                <label className="block text-sm font-medium text-zinc-400 mb-3 text-center">
                  {currentT.heightLabel}
                </label>
                <NumberSpinner
                  value={form.height}
                  min={120}
                  max={230}
                  unit="cm"
                  isArabic={isArabic}
                  onChange={val => updateField('height', val)}
                />
              </div>

              {/* Weight Spinner Box */}
              <div className="flex flex-col items-center justify-center bg-zinc-950/30 border border-zinc-900/50 p-4 rounded-2xl">
                <label className="block text-sm font-medium text-zinc-400 mb-3 text-center">
                  {currentT.weightLabel}
                </label>
                <NumberSpinner
                  value={form.weight}
                  min={35}
                  max={180}
                  unit="kg"
                  isArabic={isArabic}
                  onChange={val => updateField('weight', val)}
                />
              </div>
            </div>

            <div className="p-4 bg-blue-950/15 border border-blue-500/10 rounded-xl text-zinc-400 text-xs flex gap-3 leading-relaxed">
              <Sparkles className="text-blue-400 shrink-0 mt-0.5" size={16} />
              <div>
                {isArabic 
                  ? "يستخدم تطبيق Athlete LifeOS معادلة Mifflin-St Jeor المتطورة لربط معدلات استهلاك الطاقة الأساسي مع طبيعة تكوينك الجسماني لضمان توزيع متوازن للـ Macros." 
                  : "Athlete LifeOS leverages the advanced Mifflin-St Jeor formula to evaluate your resting energy expenditure for hyper-focused caloric and macro distribution."
                }
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: isArabic ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isArabic ? 50 : -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
            id="onboarding-step-3"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400">
                <Activity size={20} />
              </div>
              <h3 className="text-xl font-display font-semibold text-white">
                {isArabic ? "مستوى النشاط والخبرة" : "Activity & Experience"}
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                {currentT.activityLabel}
              </label>
              <div className="space-y-2">
                {(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'] as const).map(lvl => {
                  const labelMap = {
                    sedentary: currentT.sedentary,
                    lightly_active: currentT.lightly,
                    moderately_active: currentT.moderately,
                    very_active: currentT.very,
                    extra_active: currentT.extra,
                  };
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => updateField('activityLevel', lvl)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition flex justify-between items-center ${
                        isArabic ? 'text-right' : 'text-left'
                      } ${
                        form.activityLevel === lvl
                          ? 'bg-orange-500/15 border-orange-500 text-white font-medium'
                          : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span>{labelMap[lvl]}</span>
                      {form.activityLevel === lvl && <CheckCircle size={14} className="text-orange-400 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                {currentT.fitnessLabel}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['beginner', 'intermediate', 'advanced'] as const).map(lvl => {
                  const labelMap = {
                    beginner: isArabic ? "مبتدئ" : "Beginner",
                    intermediate: isArabic ? "متوسط" : "Intermediate",
                    advanced: isArabic ? "متقدم" : "Advanced",
                  };
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => updateField('fitnessLevel', lvl)}
                      className={`py-3 px-2 rounded-xl border text-xs font-semibold transition ${
                        form.fitnessLevel === lvl
                          ? 'bg-orange-500/15 border-orange-500 text-white'
                          : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {labelMap[lvl]}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: isArabic ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isArabic ? 50 : -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
            id="onboarding-step-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
                <Dumbbell size={20} />
              </div>
              <h3 className="text-xl font-display font-semibold text-white">
                {isArabic ? "الأهداف والتدريب" : "Goals & Athletics"}
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                {currentT.goalLabel}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['bulking', 'cutting', 'maintenance'] as const).map(g => {
                  const textMap = {
                    bulking: isArabic ? "تضخيم" : "Bulking",
                    cutting: isArabic ? "تنشيف" : "Cutting",
                    maintenance: isArabic ? "ثبات" : "Maintenance",
                  };
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => updateField('goal', g)}
                      className={`py-3 px-2 rounded-xl border text-xs font-semibold transition ${
                        form.goal === g
                          ? 'bg-purple-500/15 border-purple-500 text-white'
                          : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {textMap[g]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                {currentT.trainingLabel}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(['arnold', 'ppl', 'upper_lower', 'bro_split'] as const).map(sys => {
                  const textMap = {
                    arnold: isArabic ? "أرنولد سبليت" : "Arnold Split",
                    ppl: isArabic ? "دفع سحب أرجل (PPL)" : "Push Pull Legs",
                    upper_lower: isArabic ? "علوي / سفلي" : "Upper / Lower",
                    bro_split: isArabic ? "برو سبليت (عضلة)" : "Bro Split",
                  };
                  return (
                    <button
                      key={sys}
                      type="button"
                      onClick={() => updateField('trainingSystem', sys)}
                      className={`p-3 rounded-xl border text-xs font-semibold transition text-center ${
                        form.trainingSystem === sys
                          ? 'bg-purple-500/15 border-purple-500 text-white'
                          : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {textMap[sys]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-zinc-950/30 border border-zinc-900/50 p-4 rounded-2xl">
              <label className="block text-sm font-medium text-zinc-400 mb-3 text-center">
                {currentT.daysLabel}
              </label>
              <NumberSpinner
                value={form.daysPerWeek}
                min={3}
                max={6}
                unit={isArabic ? "أيام" : "days"}
                isArabic={isArabic}
                onChange={val => updateField('daysPerWeek', val)}
              />
              <span className="block text-xs text-zinc-500 mt-3 text-center">
                {currentT.daysHelp}
              </span>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-emerald-400 mb-4 shadow-xl glow-emerald"
        >
          <Compass size={32} />
        </motion.div>
        <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
          {currentT.title}
        </h1>
        <p className="text-sm text-zinc-400 mt-2">
          {currentT.subtitle}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-900 h-1.5 rounded-full mb-8 overflow-hidden border border-zinc-800">
        <div 
          className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 h-full transition-all duration-300"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      {/* Main Form Box with Premium Glassmorphism */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden">
        {/* Subtle Ambient Light Orbs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="text-xs text-zinc-500 mb-4 font-mono font-bold uppercase tracking-wider">
          {currentT.stepOf.replace('{step}', String(step)).replace('{total}', String(totalSteps))}
        </div>

        <form onSubmit={e => e.preventDefault()} className="min-h-[300px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-zinc-800/80 gap-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold transition ${
                step === 1
                  ? 'border-zinc-900 text-zinc-700 cursor-not-allowed'
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600'
              }`}
            >
              <ChevronLeft size={16} className={isArabic ? 'rotate-180' : ''} />
              <span>{currentT.back}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={step === 1 && !form.name.trim()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-extrabold transition-all duration-300 shadow-lg ${
                step === 1 && !form.name.trim()
                  ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-display'
              }`}
            >
              <span>{step === totalSteps ? currentT.generate : currentT.next}</span>
              <ChevronRight size={16} className={isArabic ? 'rotate-180' : ''} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
