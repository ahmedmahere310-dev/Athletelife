/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Exercise } from '../types';

// Let's define a rich database of exercises with categories, defaults, and swap options.
// This supports the custom "Swap Exercise" feature requested by the user.
export const EXERCISE_DATABASE: Record<string, { name: string; category: string; notes: string; swapOptions: string[] }> = {
  // Chest
  bench_press: {
    name: "Barbell Bench Press",
    category: "Chest",
    notes: "Keep shoulders packed, drive with legs, touch mid-chest.",
    swapOptions: ["Dumbbell Bench Press", "Incline Dumbbell Press", "Weighted Chest Dips", "Push-Ups (Knee-friendly)"]
  },
  incline_db_press: {
    name: "Incline Dumbbell Press",
    category: "Chest",
    notes: "30-degree incline. Focus on upper chest squeeze.",
    swapOptions: ["Incline Barbell Press", "Low-to-High Cable Flyes", "Decline Push-Ups"]
  },
  chest_flyes: {
    name: "Cable Chest Flyes",
    category: "Chest",
    notes: "Squeeze at peak contraction. Avoid bending elbows excessively.",
    swapOptions: ["Dumbbell Flyes", "Pec Deck Fly", "Floor Press (Shoulder-friendly)"]
  },
  pushups: {
    name: "Push-Ups (High Volume)",
    category: "Chest",
    notes: "Focus on mind-muscle connection. Keep core braced.",
    swapOptions: ["Knee Push-Ups", "Dumbbell Floor Press", "Incline Push-Ups"]
  },

  // Back
  pullups: {
    name: "Pull-Ups",
    category: "Back",
    notes: "Full extension at the bottom. Pull chin above bar.",
    swapOptions: ["Lat Pulldowns", "Assisted Pull-ups", "Chin-ups", "Inverted Rows"]
  },
  barbell_row: {
    name: "Bent-Over Barbell Row",
    category: "Back",
    notes: "Hinge at hips, keep back straight, pull to lower belly.",
    swapOptions: ["Chest-Supported T-Bar Row", "One-Arm Dumbbell Row", "Seated Cable Row"]
  },
  lat_pulldown: {
    name: "Lat Pulldown",
    category: "Back",
    notes: "Pull down to upper chest. Squeeze lats, do not swing.",
    swapOptions: ["Pull-Ups", "Single-Arm Cable Row", "Straight-Arm Cable Pullover"]
  },
  deadlift: {
    name: "Conventional Deadlift",
    category: "Back/Legs",
    notes: "Brace core, push the floor away, maintain neutral spine.",
    swapOptions: ["Barbell Romanian Deadlift (Lower Back Friendly)", "Hex-Bar Deadlift", "Dumbbell Romanian Deadlift"]
  },

  // Shoulders
  overhead_press: {
    name: "Overhead Barbell Press",
    category: "Shoulders",
    notes: "Squeeze glutes and core, press straight up, lock out.",
    swapOptions: ["Seated Dumbbell Shoulder Press", "Arnold Press", "Kettlebell Press"]
  },
  lateral_raise: {
    name: "Dumbbell Lateral Raise",
    category: "Shoulders",
    notes: "Lead with elbows. Keep a slight forward lean.",
    swapOptions: ["Cable Lateral Raise", "Behind-the-Back Cable Raise", "Machine Lateral Raise"]
  },
  rear_delt_fly: {
    name: "Face Pulls",
    category: "Shoulders",
    notes: "Pull rope towards nose, flare elbows out. Great for posture.",
    swapOptions: ["Rear Delt Dumbbell Flyes", "Reverse Pec Deck", "Band Pull-Aparts"]
  },

  // Legs
  squats: {
    name: "Barbell Back Squat",
    category: "Legs",
    notes: "Break at hips and knees, hit depth, drive through heels.",
    swapOptions: ["Goblet Squats (Knee-friendly)", "Leg Press (Lower Back friendly)", "Bulgarian Split Squats"]
  },
  romanian_deadlift: {
    name: "Romanian Deadlift",
    category: "Legs/Hamstrings",
    notes: "Hinge hips back until stretch in hamstrings, squeeze glutes.",
    swapOptions: ["Lying Leg Curls", "Glute Ham Raise", "Dumbbell RDL"]
  },
  leg_press: {
    name: "Leg Press",
    category: "Legs",
    notes: "Do not lock knees at the top. Keep lower back pressed to pad.",
    swapOptions: ["Goblet Squats", "Barbell Hack Squats", "Walking Lunges"]
  },
  leg_curl: {
    name: "Lying Leg Curl",
    category: "Legs",
    notes: "Control the eccentric phase. Squeeze hamstrings.",
    swapOptions: ["Seated Leg Curl", "Dumbbell Hamstring Curl", "Nordic Curls"]
  },
  calf_raise: {
    name: "Standing Calf Raises",
    category: "Legs",
    notes: "Full stretch at bottom, hold contraction for 1 sec at top.",
    swapOptions: ["Seated Calf Raise", "Leg Press Calf Presses", "Single-Leg Bodyweight Calf Raise"]
  },

  // Arms
  bicep_curl: {
    name: "Barbell Bicep Curl",
    category: "Arms",
    notes: "Squeeze biceps, do not swing upper body or flare elbows.",
    swapOptions: ["Dumbbell Incline Curl", "Hammer Curls", "Preacher Curls"]
  },
  hammer_curl: {
    name: "Dumbbell Hammer Curl",
    category: "Arms",
    notes: "Neutral grip. Works brachialis and forearm thickness.",
    swapOptions: ["Cable Rope Hammer Curl", "Reverse Barbell Curl", "Concentration Curl"]
  },
  skull_crusher: {
    name: "EZ-Bar Skull Crusher",
    category: "Arms",
    notes: "Lower bar to forehead or slightly behind, lock elbows.",
    swapOptions: ["Tricep Rope Pushdowns (Elbow-friendly)", "Overhead Dumbbell Extension", "Close-Grip Bench Press"]
  },
  tricep_pushdown: {
    name: "Cable Rope Pushdown",
    category: "Arms",
    notes: "Flaring out slightly at the bottom, keep chest high.",
    swapOptions: ["Weighted Bench Dips", "Triceps Kickbacks", "Single-Arm Cable Extension"]
  },

  // Core
  plank: {
    name: "Braced Plank",
    category: "Core",
    notes: "Squeeze glutes, quads, and pull elbows towards toes.",
    swapOptions: ["Ab Wheel Rollouts", "Hanging Leg Raises", "Dead Bug (Lower Back friendly)"]
  },
  hanging_leg_raise: {
    name: "Hanging Leg Raise",
    category: "Core",
    notes: "Control swing. Lift legs or knees using lower abs.",
    swapOptions: ["Decline Bench Crunches", "Cable Crunches", "Russian Twists"]
  }
};

// Map training systems with basic metadata and standard templates.
export interface WorkoutSystemTemplate {
  name: string;
  arabicName: string;
  description: string;
  arabicDescription: string;
  // Day configurations for ideal active workouts
  splits: {
    name: string;
    arabicName: string;
    exercises: string[]; // references to EXERCISE_DATABASE keys
  }[];
}

export const TRAINING_SYSTEMS: Record<string, WorkoutSystemTemplate> = {
  arnold: {
    name: "Arnold Split",
    arabicName: "تقسيم أرنولد",
    description: "Classic high-volume hypertrophy split pairing chest/back, shoulders/arms, and legs.",
    arabicDescription: "تقسيم ضخامة كلاسيكي يدمج الصدر والظهر، الأكتاف والذراعين، وال أرجل.",
    splits: [
      {
        name: "Chest & Back",
        arabicName: "الصدر والظهر",
        exercises: ["bench_press", "pullups", "incline_db_press", "barbell_row", "chest_flyes"]
      },
      {
        name: "Shoulders & Arms",
        arabicName: "الأكتاف والذراعين",
        exercises: ["overhead_press", "bicep_curl", "skull_crusher", "lateral_raise", "hammer_curl", "tricep_pushdown"]
      },
      {
        name: "Legs & Core",
        arabicName: "الأرجل والبطن",
        exercises: ["squats", "romanian_deadlift", "leg_press", "calf_raise", "plank"]
      }
    ]
  },
  ppl: {
    name: "Push / Pull / Legs (PPL)",
    arabicName: "دفع / سحب / أرجل",
    description: "Highly scientific and popular split grouping muscles by active mechanical function.",
    arabicDescription: "تقسيم علمي ممتع ومثبت ينظم العضلات حسب وظيفتها الحركية والتشريحية.",
    splits: [
      {
        name: "Push Day (Chest, Shoulders, Triceps)",
        arabicName: "يوم الدفع (صدر، أكتاف، ترايسيبس)",
        exercises: ["bench_press", "overhead_press", "incline_db_press", "lateral_raise", "skull_crusher"]
      },
      {
        name: "Pull Day (Back, Rear Delts, Biceps)",
        arabicName: "يوم السحب (ظهر، أكتاف خلفية، بايسيبس)",
        exercises: ["deadlift", "pullups", "barbell_row", "rear_delt_fly", "bicep_curl"]
      },
      {
        name: "Legs & Core Day",
        arabicName: "يوم الأرجل والبطن",
        exercises: ["squats", "romanian_deadlift", "leg_curl", "calf_raise", "hanging_leg_raise"]
      }
    ]
  },
  upper_lower: {
    name: "Upper / Lower Split",
    arabicName: "علوي / سفلي",
    description: "Superb for recovery and frequency, dividing sessions between the upper body and legs.",
    arabicDescription: "ممتاز للاستشفاء وزيادة التردد التدريبي، يقسم الحصص بين الجزء العلوي والسفلي.",
    splits: [
      {
        name: "Upper Body",
        arabicName: "الجزء العلوي",
        exercises: ["bench_press", "pullups", "overhead_press", "lat_pulldown", "bicep_curl", "tricep_pushdown"]
      },
      {
        name: "Lower Body & Core",
        arabicName: "الجزء السفلي والبطن",
        exercises: ["squats", "romanian_deadlift", "leg_press", "calf_raise", "plank"]
      }
    ]
  },
  bro_split: {
    name: "Bro Split (Single Muscle Group)",
    arabicName: "تقسيم برو (عضلة واحدة في اليوم)",
    description: "Focused bodybuilding split where you target one major muscle group per training session.",
    arabicDescription: "نظام كمال الأجسام الكلاسيكي بتركيز عالي؛ استهداف عضلة رئيسية واحدة في اليوم.",
    splits: [
      {
        name: "Chest Day",
        arabicName: "يوم الصدر",
        exercises: ["bench_press", "incline_db_press", "chest_flyes", "pushups"]
      },
      {
        name: "Back Day",
        arabicName: "يوم الظهر",
        exercises: ["deadlift", "pullups", "barbell_row", "lat_pulldown"]
      },
      {
        name: "Shoulders Day",
        arabicName: "يوم الأكتاف",
        exercises: ["overhead_press", "lateral_raise", "rear_delt_fly", "plank"]
      },
      {
        name: "Legs Day",
        arabicName: "يوم الأرجل",
        exercises: ["squats", "romanian_deadlift", "leg_press", "calf_raise"]
      },
      {
        name: "Arms Day",
        arabicName: "يوم الذراعين",
        exercises: ["bicep_curl", "skull_crusher", "hammer_curl", "tricep_pushdown", "hanging_leg_raise"]
      }
    ]
  }
};
