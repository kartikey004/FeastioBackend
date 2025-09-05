import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// async function test() {
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//   const result = await model.generateContent("Say hello world");
//   console.log(result.response.text());
// }

// test();

export const getNutritionSummaryAndPlan = async (meals) => {
  try {
    const mealDescriptions = meals.map(
      (meal) =>
        `${meal.mealType}: ${
          meal.recipeSnapshot.title
        } with ingredients ${meal.recipeSnapshot.ingredients.join(", ")}`
    );

    const prompt = `
    You are a nutrition expert and meal planner.

    1. Estimate the combined nutritional values (calories, protein (g), fat (g), carbohydrates (g)) 
       for the meals listed below.
    2. Create a full 7-day meal plan. Each day must have Breakfast, Lunch, Snack and Dinner. 
       Use realistic, healthy and balanced meals.
    3. Maximum limit per day is 2000 calories, protein maximum 50g, fat maximum 70g, carbohydrates maximum 260g.

    Meals provided:
    ${mealDescriptions.join("\n")}

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
        },
        {
        "mealType": "Lunch",
        "recipeSnapshot": { ... }
        },
        { "mealType": "Snack",
          "recipeSnapshot": { ... }
        },
        {
          "mealType": "Dinner",
          "recipeSnapshot": { ... }
        }],
        // Repeat for each day of the week
      "Tuesday": [ { ...same as Monday with 4 meals... } ],
      "Wednesday": [ {...same as Monday with 4 meals... } ],
      "Thursday": [ {...same as Monday with 4 meals... } ],
      "Friday": [ { ...same as Monday with 4 meals... } ],
      "Saturday": [ { ...same as Monday with 4 meals...} ],
      "Sunday": [ { ...same as Monday with 4 meals... } ]
      }
    }
    IMPORTANT: 
    - Just like I showed in the example using Monday, return the full structure with all fields.
    - All 7 days (Monday to Sunday) must have exactly 4 meals (Breakfast, Lunch, Snack, Dinner).
    - Meal titles should be creative and not repetitive. Descriptions should be concise and complete.
    - Each meal must follow the same schema.
    - Return strictly valid JSON without extra text or commentary.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    const text = result.response.text();

    // 🔎 Log raw AI response BEFORE parsing
    console.log("🔎 RAW AI RESPONSE START ==================");
    console.log(text);
    console.log("🔎 RAW AI RESPONSE END ====================");

    // Ensure JSON parsing is safe
    let cleanResponse = text.trim();

    // Remove markdown fences if present
    if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse
        .replace(/^```[a-zA-Z]*\n?/, "")
        .replace(/```$/, "");
    }

    // ✅ Keep only valid JSON part (truncate after last `}`)
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

    // Fallback: Ensure all 7 days are present
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
