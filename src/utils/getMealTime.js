export const getDefaultMealTime = (mealType) => {
  switch (mealType.toLowerCase()) {
    case "breakfast":
      return "08:00";
    case "lunch":
      return "13:00";
    case "snack":
      return "16:00";
    case "dinner":
      return "20:00";
    default:
      return "12:00";
  }
};
