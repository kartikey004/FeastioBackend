import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// async function test() {
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
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
    2. Create a full 7-day meal plan. Each day must have Breakfast, Lunch, and Dinner. 
       Use realistic and balanced meals.
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
        }],
        "Tuesday": [],
        "Wednesday": [],
        "Thursday": [],
        "Friday": [],
        "Saturday": [],
        "Sunday": []
      }
    }
    IMPORTANT: 
    - Just like I showed in the example using Monday, return the full structure with all fields.
    - Always include all 7 days (even if empty arrays).
    - Return strictly valid JSON without extra text or commentary.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    const text = result.response.text();

    // Ensure JSON parsing is safe
    let cleanResponse = text.trim();

    // Remove markdown code fences if present
    if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse
        .replace(/^```[a-zA-Z]*\n?/, "")
        .replace(/```$/, "");
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
