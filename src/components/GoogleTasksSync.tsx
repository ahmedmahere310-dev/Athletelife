import React, { useState, useEffect } from 'react';
import { GeneratedPlan, WorkoutDay, Meal } from '../types';
import { 
  googleSignIn, 
  googleSignOut, 
  initAuth, 
  getOrCreateTaskList, 
  createGoogleTask, 
  fetchGoogleTasks, 
  updateGoogleTask, 
  deleteGoogleTask 
} from '../utils/googleTasksService';
import { 
  Check, 
  Calendar, 
  User, 
  LogOut, 
  Loader2, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Sparkles, 
  AlertCircle, 
  CheckSquare, 
  Square,
  Clock,
  ExternalLink
} from 'lucide-react';

interface GoogleTasksSyncProps {
  plan: GeneratedPlan;
  onUpdatePlan: (updatedPlan: GeneratedPlan) => void;
  isArabic: boolean;
  onClose?: () => void;
  showOnboardingPromptInitially?: boolean;
}

export default function GoogleTasksSync({ 
  plan, 
  onUpdatePlan, 
  isArabic, 
  onClose,
  showOnboardingPromptInitially = false 
}: GoogleTasksSyncProps) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  // Selection states for task sync
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [showPrompt, setShowPrompt] = useState<boolean>(showOnboardingPromptInitially);
  const [showChecklist, setShowChecklist] = useState<boolean>(false);
  const [syncedTasks, setSyncedTasks] = useState<any[]>([]);
  const [taskListName, setTaskListName] = useState<string>('');
  
  // New custom task form state
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  // Translations
  const t = {
    en: {
      syncTitle: "Google Tasks Integration",
      promptHeader: "Sync to Google Tasks?",
      promptBody: "Do you want to sync your daily workout reminders and meals to Google Tasks? This will help you stay accountable and notify you every morning on your calendar/phone!",
      yes: "Yes, Set Up Reminders",
      no: "Maybe Later",
      connectGoogle: "Connect Google Account",
      connectedAs: "Connected as:",
      disconnect: "Disconnect",
      checklistTitle: "Select Items to Sync",
      selectAll: "Select All",
      deselectAll: "Deselect All",
      workoutsSection: "🏋️ Training Reminders (Morning 8:00 AM)",
      mealsSection: "🍳 Meals & Nutrition Tasks",
      syncButton: "Sync Selected Items",
      syncing: "Saving to Google Tasks...",
      syncSuccess: "Successfully synced selected items!",
      syncedTasksTitle: "My Synced Tasks",
      completed: "Completed",
      needsAction: "To Do",
      addTask: "Add Custom Task",
      taskTitle: "Task Title",
      notes: "Notes / Details",
      dueDate: "Due Date",
      saveTask: "Create Task",
      deleteConfirm: "Are you sure you want to delete this task from Google Tasks?",
      noTasksYet: "No tasks found in your AthleteLifeOS task list.",
      syncWarning: "Note: Completing or editing tasks here will sync instantly to your Google Calendar and Google Tasks app!",
      syncPlanButton: "Import / Sync Current Plan",
      syncPlanButtonDesc: "Choose specific days, workouts, or meals to add/update in your Google Tasks checklist."
    },
    ar: {
      syncTitle: "التكامل مع مهام جوجل (Google Tasks)",
      promptHeader: "مزامنة الخطة مع مهام جوجل؟",
      promptBody: "هل ترغب في مزامنة تذكيرات التمرين اليومية والوجبات مع تطبيق Google Tasks؟ سيساعدك هذا على الالتزام وتلقي إشعارات كل صباح على هاتفك أو تقويمك!",
      yes: "نعم، قم بإعداد التذكيرات",
      no: "ليس الآن",
      connectGoogle: "ربط حساب جوجل",
      connectedAs: "متصل بحساب:",
      disconnect: "تسجيل الخروج",
      checklistTitle: "اختر العناصر التي تريد مزامنتها",
      selectAll: "تحديد الكل",
      deselectAll: "إلغاء تحديد الكل",
      workoutsSection: "🏋️ تذكيرات التمارين الرياضية (صباحاً 8:00)",
      mealsSection: "🍳 مهام الوجبات والتغذية",
      syncButton: "مزامنة العناصر المحددة",
      syncing: "جاري الحفظ في مهام جوجل...",
      syncSuccess: "تمت مزامنة العناصر المحددة بنجاح!",
      syncedTasksTitle: "مهامي المتزامنة حالياً",
      completed: "مكتملة",
      needsAction: "قيد التنفيذ",
      addTask: "إضافة مهمة مخصصة جديدة",
      taskTitle: "عنوان المهمة",
      notes: "تفاصيل المهمة / الملاحظات",
      dueDate: "تاريخ الاستحقاق",
      saveTask: "إنشاء المهمة",
      deleteConfirm: "هل أنت متأكد من رغبتك في حذف هذه المهمة من حساب جوجل الخاص بك؟",
      noTasksYet: "لم يتم العثور على أي مهام في قائمة AthleteLifeOS الخاصة بك.",
      syncWarning: "تنبيه: إكمال أو تعديل المهام هنا سيتم تحديثه فوراً في تقويم جوجل وتطبيق مهام جوجل الخاص بك!",
      syncPlanButton: "مزامنة جدول التمارين والتغذية الحالي",
      syncPlanButtonDesc: "اختر أيام تمرين معينة أو وجبات غذائية لتصديرها ومزامنتها مع مهام جوجل."
    }
  };

  const currentT = isArabic ? t.ar : t.en;

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setAuthChecking(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setAuthChecking(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Set default checkboxes on checklist mount or when plan changes
  useEffect(() => {
    const initialSelections: Record<string, boolean> = {};
    if (plan && plan.days) {
      plan.days.forEach(day => {
        // Workouts
        if (!day.isRest) {
          initialSelections[`workout-${day.dayNumber}`] = true;
        }
        // Meals
        if (day.meals) {
          day.meals.forEach(meal => {
            initialSelections[`meal-${day.dayNumber}-${meal.id}`] = true;
          });
        }
      });
    }
    setSelectedItems(initialSelections);
  }, [plan]);

  // If connected, fetch synced tasks automatically
  useEffect(() => {
    if (token) {
      loadSyncedTasks();
    }
  }, [token]);

  const loadSyncedTasks = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const listId = await getOrCreateTaskList(token, isArabic);
      const tasks = await fetchGoogleTasks(token, listId);
      setSyncedTasks(tasks);
    } catch (error) {
      console.error('Error fetching Google Tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        if (showPrompt) {
          setShowPrompt(false);
        }
        // Always open the checklist on connect so the user can import/sync their plan right away
        setShowChecklist(true);
      }
    } catch (err) {
      console.error('Failed Google Sign-in:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await googleSignOut();
      setUser(null);
      setToken(null);
      setSyncedTasks([]);
    } catch (err) {
      console.error('Failed to log out:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to calculate exact date of weekdays
  const getNextWeekdayDateString = (dayNumber: number, hour: number = 8): string => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, etc.
    
    // We map dayNumber 1-7 to calendar weekdays. Day 1 is Monday, Day 2 is Tuesday, ..., Day 7 is Sunday.
    // In JS Date, Sunday is 0, Monday is 1, Tuesday is 2, etc.
    const weekdayMapping = [1, 2, 3, 4, 5, 6, 0]; // 1 (Mon) to 7 (Sun)
    const targetDayOfWeek = weekdayMapping[dayNumber - 1];
    
    let daysDiff = targetDayOfWeek - currentDayOfWeek;
    if (daysDiff < 0) daysDiff += 7; // Occurs in next week
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysDiff);
    targetDate.setHours(hour, 0, 0, 0);
    
    return targetDate.toISOString();
  };

  const toggleSelectItem = (key: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectAll = (select: boolean) => {
    const nextSelections: Record<string, boolean> = {};
    Object.keys(selectedItems).forEach(k => {
      nextSelections[k] = select;
    });
    setSelectedItems(nextSelections);
  };

  // Execute onboarding sync
  const handleOnboardingSync = async () => {
    if (!token) return;
    setIsSyncing(true);
    try {
      const listId = await getOrCreateTaskList(token, isArabic);
      
      const updatedDays = JSON.parse(JSON.stringify(plan?.days || [])) as WorkoutDay[];
      
      // Iterate through selected items and push to Google Tasks
      for (const day of updatedDays) {
        // 1. Workout Sync
        if (!day.isRest && selectedItems[`workout-${day.dayNumber}`] && day.exercises) {
          const workoutDate = getNextWeekdayDateString(day.dayNumber, 8); // 8:00 AM Morning reminder
          const exercisesText = day.exercises.map((ex, i) => 
            `${i + 1}. ${ex.name} (${ex.sets} sets x ${ex.reps}) - Notes: ${ex.notes}`
          ).join('\n');
          
          const notesText = `${isArabic ? 'تذكير الصباح الرياضي لليوم' : 'Morning Workout Reminder for'} ${day.dayName}\n\n${exercisesText}`;
          const title = `🏋️ ${isArabic ? 'تمرين' : 'Workout'}: ${isArabic ? 'يوم' : ''} ${day.dayName} (${day.focus})`;

          const createdTask = await createGoogleTask(token, listId, {
            title,
            notes: notesText,
            due: workoutDate
          });
          day.googleTaskId = createdTask.id;
        }

        // 2. Meals Sync
        const mealsList = day.meals || [];
        for (const meal of mealsList) {
          if (selectedItems[`meal-${day.dayNumber}-${meal.id}`] && meal.ingredients) {
            const mealDate = getNextWeekdayDateString(day.dayNumber, 9 + mealsList.indexOf(meal) * 3); // Spacing meals out chronologically
            const ingredientsText = meal.ingredients.map(ing => 
              `- ${isArabic ? ing.arabicName : ing.name}: ${isArabic ? ing.arabicAmount : ing.amount}`
            ).join('\n');
            
            const notesText = `${isArabic ? 'السعرات' : 'Calories'}: ${meal.calories} kcal\n${isArabic ? 'البروتين' : 'Protein'}: ${meal.protein}g | ${isArabic ? 'الكارب' : 'Carbs'}: ${meal.carbs}g | ${isArabic ? 'الدهون' : 'Fat'}: ${meal.fat}g\n\n${isArabic ? 'المكونات' : 'Ingredients'}:\n${ingredientsText}`;
            const title = `🍳 ${isArabic ? 'وجبة' : 'Meal'}: ${isArabic ? meal.arabicName : meal.name}`;

            const createdTask = await createGoogleTask(token, listId, {
              title,
              notes: notesText,
              due: mealDate
            });
            meal.googleTaskId = createdTask.id;
          }
        }
      }

      // Propagate updated plan back with Task List and Tasks references
      onUpdatePlan({
        ...plan,
        days: updatedDays,
        googleTaskListId: listId
      });

      setShowChecklist(false);
      await loadSyncedTasks();
      alert(currentT.syncSuccess);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error during batch sync:', error);
      alert('Error syncing tasks. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Add a brand new custom task directly to the Google Tasks list
  const handleAddCustomTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTitle.trim()) return;
    setIsSyncing(true);
    try {
      const listId = await getOrCreateTaskList(token, isArabic);
      const dueFormatted = newDueDate ? new Date(newDueDate).toISOString() : undefined;
      
      await createGoogleTask(token, listId, {
        title: newTitle,
        notes: newNotes,
        due: dueFormatted
      });

      setNewTitle('');
      setNewNotes('');
      setNewDueDate('');
      await loadSyncedTasks();
    } catch (error) {
      console.error('Failed to add custom task:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle single task completion inside app list
  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    if (!token) return;
    const nextStatus = currentStatus === 'completed' ? 'needsAction' : 'completed';
    try {
      const listId = await getOrCreateTaskList(token, isArabic);
      await updateGoogleTask(token, listId, taskId, { status: nextStatus });
      
      // Update local view state instantly
      setSyncedTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, status: nextStatus, completed: nextStatus === 'completed' ? new Date().toISOString() : undefined };
        }
        return t;
      }));
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  // Delete a task completely from Google Tasks
  const handleDeleteTask = async (taskId: string) => {
    if (!token) return;
    const confirmed = window.confirm(currentT.deleteConfirm);
    if (!confirmed) return;
    
    try {
      const listId = await getOrCreateTaskList(token, isArabic);
      await deleteGoogleTask(token, listId, taskId);
      
      setSyncedTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Onboarding prompt modal
  if (showPrompt) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
              <Sparkles className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-white">{currentT.promptHeader}</h3>
              <p className="text-xs text-zinc-500">Google Workspace Integrations</p>
            </div>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed">
            {currentT.promptBody}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleConnect}
              className="flex-grow flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-zinc-950 font-semibold text-sm hover:opacity-90 active:scale-95 transition shadow-lg shadow-emerald-500/10"
            >
              <User size={16} />
              <span>{currentT.yes}</span>
            </button>
            <button
              onClick={() => {
                setShowPrompt(false);
                if (onClose) onClose();
              }}
              className="px-5 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition text-sm text-center"
            >
              {currentT.no}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sync Checklist
  if (showChecklist) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 max-w-2xl w-full shadow-2xl my-8 relative space-y-6 max-h-[90vh] flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-center border-b border-zinc-900 pb-4 shrink-0">
            <div>
              <h3 className="text-lg font-display font-bold text-white">{currentT.checklistTitle}</h3>
              <p className="text-xs text-zinc-500">{currentT.syncWarning}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleSelectAll(true)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-800 text-emerald-400 hover:bg-zinc-900 transition"
              >
                {currentT.selectAll}
              </button>
              <button 
                onClick={() => handleSelectAll(false)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-900 transition"
              >
                {currentT.deselectAll}
              </button>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto space-y-6 pr-1 custom-scrollbar">
            {/* Workouts Segment */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-400 mb-3 sticky top-0 bg-zinc-950 py-1">{currentT.workoutsSection}</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {(plan?.days || []).filter(d => !d.isRest).map(day => (
                  <button
                    key={`workout-${day.dayNumber}`}
                    onClick={() => toggleSelectItem(`workout-${day.dayNumber}`)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                      selectedItems[`workout-${day.dayNumber}`]
                        ? 'bg-emerald-500/5 border-emerald-500/40 text-white'
                        : 'bg-zinc-900/30 border-zinc-900 text-zinc-500 hover:border-zinc-800'
                    }`}
                  >
                    {selectedItems[`workout-${day.dayNumber}`] ? (
                      <CheckSquare className="text-emerald-500 shrink-0" size={18} />
                    ) : (
                      <Square className="shrink-0" size={18} />
                    )}
                    <div className="truncate">
                      <p className="text-xs font-bold text-zinc-400">Day {day.dayNumber} ({day.dayName})</p>
                      <p className="text-xs truncate font-medium">{day.focus}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Meals Segment */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-400 mb-3 sticky top-0 bg-zinc-950 py-1">{currentT.mealsSection}</h4>
              <div className="space-y-4">
                {(plan?.days || []).map(day => (
                  <div key={`day-meals-${day.dayNumber}`} className="border-l-2 border-zinc-800 pl-3 py-1">
                    <p className="text-xs font-mono text-zinc-500 mb-2 uppercase">{day.dayName}</p>
                    <div className="grid sm:grid-cols-3 gap-2">
                      {(day.meals || []).map(meal => {
                        const key = `meal-${day.dayNumber}-${meal.id}`;
                        return (
                          <button
                            key={key}
                            onClick={() => toggleSelectItem(key)}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition ${
                              selectedItems[key]
                                ? 'bg-emerald-500/5 border-emerald-500/30 text-white'
                                : 'bg-zinc-900/10 border-zinc-900 text-zinc-500 hover:border-zinc-800'
                            }`}
                          >
                            {selectedItems[key] ? (
                              <CheckSquare className="text-emerald-500 shrink-0" size={16} />
                            ) : (
                              <Square className="shrink-0" size={16} />
                            )}
                            <span className="text-xs font-semibold truncate">
                              {isArabic ? meal.arabicName : meal.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3 shrink-0">
            <button
              onClick={() => setShowChecklist(false)}
              className="px-4 py-2 text-zinc-400 hover:text-white text-xs transition"
            >
              {currentT.no}
            </button>
            <button
              onClick={handleOnboardingSync}
              disabled={isSyncing}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:opacity-90 active:scale-95 transition flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/10"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>{currentT.syncing}</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>{currentT.syncButton}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standard interactive view inside Dashboard Tab / Menu
  return (
    <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md space-y-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
            <CheckSquare size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-white">{currentT.syncTitle}</h3>
            <p className="text-xs text-zinc-500">{currentT.syncWarning}</p>
          </div>
        </div>

        <div>
          {authChecking ? (
            <Loader2 className="animate-spin text-zinc-500" size={20} />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">{currentT.connectedAs}</span>
                <span className="text-xs text-white font-semibold">{user.displayName || user.email}</span>
              </div>
              <button
                onClick={handleDisconnect}
                className="p-2 rounded-xl border border-zinc-900 bg-zinc-950/40 text-zinc-500 hover:text-red-400 hover:border-zinc-800 transition"
                title={currentT.disconnect}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:opacity-90 transition shadow-lg shadow-emerald-500/10"
            >
              <User size={14} />
              <span>{currentT.connectGoogle}</span>
            </button>
          )}
        </div>
      </div>

      {user ? (
        <div className="grid md:grid-cols-12 gap-6">
          
          {/* Active Synced Tasks List (Left Column) */}
          <div className="md:col-span-7 space-y-4">
            {plan?.days && plan.days.length > 0 && (
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles size={12} />
                    <span>{currentT.syncPlanButton}</span>
                  </h5>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    {currentT.syncPlanButtonDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChecklist(true)}
                  className="shrink-0 px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:opacity-90 active:scale-95 transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/5"
                >
                  <Plus size={12} />
                  <span>{isArabic ? "ابدأ المزامنة" : "Start Sync"}</span>
                </button>
              </div>
            )}

            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-1.5">
                <span>{currentT.syncedTasksTitle}</span>
                <span className="text-xs py-0.5 px-1.5 bg-emerald-500/10 text-emerald-400 font-bold font-mono rounded-md">
                  {syncedTasks.length}
                </span>
              </h4>
              <button
                onClick={loadSyncedTasks}
                disabled={isLoading}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-zinc-900 transition"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500 space-y-2">
                <Loader2 className="animate-spin text-emerald-400" size={24} />
                <span className="text-xs font-mono">Loading lists from Google Tasks...</span>
              </div>
            ) : syncedTasks.length === 0 ? (
              <div className="border border-dashed border-zinc-900 rounded-2xl p-8 text-center text-zinc-500 text-xs">
                {currentT.noTasksYet}
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                {syncedTasks.map(task => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`flex justify-between items-start p-3 rounded-xl border transition ${
                        isCompleted
                          ? 'bg-zinc-950/20 border-zinc-900/40 text-zinc-500 line-through'
                          : 'bg-zinc-900/20 border-zinc-900 text-zinc-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 max-w-[85%]">
                        <button
                          onClick={() => handleToggleTaskStatus(task.id, task.status)}
                          className={`mt-0.5 shrink-0 rounded p-0.5 transition ${
                            isCompleted ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-600 hover:text-zinc-400'
                          }`}
                        >
                          <Check size={14} className={isCompleted ? 'opacity-100' : 'opacity-0'} />
                        </button>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold leading-relaxed break-words">{task.title}</p>
                          {task.notes && (
                            <p className="text-[10px] text-zinc-500 mt-1 whitespace-pre-line leading-normal truncate-hover">
                              {task.notes}
                            </p>
                          )}
                          {task.due && (
                            <span className="inline-flex items-center gap-1 text-[9px] text-zinc-500 font-mono mt-1.5 bg-zinc-900 py-0.5 px-1.5 rounded-md">
                              <Clock size={8} />
                              {new Date(task.due).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-zinc-600 hover:text-red-400 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Custom Task Form (Right Column) */}
          <form onSubmit={handleAddCustomTask} className="md:col-span-5 bg-zinc-900/20 border border-zinc-900 rounded-2xl p-4 space-y-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Plus size={12} />
              <span>{currentT.addTask}</span>
            </h4>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-bold uppercase">{currentT.taskTitle}</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g., Drink water, buy spinach"
                className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-bold uppercase">{currentT.notes}</label>
              <textarea
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                placeholder="Details of the task..."
                rows={3}
                className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-bold uppercase">{currentT.dueDate}</label>
              <input
                type="date"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
                className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-emerald-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSyncing || !newTitle.trim()}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 text-emerald-400 hover:text-zinc-950 transition font-bold text-xs disabled:opacity-50"
            >
              {isSyncing ? <Loader2 className="animate-spin" size={12} /> : <Plus size={12} />}
              <span>{currentT.saveTask}</span>
            </button>
          </form>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center max-w-sm mx-auto space-y-4">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500">
            <CheckSquare size={36} className="stroke-[1.5]" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">
              {isArabic ? 'مزامنة الرياضة والتغذية مع مهام جوجل' : 'Sync Athletics & Diet to Google Tasks'}
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {isArabic 
                ? 'اربط حساب جوجل الخاص بك لإرسال مهام التمارين والوجبات مباشرة إلى تقويمك وتلقي إشعارات مستمرة!'
                : 'Connect your Google Account to push training regimes and nutrition macros directly to your calendar!'}
            </p>
          </div>
          <button
            onClick={handleConnect}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:opacity-90 transition shadow-lg shadow-emerald-500/10"
          >
            <User size={14} />
            <span>{currentT.connectGoogle}</span>
          </button>
        </div>
      )}
    </div>
  );
}
