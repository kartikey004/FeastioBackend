import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// async function test() {
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//   const result = await model.generateContent("Say hello world");
//   console.log(result.response.text());
// }

// test();

// export const getNutritionSummaryAndPlan = async (meals) => {
//   try {
//     const mealDescriptions = meals.map(
//       (meal) =>
//         `${meal.mealType}: ${
//           meal.recipeSnapshot.title
//         } with ingredients ${meal.recipeSnapshot.ingredients.join(", ")}`
//     );

//     const prompt = `
//   You are a nutrition expert and meal planner.

//     1. Estimate the combined nutritional values (calories, protein (g), fat (g), carbohydrates (g))
//       for the meals listed below.
//     2. Create a complete 7-day meal plan.
//       You MUST generate exactly 7 days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.
//       Each day MUST have exactly 4 meals: Breakfast, Lunch, Snack, and Dinner.
//       That means there must be exactly 28 meals in total.
//       If any day or meal is missing, the entire output is INVALID.
//     3. Maximum limit per day is 2000 calories, protein maximum 50g, fat maximum 70g, carbohydrates maximum 260g.
//     4. Every recipeSnapshot must include ALL of these fields without being empty:
//      title, description, imageUrl, ingredients, cookTime, nutritionalInfo (with calories, protein, fat, carbohydrates), cuisine.
//     5. Double-check before finalizing: Ensure there are exactly 7 days × 4 meals = 28 meals, and every recipeSnapshot has all fields.

//     Meals provided:
//     ${mealDescriptions.join("\n")}

//     Return JSON ONLY in the following format:
//     {
//       "totalNutritionalSummary": {
//         "calories": number,
//         "protein": number,
//         "fat": number,
//         "carbohydrates": number
//       },
//       "plan": {
//         "Monday": [ {
//           "mealType": "Breakfast",
//           "recipeSnapshot": {
//             "title": "string",
//             "description": "string",
//             "imageUrl": "string",
//             "ingredients": ["string"],
//             "cookTime": number,
//             "nutritionalInfo": {
//               "calories": number,
//               "protein": number,
//               "fat": number,
//               "carbohydrates": number
//             },
//             "cuisine": "string"
//           }
//         },
//         {
//         "mealType": "Lunch",
//         "recipeSnapshot": { ... }
//         },
//         { "mealType": "Snack",
//           "recipeSnapshot": { ... }
//         },
//         {
//           "mealType": "Dinner",
//           "recipeSnapshot": { ... }
//         }],
//         // Repeat for each day of the week
//       "Tuesday": [ { ...4 meals... } ],
//       "Wednesday": [ 4 meals... } ],
//       "Thursday": [ 4 meals... } ],
//       "Friday": [ { ... 4 meals... } ],
//       "Saturday": [ { ...4 meals...} ],
//       "Sunday": [ { ...4 meals... } ]
//       }
//     }
//    IMPORTANT:
//     - You must ALWAYS return exactly 7 days × 4 meals = 28 meals.
//     - No empty days, no missing meals, no missing fields.
//     - Meal titles must be creative and non-repetitive.
//     - Descriptions must be concise but complete.
//     - Output must be strictly valid JSON. Do not add any text outside JSON.
//     `;

//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent(prompt);

//     const text = result.response.text();

//     // 🔎 Log raw AI response BEFORE parsing
//     console.log("🔎 RAW AI RESPONSE START ==================");
//     console.log(text);
//     console.log("🔎 RAW AI RESPONSE END ====================");

//     // Ensure JSON parsing is safe
//     let cleanResponse = text.trim();

//     // Remove markdown fences if present
//     if (cleanResponse.startsWith("```")) {
//       cleanResponse = cleanResponse
//         .replace(/^```[a-zA-Z]*\n?/, "")
//         .replace(/```$/, "");
//     }

//     // ✅ Keep only valid JSON part (truncate after last `}`)
//     const lastBraceIndex = cleanResponse.lastIndexOf("}");
//     if (lastBraceIndex !== -1) {
//       cleanResponse = cleanResponse.slice(0, lastBraceIndex + 1);
//     }

//     let parsed;
//     try {
//       parsed = JSON.parse(cleanResponse);
//     } catch (err) {
//       console.error("❌ Failed to parse AI response:", cleanResponse);
//       throw new Error("Invalid JSON returned from AI");
//     }

//     // Fallback: Ensure all 7 days are present
//     const days = [
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday",
//       "Sunday",
//     ];
//     parsed.plan = parsed.plan || {};
//     days.forEach((day) => {
//       if (!parsed.plan[day]) parsed.plan[day] = [];
//     });

//     return parsed;
//   } catch (error) {
//     console.error("AI Nutrition/Meal Plan Error:", error);
//     return {
//       totalNutritionalSummary: {
//         calories: 0,
//         protein: 0,
//         fat: 0,
//         carbohydrates: 0,
//       },
//       plan: {
//         Monday: [],
//         Tuesday: [],
//         Wednesday: [],
//         Thursday: [],
//         Friday: [],
//         Saturday: [],
//         Sunday: [],
//       },
//     };
//   }
// };

export const updateMealNutritionAndInfo = async (recipeSnapshot) => {
  // ✅ Fix: Check for recipeTitle (not title) since you're passing recipeSnapshot
  if (!recipeSnapshot || !recipeSnapshot.title) {
    console.warn("Skipping meal without title:", recipeSnapshot);
    return null; // Return null instead of undefined
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a nutrition assistant. Based on the following meal details, 
estimate realistic values for:
- Nutritional information (calories, protein (g), fat (g), carbohydrates (g)),
- Cooking time (in minutes),
- Ingredients list,
- Cuisine type.

Return the result **strictly in valid JSON format** as shown below.

Meal: ${recipeSnapshot.title || ""}
Description: ${recipeSnapshot.description || ""}

OUTPUT JSON FORMAT (strict):
{
  "nutritionalInfo": {
    "calories": number,       // realistic, > 0
    "protein": number,        // in grams, > 0
    "fat": number,            // in grams, > 0
    "carbohydrates": number   // in grams, > 0
  },
  "cookTime": number,         // in minutes, > 0
  "ingredients": ["ingredient1", "ingredient2", ...],  // at least 1 item
  "cuisine": "string"         // e.g., Indian, Italian, Chinese
}

STRICT INSTRUCTIONS:
- Every field must be present. No field can be missing, empty, null, or zero.
- Numbers must be positive realistic values.
- Ingredients must always be a non-empty array of strings.
- Cuisine must always be a non-empty string.
- Do not add extra fields or text outside the JSON.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleanText = text.replace(/```json|```/g, "").trim();
    const parsedData = JSON.parse(cleanText);

    // ✅ Add validation for the parsed data
    if (
      !parsedData.nutritionalInfo ||
      typeof parsedData.cookTime !== "number"
    ) {
      console.warn("Invalid AI response structure:", parsedData);
      return null;
    }

    return parsedData;
  } catch (error) {
    console.error("AI Nutrition error:", error);
    return null;
  }
};

export const getNutritionSummaryAndPlan = async ({ profile, seedMeals }) => {
  try {
    // Convert seed meals to description strings
    const mealDescriptions = seedMeals.map((meal) => {
      const ingredientsList = meal.recipeSnapshot.ingredients?.join(", ") || "";
      return `${meal.mealType}: ${meal.recipeSnapshot.title} with ingredients ${ingredientsList}`;
    });

    // Append profile info as structured string
    const profileDescription = `
User Profile:
Gender: ${profile.gender || "N/A"}
Age: ${profile.age || "N/A"}
Height: ${profile.height || "N/A"} cm
Weight: ${profile.weight || "N/A"} kg
Activity Level: ${profile.activityLevel || "N/A"}
Health Conditions: ${profile.healthConditions?.join(", ") || "None"}
Menstrual Health: ${profile.menstrualHealth || "N/A"}
Dietary Restrictions: ${profile.dietaryRestrictions?.join(", ") || "None"}
Allergies: ${profile.allergies?.join(", ") || "None"}
Health Goals: ${profile.healthGoals?.join(", ") || "None"}
Cuisine Preferences: ${profile.cuisinePreferences?.join(", ") || "None"}
`;

    const prompt = `
You are a nutrition expert and meal planner.

1. Estimate the combined nutritional values (calories, protein (g), fat (g), carbohydrates (g)) 
  for the meals listed below.
2. Create a complete 7-day meal plan. 
  You MUST generate exactly 7 days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.
  Each day MUST have exactly 4 meals: Breakfast, Lunch, Snack, and Dinner.
  That means there must be exactly 28 meals in total. 
  If any day or meal is missing, the entire output is INVALID.
3. Maximum limit per day is 2000 calories, protein maximum 50g, fat maximum 70g, carbohydrates maximum 260g.
4. Every recipeSnapshot must include ALL of these fields without being empty: 
 title, description, imageUrl, ingredients, cookTime, nutritionalInfo (with calories, protein, fat, carbohydrates), cuisine.
5. Double-check before finalizing: Ensure there are exactly 7 days × 4 meals = 28 meals, and every recipeSnapshot has all fields.

Meals provided:
${mealDescriptions.join("\n")}

${profileDescription}

Return JSON ONLY in the following format:
{
  "totalNutritionalSummary": {
    "calories": number,
    "protein": number,
    "fat": number,
    "carbohydrates": number
  },
  "plan": {
    "Monday": [ { 
      "mealType": "Breakfast", 
      "recipeSnapshot": { 
        "title": "string",
        "description": "string",
        "imageUrl": "string",
        "ingredients": ["string"],
        "cookTime": number,
        "nutritionalInfo": { 
          "calories": number, 
          "protein": number, 
          "fat": number, 
          "carbohydrates": number 
        },
        "cuisine": "string"
      } 
    }, ... 3 more meals ],
    "Tuesday": [ 4 meals... ],
    "Wednesday": [ 4 meals... ],
    "Thursday": [ 4 meals... ],
    "Friday": [ 4 meals... ],
    "Saturday": [ 4 meals... ],
    "Sunday": [ 4 meals... ]
  }
}

IMPORTANT:
- You must ALWAYS return exactly 7 days × 4 meals = 28 meals.
- No empty days, no missing meals, no missing fields.
- Meal titles must be creative and non-repetitive.
- Descriptions must be concise but complete.
- Output must be strictly valid JSON. Do not add any text outside JSON.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    let text = result.response.text();

    // 🔎 Log raw AI response BEFORE parsing
    console.log("🔎 RAW AI RESPONSE START ==================");
    console.log(text);
    console.log("🔎 RAW AI RESPONSE END ====================");

    // Clean response
    let cleanResponse = text.trim();
    if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse
        .replace(/^```[a-zA-Z]*\n?/, "")
        .replace(/```$/, "");
    }
    const lastBraceIndex = cleanResponse.lastIndexOf("}");
    if (lastBraceIndex !== -1) {
      cleanResponse = cleanResponse.slice(0, lastBraceIndex + 1);
    }

    let parsed;
    try {
      parsed = JSON.parse(cleanResponse);
    } catch (err) {
      console.error("❌ Failed to parse AI response:", cleanResponse);
      throw new Error("Invalid JSON returned from AI");
    }

    // Ensure all 7 days are present
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    parsed.plan = parsed.plan || {};
    days.forEach((day) => {
      if (!parsed.plan[day]) parsed.plan[day] = [];
    });

    return parsed;
  } catch (error) {
    console.error("AI Nutrition/Meal Plan Error:", error);
    return {
      totalNutritionalSummary: {
        calories: 0,
        protein: 0,
        fat: 0,
        carbohydrates: 0,
      },
      plan: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      },
    };
  }
};
