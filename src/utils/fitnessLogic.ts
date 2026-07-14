/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, Macros, WorkoutDay, Exercise, Meal, MealIngredient } from '../types';
import { TRAINING_SYSTEMS, EXERCISE_DATABASE } from '../data/workoutData';

/**
 * Generates structured, macro-accurate meal plans for each day with swap options
 */
export function generateDailyMeals(profile: UserProfile, macros: Macros, dayNumber: number): Meal[] {
  // Caloric splits
  // Breakfast: 25%, Lunch: 35%, Snack: 15%, Dinner: 25%
  const makeMeal = (
    id: string,
    name: string,
    arabicName: string,
    calPct: number,
    ingredientsFunc: (p: number, c: number, f: number) => MealIngredient[],
    swapOptionsFunc: (p: number, c: number, f: number) => any[]
  ): Meal => {
    const mealCal = Math.round(macros.calories * calPct);
    const mealProtein = Math.round(macros.protein * calPct);
    const mealCarbs = Math.round(macros.carbs * calPct);
    const mealFat = Math.round(macros.fat * calPct);

    return {
      id,
      name,
      arabicName,
      calories: mealCal,
      protein: mealProtein,
      carbs: mealCarbs,
      fat: mealFat,
      ingredients: ingredientsFunc(mealProtein, mealCarbs, mealFat),
      isEaten: false,
      swapOptions: swapOptionsFunc(mealProtein, mealCarbs, mealFat)
    };
  };

  // 1. Breakfast Ingredients
  const getBreakfastIngredients = (p: number, c: number, f: number): MealIngredient[] => {
    // Highly intelligent, cost-effective, and macro-accurate egg calculator:
    // Whole eggs have fat. Too many whole eggs exceeds the fat budget and is expensive/heavy.
    // 1 Whole Egg = 6g Protein, 5g Fat.
    // 1 Egg White = 4g Protein, 0g Fat.
    // Scale whole eggs up to a max of 3, keeping fats within the budget 'f'.
    const wholeEggsCount = Math.max(1, Math.min(3, Math.floor(f / 5.5)));
    const wholeEggsProtein = wholeEggsCount * 6;
    const remainingProteinNeeded = Math.max(0, p - wholeEggsProtein);
    const eggWhitesCount = Math.max(0, Math.ceil(remainingProteinNeeded / 4));

    // Name formatting based on egg whites count
    const eggNameEn = eggWhitesCount > 0 
      ? `${wholeEggsCount} Whole Eggs + ${eggWhitesCount} Egg Whites` 
      : `${wholeEggsCount} Whole Eggs`;
    const eggNameAr = eggWhitesCount > 0 
      ? `${wholeEggsCount} بيضات كاملة + ${eggWhitesCount} بياض بيض` 
      : `${wholeEggsCount} بيضات كاملة`;

    const oatsGrams = Math.max(30, Math.round(c * 1.5));

    return [
      {
        name: eggNameEn,
        arabicName: eggNameAr,
        amount: eggWhitesCount > 0 ? `${wholeEggsCount} whole + ${eggWhitesCount} whites` : `${wholeEggsCount} eggs`,
        arabicAmount: eggWhitesCount > 0 ? `${wholeEggsCount} كاملة + ${eggWhitesCount} بياض` : `${wholeEggsCount} بيضات`,
        swapOptions: [
          { name: "Cottage Cheese (Very Economical)", arabicName: "جبنة قريش ريفية اقتصادية غنية بالبروتين", amount: `${Math.round(p * 8)}g`, arabicAmount: `${Math.round(p * 8)} جرام` },
          { name: "Fava Beans with Olive Oil (High Protein & Cheap)", arabicName: "فول مدمس بزيت الزيتون والليمون (شعبي اقتصادي ومشبع جداً)", amount: `${Math.round(p * 5)}g`, arabicAmount: `${Math.round(p * 5)} جرام` },
          { name: "Non-fat Plain Yogurt Bowl", arabicName: "زبادي يوناني أو طبيعي سادة خالي الدسم", amount: `${Math.round(p * 10)}g`, arabicAmount: `${Math.round(p * 10)} جرام` }
        ]
      },
      {
        name: "Rolled Oats",
        arabicName: "شوفان كامل الحبة مع قرفة",
        amount: `${oatsGrams}g`,
        arabicAmount: `${oatsGrams} جرام`,
        swapOptions: [
          { name: "Whole Wheat Slices", arabicName: "توست حبوب كاملة ريجيم", amount: `${Math.max(1, Math.round(oatsGrams / 30))} slices`, arabicAmount: `${Math.max(1, Math.round(oatsGrams / 30))} شرائح` },
          { name: "Boiled Sweet Potato", arabicName: "بطاطا حلوة مسلوقة ومهروسة", amount: `${oatsGrams * 2.2}g`, arabicAmount: `${oatsGrams * 2.2} جرام` }
        ]
      },
      {
        name: "Pure Natural Honey",
        arabicName: "عسل نحل جبلي طبيعي",
        amount: `${Math.max(5, Math.round(f * 0.5))}g`,
        arabicAmount: `${Math.max(5, Math.round(f * 0.5))} جرام`,
        swapOptions: [
          { name: "Raw Unsalted Almonds", arabicName: "لوز نيء غير مملح", amount: `${Math.max(10, Math.round(f * 1.5))}g`, arabicAmount: `${Math.max(10, Math.round(f * 1.5))} جرام` },
          { name: "Fresh Avocado Slices", arabicName: "شرائح أفوكادو طازج", amount: `${Math.max(50, Math.round(f * 4.5))}g`, arabicAmount: `${Math.max(50, Math.round(f * 4.5))} جرام` }
        ]
      }
    ];
  };

  const getBreakfastSwaps = (p: number, c: number, f: number) => {
    return [
      {
        name: "Premium Greek Yogurt Bowl",
        arabicName: "وعاء الزبادي اليوناني الفاخر والمكسرات",
        calories: Math.round(p * 4 + c * 4 + f * 9),
        protein: p,
        carbs: c,
        fat: f,
        ingredients: [
          {
            name: "Greek Yogurt (Plain)",
            arabicName: "زبادي يوناني طبيعي سادة",
            amount: `${p * 10}g`,
            arabicAmount: `${p * 10} جرام`,
            swapOptions: []
          },
          {
            name: "Crispy Oats Granola & Berries",
            arabicName: "جرانولا شوفان مقرمشة وتوت بري",
            amount: `${c * 1.2}g`,
            arabicAmount: `${c * 1.2} جرام`,
            swapOptions: []
          },
          {
            name: "Raw Walnuts & Pumpkin Seeds",
            arabicName: "عين جمل بكر وبذور قرع صحية",
            amount: `${f * 1.5}g`,
            arabicAmount: `${f * 1.5} جرام`,
            swapOptions: []
          }
        ]
      }
    ];
  };

  // 2. Lunch Ingredients
  const getLunchIngredients = (p: number, c: number, f: number): MealIngredient[] => {
    const chickenGrams = Math.max(100, Math.round(p * 3.5));
    const riceGrams = Math.max(50, Math.round(c * 1.25));

    return [
      {
        name: "Grilled Chicken Breast",
        arabicName: "صدور دجاج مشوية بنكهات خفيفة",
        amount: `${chickenGrams}g`,
        arabicAmount: `${chickenGrams} جرام`,
        swapOptions: [
          { name: "Lean Beef Fillet Steak", arabicName: "ستيك فيليه لحم بقري قليل الدهن", amount: `${Math.round(chickenGrams * 0.9)}g`, arabicAmount: `${Math.round(chickenGrams * 0.9)} جرام` },
          { name: "Grilled Salmon Fillet", arabicName: "فيليه سالمون مشوي بالفرن", amount: `${Math.round(chickenGrams * 1.1)}g`, arabicAmount: `${Math.round(chickenGrams * 1.1)} جرام` },
          { name: "Canned Tuna in Water", arabicName: "تونة معلبة مصفاة من الماء", amount: `${Math.round(chickenGrams * 0.8)}g`, arabicAmount: `${Math.round(chickenGrams * 0.8)} جرام` }
        ]
      },
      {
        name: "Basmati Rice (Dry weight)",
        arabicName: "أرز بسمتي فاخر (وزن قبل الطهي)",
        amount: `${riceGrams}g`,
        arabicAmount: `${riceGrams} جرام`,
        swapOptions: [
          { name: "Boiled White Potatoes", arabicName: "بطاطس بيضاء مسلوقة", amount: `${riceGrams * 3.4}g`, arabicAmount: `${riceGrams * 3.4} جرام` },
          { name: "Steamed Quinoa", arabicName: "كينوا مطبوخة على البخار", amount: `${riceGrams * 1.1}g`, arabicAmount: `${riceGrams * 1.1} جرام` },
          { name: "Whole Wheat Pasta", arabicName: "مكرونة الشوفان أو القمح الكامل", amount: `${riceGrams}g`, arabicAmount: `${riceGrams} جرام` }
        ]
      },
      {
        name: "Steamed Broccoli & Carrot",
        arabicName: "بروكلي وجزر مطهو على البخار",
        amount: "150g",
        arabicAmount: "150 جرام",
        swapOptions: [
          { name: "Fresh Leafy Green Salad", arabicName: "سلطة خضار ورقية منعشة", amount: "180g", arabicAmount: "180 جرام" },
          { name: "Sauteed Asparagus", arabicName: "هليون سوتيه بزيت خفيف", amount: "100g", arabicAmount: "100 جرام" }
        ]
      }
    ];
  };

  const getLunchSwaps = (p: number, c: number, f: number) => {
    return [
      {
        name: "Gourmet Beef Burger with Sweet Potato Fries",
        arabicName: "برجر بقري صافي مع بطاطا حلوة بالفرن",
        calories: Math.round(p * 4 + c * 4 + f * 9),
        protein: p,
        carbs: c,
        fat: f,
        ingredients: [
          {
            name: "Home-made Lean Beef Patty (95/5)",
            arabicName: "قرص برجر بقري منزلي الصنع قليل الدهن",
            amount: `${p * 4}g`,
            arabicAmount: `${p * 4} جرام`,
            swapOptions: []
          },
          {
            name: "Crispy Sweet Potato Fries (Air-fried)",
            arabicName: "أصابع بطاطا حلوة مقرمشة في القلاية الهوائية",
            amount: `${c * 3}g`,
            arabicAmount: `${c * 3} جرام`,
            swapOptions: []
          },
          {
            name: "Whole Wheat Burger Bun",
            arabicName: "خبز كايزر ردة أو شوفان كامل الحبة",
            amount: "1 Bun",
            arabicAmount: "رغيف واحد",
            swapOptions: []
          }
        ]
      }
    ];
  };

  // 3. Snack Ingredients
  const getSnackIngredients = (p: number, c: number, f: number): MealIngredient[] => {
    const almondsCount = Math.max(8, Math.round(f * 1.4));

    return [
      {
        name: "Whey Protein or High-Protein Natural Substitute",
        arabicName: "واي بروتين أو بديل طبيعي اقتصادي عالي البروتين",
        amount: "1.1 Scoops (30g protein)",
        arabicAmount: "1.1 مكيال (30 جرام بروتين)",
        swapOptions: [
          { name: "Low-fat Cottage Cheese (Highly Economical)", arabicName: "جبنة قريش ريفية اقتصادية", amount: `${Math.round(p * 8)}g`, arabicAmount: `${Math.round(p * 8)} جرام` },
          { name: "Boiled Eggs (Budget staple)", arabicName: "بيض مسلوق كامل (بروتين اقتصادي)", amount: `${Math.max(2, Math.round(p / 6))} pieces`, arabicAmount: `${Math.max(2, Math.round(p / 6))} بيضات` },
          { name: "Fat-free Greek Yogurt", arabicName: "زبادي يوناني طبيعي بدون دسم", amount: "180g", arabicAmount: "180 جرام" }
        ]
      },
      {
        name: "Unsalted Raw Almonds or Dry-Roasted Peanuts",
        arabicName: "لوز نيء طبيعي أو فول سوداني محمص اقتصادي",
        amount: `${almondsCount} pieces`,
        arabicAmount: `${almondsCount} حبة لوز أو سوداني`,
        swapOptions: [
          { name: "All-Natural Peanut Butter", arabicName: "زبدة فول سوداني طبيعية 100%", amount: "1.5 tbsp", arabicAmount: "1.5 ملعقة كبيرة" },
          { name: "Raw Cashew Nuts", arabicName: "كاجو نيء غني بالزنك", amount: `${Math.round(almondsCount * 0.9)} pcs`, arabicAmount: `${Math.round(almondsCount * 0.9)} حبة` }
        ]
      },
      {
        name: "Fresh Banana or Apple",
        arabicName: "موزة أو تفاحة متوسطة الحجم",
        amount: "1 piece",
        arabicAmount: "حبة واحدة",
        swapOptions: [
          { name: "Strawberries & Blueberries", arabicName: "توت وفراولة طازجة", amount: "120g", arabicAmount: "120 جرام" }
        ]
      }
    ];
  };

  const getSnackSwaps = (p: number, c: number, f: number) => {
    return [
      {
        name: "Cottage Cheese & Honey Rice Cakes",
        arabicName: "كعك الأرز المقرمش بالجبن القريش والعسل",
        calories: Math.round(p * 4 + c * 4 + f * 9),
        protein: p,
        carbs: c,
        fat: f,
        ingredients: [
          {
            name: "Low-fat Cottage Cheese",
            arabicName: "جبن قريش صحي قليل الدسم",
            amount: `${p * 8}g`,
            arabicAmount: `${p * 8} جرام`,
            swapOptions: []
          },
          {
            name: "Crispy Brown Rice Cakes",
            arabicName: "رايس كيك أرز أسمر مقرمش",
            amount: "4 pieces",
            arabicAmount: "4 أقراص رايس كيك",
            swapOptions: []
          },
          {
            name: "Wild Organic Honey",
            arabicName: "عسل نحل قطفة أولى",
            amount: "1.5 Teaspoons",
            arabicAmount: "1.5 ملعقة صغيرة",
            swapOptions: []
          }
        ]
      }
    ];
  };

  // 4. Dinner Ingredients
  const getDinnerIngredients = (p: number, c: number, f: number): MealIngredient[] => {
    const beefGrams = Math.max(100, Math.round(p * 4.3));
    const potatoGrams = Math.max(80, Math.round(c * 3.8));

    return [
      {
        name: "Lean Minced Beef or Sea Bass",
        arabicName: "لحم بقري مفروم أحمر صافي / سمك قاروص مشوي",
        amount: `${beefGrams}g`,
        arabicAmount: `${beefGrams} جرام`,
        swapOptions: [
          { name: "Fresh Turkey Breast Steak", arabicName: "شريحة ستيك صدور رومي", amount: `${Math.round(beefGrams * 0.9)}g`, arabicAmount: `${Math.round(beefGrams * 0.9)} جرام` },
          { name: "Light Feta Cheese with Salad", arabicName: "جبنة فيتا دايت مع مكعبات خيار", amount: "160g", arabicAmount: "160 جرام" }
        ]
      },
      {
        name: "Baked Sweet Potatoes",
        arabicName: "بطاطا حلوة غنية بالألياف مشوية بالفرن",
        amount: `${potatoGrams}g`,
        arabicAmount: `${potatoGrams} جرام`,
        swapOptions: [
          { name: "Mashed Golden Potatoes", arabicName: "بطاطس ذهبية مسلوقة ومهروسة", amount: `${Math.round(potatoGrams * 0.9)}g`, arabicAmount: `${Math.round(potatoGrams * 0.9)} جرام` },
          { name: "Cooked Brown Rice", arabicName: "أرز أسمر مطبوخ وصحي", amount: `${Math.round(c * 1.1)}g`, arabicAmount: `${Math.round(c * 1.1)} جرام` }
        ]
      },
      {
        name: "Extra Virgin Olive Oil",
        arabicName: "زيت زيتون بكر ممتاز معصور بارداً",
        amount: `${Math.max(4, Math.round(f))}g`,
        arabicAmount: `${Math.max(4, Math.round(f))} جرام`,
        swapOptions: [
          { name: "Raw Walnut Halves", arabicName: "أنصاف عين جمل نيء", amount: `${Math.max(10, Math.round(f * 1.3))}g`, arabicAmount: `${Math.max(10, Math.round(f * 1.3))} جرام` },
          { name: "Avocado Slices", arabicName: "شرائح أفوكادو بكر", amount: `${Math.max(40, Math.round(f * 4.2))}g`, arabicAmount: `${Math.max(40, Math.round(f * 4.2))} جرام` }
        ]
      }
    ];
  };

  const getDinnerSwaps = (p: number, c: number, f: number) => {
    return [
      {
        name: "High-Protein Chicken Wrap",
        arabicName: "ساندوتش رول دجاج دايت عالي البروتين",
        calories: Math.round(p * 4 + c * 4 + f * 9),
        protein: p,
        carbs: c,
        fat: f,
        ingredients: [
          {
            name: "Roasted Spiced Chicken Strips",
            arabicName: "شرائح صدور دجاج مشوية ومبهرة",
            amount: `${p * 3.5}g`,
            arabicAmount: `${p * 3.5} جرام`,
            swapOptions: []
          },
          {
            name: "Large Whole Wheat Tortilla / Oat Flatbread",
            arabicName: "خبز تورتيلا قمح كامل أو رقاق شوفان كبير",
            amount: "1 Large Piece",
            arabicAmount: "رغيف واحد كبير",
            swapOptions: []
          },
          {
            name: "Avocado Guacamole & Diet Spread",
            arabicName: "صلصة جواكامولي أفوكادو زيرو دهون",
            amount: "1 Tablespoon",
            arabicAmount: "ملعقة كبيرة",
            swapOptions: []
          }
        ]
      }
    ];
  };

  return [
    makeMeal(`meal_${dayNumber}_1`, "Meal 1: Breakfast", "الوجبة الأولى: الفطور الصباحي", 0.25, getBreakfastIngredients, getBreakfastSwaps),
    makeMeal(`meal_${dayNumber}_2`, "Meal 2: Lunch", "الوجبة الثانية: الغذاء المتكامل", 0.35, getLunchIngredients, getLunchSwaps),
    makeMeal(`meal_${dayNumber}_3`, "Meal 3: Pre/Post Workout Snack", "الوجبة الثالثة: سناك ما قبل/بعد التمرين", 0.15, getSnackIngredients, getSnackSwaps),
    makeMeal(`meal_${dayNumber}_4`, "Meal 4: Dinner", "الوجبة الرابعة: العشاء الريكفري", 0.25, getDinnerIngredients, getDinnerSwaps),
  ];
}

/**
 * Calculates BMR, TDEE, and customized macronutrients using the Mifflin-St Jeor equation.
 */
export function calculateMacros(profile: UserProfile): Macros {
  const { weight, height, age, gender, activityLevel, goal, fitnessLevel } = profile;

  // 1. Calculate Basal Metabolic Rate (BMR)
  let bmr = 0;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // 2. Activity Multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  const multiplier = activityMultipliers[activityLevel] || 1.2;
  const tdee = bmr * multiplier;

  // 3. Goal Caloric Adjustment
  let calories = Math.round(tdee);
  if (goal === 'bulking') {
    calories += 400; // Caloric surplus
  } else if (goal === 'cutting') {
    calories -= 500; // Caloric deficit
  }

  // Prevent dangerous caloric levels
  const absoluteMin = gender === 'male' ? 1500 : 1200;
  if (calories < absoluteMin) {
    calories = absoluteMin;
  }

  // 4. Highly Intelligent Macronutrient Distribution
  // Scale protein demands scientifically to avoid waste and high expenses:
  // - Beginner: 1.8g/kg (very economical, fully supports early muscle hypertrophy)
  // - Intermediate: 2.0g/kg
  // - Advanced: 2.2g/kg (supports heavy lifters with higher muscle volume)
  let proteinMultiplier = 2.0;
  if (fitnessLevel === 'beginner') {
    proteinMultiplier = 1.8;
  } else if (fitnessLevel === 'advanced') {
    proteinMultiplier = 2.2;
  }
  let protein = Math.round(weight * proteinMultiplier);
  
  // Scale fats based on the caloric goal:
  // - Cutting: 0.8g/kg (lower fat yields higher volume of filling fibrous carbs/veggies)
  // - Maintenance: 0.9g/kg
  // - Bulking: 1.0g/kg (provides extra energy density)
  let fatMultiplier = 0.9;
  if (goal === 'cutting') {
    fatMultiplier = 0.8;
  } else if (goal === 'bulking') {
    fatMultiplier = 1.0;
  }
  let fat = Math.round(weight * fatMultiplier);

  // Protect fat and protein margins
  if (protein < 60) protein = 60;
  if (fat < 40) fat = 40;

  // Carbs: Remainder of calories
  // Calories from protein = protein * 4
  // Calories from fat = fat * 9
  const allocatedCalories = (protein * 4) + (fat * 9);
  let remainingCalories = calories - allocatedCalories;

  if (remainingCalories < 0) {
    // If calories are very low, decrease fat and protein slightly
    protein = Math.round(calories * 0.35 / 4);
    fat = Math.round(calories * 0.25 / 9);
    remainingCalories = calories - ((protein * 4) + (fat * 9));
  }

  let carbs = Math.round(remainingCalories / 4);
  if (carbs < 50) carbs = 50; // Safety floor

  // Water: 35ml per kg + additional based on activity
  const baseWater = (weight * 0.035);
  const activityExtraWater = {
    sedentary: 0,
    lightly_active: 0.5,
    moderately_active: 1.0,
    very_active: 1.5,
    extra_active: 2.0,
  };
  const water = parseFloat((baseWater + activityExtraWater[activityLevel]).toFixed(1));

  return {
    calories,
    protein,
    carbs,
    fat,
    water,
  };
}

/**
 * Generates an adaptive 7-day schedule mapping the chosen training system
 * to the exact number of active days requested by the user.
 */
export function generateWorkoutPlan(profile: UserProfile): WorkoutDay[] {
  const { trainingSystem, daysPerWeek, fitnessLevel } = profile;
  const systemTemplate = TRAINING_SYSTEMS[trainingSystem] || TRAINING_SYSTEMS.ppl;
  const macros = calculateMacros(profile);

  // Names of days
  const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  // Determine active days indexes out of 7 (0-6)
  // We want to distribute training days as evenly as possible.
  let activeDaysMask: boolean[] = [];
  switch (daysPerWeek) {
    case 3:
      activeDaysMask = [true, false, true, false, true, false, false]; // Mon, Wed, Fri
      break;
    case 4:
      activeDaysMask = [true, true, false, true, true, false, false]; // Mon, Tue, Thu, Fri
      break;
    case 5:
      activeDaysMask = [true, true, true, false, true, true, false]; // Mon, Tue, Wed, Fri, Sat
      break;
    case 6:
      activeDaysMask = [true, true, true, true, true, true, false]; // Mon-Sat
      break;
    default:
      activeDaysMask = [true, true, false, true, true, false, false];
  }

  const days: WorkoutDay[] = [];
  let splitCounter = 0;
  const totalSplits = systemTemplate.splits.length;

  for (let i = 0; i < 7; i++) {
    const isRest = !activeDaysMask[i];
    const dayName = dayNames[i];
    const dailyMeals = generateDailyMeals(profile, macros, i + 1);

    if (isRest) {
      days.push({
        dayNumber: i + 1,
        dayName,
        focus: "Rest & Active Recovery (يوم راحة واستشفاء)",
        isRest: true,
        exercises: [],
        meals: dailyMeals,
      });
    } else {
      // Fetch the appropriate workout split
      const currentSplit = systemTemplate.splits[splitCounter % totalSplits];
      splitCounter++;

      const exercises: Exercise[] = currentSplit.exercises.map((key, index) => {
        const dbEx = EXERCISE_DATABASE[key] || {
          name: key.replace("_", " "),
          category: "General",
          notes: "Perform with controlled form.",
          swapOptions: []
        };

        // Custom sets and reps based on fitnessLevel
        let sets = 3;
        let reps = "10-12";
        if (fitnessLevel === 'beginner') {
          sets = 3;
          reps = "10-12";
        } else if (fitnessLevel === 'intermediate') {
          sets = 4;
          reps = "8-10";
        } else if (fitnessLevel === 'advanced') {
          // If compound movement (first 2 exercises), do lower reps, higher weight
          if (index < 2) {
            sets = 5;
            reps = "5-8";
          } else {
            sets = 4;
            reps = "8-12";
          }
        }

        return {
          id: `${key}_${i}_${index}`,
          name: dbEx.name,
          sets,
          reps,
          category: dbEx.category,
          notes: dbEx.notes,
          swapOptions: dbEx.swapOptions
        };
      });

      days.push({
        dayNumber: i + 1,
        dayName,
        focus: `${currentSplit.name} (${currentSplit.arabicName})`,
        isRest: false,
        exercises,
        meals: dailyMeals,
      });
    }
  }

  return days;
}
