import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
console.log('Initializing Firebase with config:', firebaseConfig);
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google OAuth provider with Google Tasks scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/tasks');
googleProvider.addScope('https://www.googleapis.com/auth/tasks.readonly');

// In-memory caching of the access token (mandated by workspace-integration skill)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Set up authentication listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // If we have a user but no cached token, they might need to sign in again to capture the token,
        // or we can prompt them when they trigger an action.
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup and capture token
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    console.log('Starting Google Sign-in...');
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Sign-in result:', result);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    console.log('Credential:', credential);
    if (!credential?.accessToken) {
      console.error('Failed to retrieve access token from Google Auth');
      throw new Error('Failed to retrieve access token from Google Auth');
    }
    cachedAccessToken = credential.accessToken;
    console.log('Cached access token successfully');
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Error during Google Sign-in:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Log out and clear cached token
export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Get current cached access token
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

// Google Tasks API Helpers
const BASE_URL = 'https://tasks.googleapis.com/tasks/v1';

// Helper to extract detailed Google API error messages
const handleErrorResponse = async (response: Response, defaultMessage: string) => {
  let errorMsg = defaultMessage;
  try {
    const errBody = await response.json();
    if (errBody?.error?.message) {
      errorMsg = errBody.error.message;
    }
  } catch {
    try {
      const text = await response.text();
      if (text) errorMsg = `${defaultMessage}: ${text}`;
    } catch {}
  }
  throw new Error(errorMsg);
};

// Get or Create the AthleteLifeOS Task List
export const getOrCreateTaskList = async (token: string, isArabic: boolean): Promise<string> => {
  const listName = isArabic ? 'AthleteLifeOS - الوجبات والتمرينات' : 'AthleteLifeOS - Meals & Workouts';
  
  try {
    // 1. Fetch current task lists
    const response = await fetch(`${BASE_URL}/users/@me/lists`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      await handleErrorResponse(response, `Failed to fetch task lists`);
    }
    
    const data = await response.json();
    const existingList = data.items?.find((list: any) => list.title === listName || list.title.startsWith('AthleteLifeOS'));
    
    if (existingList) {
      return existingList.id;
    }
    
    // 2. Create list if it doesn't exist
    const createResponse = await fetch(`${BASE_URL}/users/@me/lists`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: listName }),
    });
    
    if (!createResponse.ok) {
      await handleErrorResponse(createResponse, `Failed to create task list`);
    }
    
    const newList = await createResponse.json();
    return newList.id;
  } catch (error) {
    console.error('Error in getOrCreateTaskList:', error);
    throw error;
  }
};

// Create a task
export interface GoogleTaskInput {
  title: string;
  notes?: string;
  due?: string; // RFC 3339 timestamp (YYYY-MM-DDTHH:MM:SSZ)
}

export const createGoogleTask = async (
  token: string,
  listId: string,
  task: GoogleTaskInput
): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/lists/${listId}/tasks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: task.title,
        notes: task.notes || '',
        due: task.due || undefined,
      }),
    });
    
    if (!response.ok) {
      await handleErrorResponse(response, `Failed to create task`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in createGoogleTask:', error);
    throw error;
  }
};

// Fetch all tasks in our list
export const fetchGoogleTasks = async (token: string, listId: string): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/lists/${listId}/tasks?showCompleted=true&showHidden=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      await handleErrorResponse(response, `Failed to fetch tasks`);
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error in fetchGoogleTasks:', error);
    throw error;
  }
};

// Update a task (e.g. checkbox completion state, text notes)
export const updateGoogleTask = async (
  token: string,
  listId: string,
  taskId: string,
  updates: { title?: string; notes?: string; status?: 'needsAction' | 'completed'; due?: string }
): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/lists/${listId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      await handleErrorResponse(response, `Failed to update task`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in updateGoogleTask:', error);
    throw error;
  }
};

// Delete a task
export const deleteGoogleTask = async (token: string, listId: string, taskId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/lists/${listId}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      await handleErrorResponse(response, `Failed to delete task`);
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteGoogleTask:', error);
    throw error;
  }
};

// Helper to calculate exact date of weekdays
const getNextWeekdayDateStringLocal = (dayNumber: number, hour: number = 8): string => {
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, etc.
  const weekdayMapping = [1, 2, 3, 4, 5, 6, 0]; // 1 (Mon) to 7 (Sun)
  const targetDayOfWeek = weekdayMapping[dayNumber - 1];
  
  let daysDiff = targetDayOfWeek - currentDayOfWeek;
  if (daysDiff < 0) daysDiff += 7;
  
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysDiff);
  targetDate.setHours(hour, 0, 0, 0);
  
  return targetDate.toISOString();
};

export const syncWorkoutDayToGoogleTasks = async (
  token: string,
  listId: string,
  day: any,
  isArabic: boolean
): Promise<any> => {
  const exercisesText = day.exercises.map((ex: any, i: number) => 
    `${i + 1}. ${ex.name} (${ex.sets} sets x ${ex.reps}) - Notes: ${ex.notes}`
  ).join('\n');
  
  const notesText = `${isArabic ? 'تذكير الصباح الرياضي لليوم' : 'Morning Workout Reminder for'} ${day.dayName}\n\n${exercisesText}`;
  const title = `🏋️ ${isArabic ? 'تمرين' : 'Workout'}: ${isArabic ? 'يوم' : ''} ${day.dayName} (${day.focus})`;
  
  if (day.googleTaskId) {
    return await updateGoogleTask(token, listId, day.googleTaskId, {
      title,
      notes: notesText
    });
  } else {
    const workoutDate = getNextWeekdayDateStringLocal(day.dayNumber, 8);
    return await createGoogleTask(token, listId, {
      title,
      notes: notesText,
      due: workoutDate
    });
  }
};

export const syncMealToGoogleTasks = async (
  token: string,
  listId: string,
  meal: any,
  dayNumber: number,
  mealIndex: number,
  isArabic: boolean
): Promise<any> => {
  const ingredientsText = meal.ingredients.map((ing: any) => 
    `- ${isArabic ? ing.arabicName : ing.name}: ${isArabic ? ing.arabicAmount : ing.amount}`
  ).join('\n');
  
  const notesText = `${isArabic ? 'السعرات' : 'Calories'}: ${meal.calories} kcal\n${isArabic ? 'البروتين' : 'Protein'}: ${meal.protein}g | ${isArabic ? 'الكارب' : 'Carbs'}: ${meal.carbs}g | ${isArabic ? 'الدهون' : 'Fat'}: ${meal.fat}g\n\n${isArabic ? 'المكونات' : 'Ingredients'}:\n${ingredientsText}`;
  const title = `🍳 ${isArabic ? 'وجبة' : 'Meal'}: ${isArabic ? meal.arabicName : meal.name}`;
  
  if (meal.googleTaskId) {
    return await updateGoogleTask(token, listId, meal.googleTaskId, {
      title,
      notes: notesText
    });
  } else {
    const mealDate = getNextWeekdayDateStringLocal(dayNumber, 9 + mealIndex * 3);
    return await createGoogleTask(token, listId, {
      title,
      notes: notesText,
      due: mealDate
    });
  }
};
