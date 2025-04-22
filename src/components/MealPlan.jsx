import React, { useState, useEffect } from "react";
import Section from "./common/Section";

const MealPlan = ({ data, updateData }) => {
  const { mealPlanData = {}, dislikedFoods = [] } = data;
  const days = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
  const [isLoading, setIsLoading] = useState(false);

  // Определяем текущий день недели (0-6, где 0 - понедельник)
  const getCurrentDayOfWeek = () => {
    const today = new Date();
    // Получаем день недели (0 - воскресенье, 6 - суббота)
    let dayIndex = today.getDay();
    // Преобразуем в наш формат (0 - понедельник, 6 - воскресенье)
    return dayIndex === 0 ? 6 : dayIndex - 1;
  };

  const [currentDay, setCurrentDay] = useState(getCurrentDayOfWeek());
  const [editingMeal, setEditingMeal] = useState(null);
  const [newDish, setNewDish] = useState("");
  const [newCalories, setNewCalories] = useState("");
  const [newGrams, setNewGrams] = useState(""); 
  const [newProtein, setNewProtein] = useState("");
  const [newFat, setNewFat] = useState("");
  const [newCarbs, setNewCarbs] = useState("");
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeModalType, setRecipeModalType] = useState("");
  const [selectedMealData, setSelectedMealData] = useState(null);
  const [isFromRecipe, setIsFromRecipe] = useState(false);
  const [showSnackColumn, setShowSnackColumn] = useState(true); // Новое состояние для отображения колонки перекусов
  
  // Идеи блюд - генерируются через ИИ
  const [mealIdeas, setMealIdeas] = useState({
    breakfast: [],
    second_breakfast: [],
    lunch: [],
    dinner: []
  });

  // Загрузка планов питания из localStorage при первом рендере
  useEffect(() => {
    const savedMealPlanData = localStorage.getItem("mealPlanData");
    if (savedMealPlanData) {
      try {
        const parsedMealPlanData = JSON.parse(savedMealPlanData);
        updateData({ mealPlanData: parsedMealPlanData });
      } catch (error) {
        console.error("Ошибка при загрузке планов питания:", error);
      }
    }

    // Загрузка идей блюд
    const savedMealIdeas = localStorage.getItem("mealIdeas");
    if (savedMealIdeas) {
      try {
        const parsedMealIdeas = JSON.parse(savedMealIdeas);
        setMealIdeas(parsedMealIdeas);
      } catch (error) {
        console.error("Ошибка при загрузке идей блюд:", error);
      }
    } else {
      // Если идей блюд нет - генерируем их при первой загрузке
      regenerateIdeas();
    }
    
    // Загрузка состояния отображения колонки перекусов
    const savedShowSnackColumn = localStorage.getItem("showSnackColumn");
    if (savedShowSnackColumn !== null) {
      setShowSnackColumn(JSON.parse(savedShowSnackColumn));
    }
  }, []);

  // Получаем план питания для текущего дня или создаем пустой
  const initialMealPlan = [
    { 
      meal: "Завтрак", 
      dish: "", 
      calories: 0, 
      grams: 0, 
      protein: 0, 
      fat: 0, 
      carbs: 0, 
      status: "pending", 
      fromRecipe: false,
      snacks: [] // Добавлено поле для перекусов
    },
    { 
      meal: "Второй завтрак", 
      dish: "", 
      calories: 0, 
      grams: 0, 
      protein: 0, 
      fat: 0, 
      carbs: 0, 
      status: "pending", 
      fromRecipe: false,
      snacks: [] // Добавлено поле для перекусов
    },
    { 
      meal: "Обед", 
      dish: "", 
      calories: 0, 
      grams: 0, 
      protein: 0, 
      fat: 0, 
      carbs: 0, 
      status: "pending", 
      fromRecipe: false,
      snacks: [] // Добавлено поле для перекусов
    },
    { 
      meal: "Ужин", 
      dish: "", 
      calories: 0, 
      grams: 0, 
      protein: 0, 
      fat: 0, 
      carbs: 0, 
      status: "pending", 
      fromRecipe: false,
      snacks: [] // Добавлено поле для перекусов
    }
  ];

  // Инициализация всех дней, если их нет
  const initializeMealPlan = () => {
    let updatedMealPlan = { ...mealPlanData };

    // Проверяем и инициализируем все дни недели
    for (let i = 0; i < 7; i++) {
      if (
        !updatedMealPlan[i] ||
        !Array.isArray(updatedMealPlan[i]) ||
        updatedMealPlan[i].length === 0
      ) {
        updatedMealPlan[i] = [...initialMealPlan];
      }
      
      // Добавляем недостающие поля, если их нет
      updatedMealPlan[i] = updatedMealPlan[i].map(meal => {
        if (meal.grams === undefined) {
          meal.grams = 0;
        }
        if (meal.protein === undefined) {
          meal.protein = 0;
        }
        if (meal.fat === undefined) {
          meal.fat = 0;
        }
        if (meal.carbs === undefined) {
          meal.carbs = 0;
        }
        if (meal.fromRecipe === undefined) {
          meal.fromRecipe = false;
        }
        if (meal.snacks === undefined) {
          meal.snacks = []; // Добавляем поле перекусов
        }
        return meal;
      });
    }

    return updatedMealPlan;
  };

  const allMealPlans = initializeMealPlan();
  const currentMeals = allMealPlans[currentDay] || [...initialMealPlan];

  // Переключение отображения колонки перекусов
  const toggleShowSnackColumn = () => {
    const newValue = !showSnackColumn;
    setShowSnackColumn(newValue);
    localStorage.setItem("showSnackColumn", JSON.stringify(newValue));
  };

  // Очистка отдельного приема пищи
  const clearMeal = (index) => {
    if (window.confirm(`Вы уверены, что хотите очистить "${currentMeals[index].meal}"?`)) {
      const updatedMeals = [...currentMeals];
      // Сохраняем название приема пищи и перекусы
      const { meal, snacks } = updatedMeals[index];
      updatedMeals[index] = {
        ...initialMealPlan[index < initialMealPlan.length ? index : initialMealPlan.length - 1], // Берем исходный шаблон
        meal, // Сохраняем название приема пищи
        snacks // Сохраняем перекусы
      };
      
      const updatedMealPlan = { ...allMealPlans };
      updatedMealPlan[currentDay] = updatedMeals;
      
      // Сохраняем в localStorage
      localStorage.setItem("mealPlanData", JSON.stringify(updatedMealPlan));
      updateData({ mealPlanData: updatedMealPlan });
    }
  };

  // Добавление перекуса
  const addSnack = (mealIndex, snackName) => {
    if (!snackName || snackName.trim() === "") return;
    
    const updatedMeals = [...currentMeals];
    // Если поле snacks не определено, создаем его
    if (!updatedMeals[mealIndex].snacks) {
      updatedMeals[mealIndex].snacks = [];
    }
    
    // Добавляем новый перекус
    updatedMeals[mealIndex].snacks.push({
      name: snackName.trim(),
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    });
    
    const updatedMealPlan = { ...allMealPlans };
    updatedMealPlan[currentDay] = updatedMeals;
    
    // Сохраняем в localStorage
    localStorage.setItem("mealPlanData", JSON.stringify(updatedMealPlan));
    updateData({ mealPlanData: updatedMealPlan });
  };

  // Удаление перекуса
  const removeSnack = (mealIndex, snackIndex) => {
    const updatedMeals = [...currentMeals];
    
    // Проверяем, что перекусы существуют
    if (!updatedMeals[mealIndex].snacks) return;
    
    // Удаляем перекус
    updatedMeals[mealIndex].snacks.splice(snackIndex, 1);
    
    const updatedMealPlan = { ...allMealPlans };
    updatedMealPlan[currentDay] = updatedMeals;
    
    // Сохраняем в localStorage
    localStorage.setItem("mealPlanData", JSON.stringify(updatedMealPlan));
    updateData({ mealPlanData: updatedMealPlan });
  };

  // Обновление статуса приема пищи для конкретного дня
  const updateMealStatus = (index, newStatus) => {
    const updatedMeals = [...currentMeals];
    updatedMeals[index].status = newStatus;

    const updatedMealPlan = { ...allMealPlans };
    updatedMealPlan[currentDay] = updatedMeals;

    // Сохраняем в localStorage
    localStorage.setItem("mealPlanData", JSON.stringify(updatedMealPlan));
    updateData({ mealPlanData: updatedMealPlan });
  };

  // Редактирование блюда для конкретного дня
  const editMealDish = (index, newDish) => {
    const updatedMeals = [...currentMeals];
    updatedMeals[index].dish = newDish;

    const updatedMealPlan = { ...allMealPlans };
    updatedMealPlan[currentDay] = updatedMeals;

    // Сохраняем в localStorage
    localStorage.setItem("mealPlanData", JSON.stringify(updatedMealPlan));
    updateData({ mealPlanData: updatedMealPlan });
  };

  // Коэффициенты калорийности на 1 грамм
  const caloriesPerGram = {
    default: 1.5, // В среднем для смешанной пищи
    protein: 4, // 4 ккал на 1 грамм белка
    fat: 9, // 9 ккал на 1 грамм жира
    carbs: 4 // 4 ккал на 1 грамм углеводов
  };

  // Редактирование калорий для конкретного дня
  const editMealCalories = (index, newCalories) => {
    const updatedMeals = [...currentMeals];
    updatedMeals[index].calories = newCalories;

    const updatedMealPlan = { ...allMealPlans };
    updatedMealPlan[currentDay] = updatedMeals;

    // Сохраняем в localStorage
    localStorage.setItem("mealPlanData", JSON.stringify(updatedMealPlan));
    updateData({ mealPlanData: updatedMealPlan });
  };

  // Редактирование БЖУ для конкретного дня
  const editMealNutrition = (index, protein, fat, carbs) => {
    const updatedMeals = [...currentMeals];
    updatedMeals[index].protein = protein;
    updatedMeals[index].fat = fat;
    updatedMeals[index].carbs = carbs;

    const updatedMealPlan = { ...allMealPlans };
    updatedMealPlan[currentDay] = updatedMeals;

    // Сохраняем в localStorage
    localStorage.setItem("mealPlanData", JSON.stringify(updatedMealPlan));
    updateData({ mealPlanData: updatedMealPlan });
  };

  // Редактирование граммовки для конкретного дня с автоматическим перерасчетом калорий и БЖУ
  const editMealGrams = (index, newGrams, updateCalories = true) => {
    const updatedMeals = [...currentMeals];
    const oldGrams = updatedMeals[index].grams || 0;
    updatedMeals[index].grams = newGrams;
    
    // Если нужно обновить калории и БЖУ и у нас есть предыдущие данные, рассчитываем новые значения
    if (updateCalories && oldGrams > 0) {
      const ratio = newGrams / oldGrams;
      
      if (updatedMeals[index].calories > 0) {
        updatedMeals[index].calories = Math.round(updatedMeals[index].calories * ratio);
      }
      
      if (updatedMeals[index].protein > 0) {
        updatedMeals[index].protein = Math.round(updatedMeals[index].protein * ratio);
      }
      
      if (updatedMeals[index].fat > 0) {
        updatedMeals[index].fat = Math.round(updatedMeals[index].fat * ratio);
      }
      
      if (updatedMeals[index].carbs > 0) {
        updatedMeals[index].carbs = Math.round(updatedMeals[index].carbs * ratio);
      }
    }

    const updatedMealPlan = { ...allMealPlans };
    updatedMealPlan[currentDay] = updatedMeals;

    // Сохраняем в localStorage
    localStorage.setItem("mealPlanData", JSON.stringify(updatedMealPlan));
    updateData({ mealPlanData: updatedMealPlan });
  };

  // Расчет граммовки на основе калорий
  const estimateGramsFromCalories = (calories) => {
    // Очень примерная оценка: 1 грамм пищи ≈ 1-2 ккал в среднем
    // Используем коэффициент 1.5 для простоты
    return Math.round(calories / caloriesPerGram.default);
  };

  // Функция для открытия модального окна с рецептом
  const openRecipeModal = (mealType) => {
    setRecipeModalType(mealType);
    setShowRecipeModal(true);
  };

  // Функция для сохранения рецепта
  const saveRecipeToSaved = (recipe) => {
    // Получаем текущие сохраненные рецепты
    const savedRecipes = JSON.parse(localStorage.getItem("savedRecipes") || "[]");
    
    // Проверяем, есть ли уже такой рецепт
    const isExisting = savedRecipes.some(r => r.title === recipe.title);
    
    if (!isExisting) {
      const updatedSavedRecipes = [...savedRecipes, recipe];
      localStorage.setItem("savedRecipes", JSON.stringify(updatedSavedRecipes));
      alert(`Рецепт "${recipe.title}" сохранен!`);
    } else {
      alert(`Рецепт "${recipe.title}" уже сохранен!`);
    }
  };

  // Функция для добавления рецепта в план питания
  const addRecipeToPlan = (recipe, mealIndex) => {
    const updatedMeals = [...currentMeals];
    updatedMeals[mealIndex] = {
      ...updatedMeals[mealIndex],
      dish: recipe.title,
      calories: recipe.calories,
      protein: recipe.protein || 0,
      fat: recipe.fat || 0,
      carbs: recipe.carbs || 0,
      grams: recipe.grams || estimateGramsFromCalories(recipe.calories),
      status: "pending",
      fromRecipe: true // Помечаем, что блюдо добавлено из рецепта
    };

    const updatedMealPlan = { ...allMealPlans };
    updatedMealPlan[currentDay] = updatedMeals;

    // Сохраняем в localStorage
    localStorage.setItem("mealPlanData", JSON.stringify(updatedMealPlan));
    updateData({ mealPlanData: updatedMealPlan });
    
    // Закрываем модальное окно
    setShowRecipeModal(false);
    
    // Показываем уведомление
    alert(`Рецепт "${recipe.title}" добавлен в план питания!`);
  };

  // Функция для выбора типа приёма пищи для модального окна
  const getMealTypeFromIndex = (index) => {
    switch(index) {
      case 0: return "breakfast";
      case 1: return "second_breakfast";
      case 2: return "lunch";
      case 3: return "dinner";
      default: return "breakfast";
    }
  };

  // Функция для получения типа приема пищи на русском
  const getMealTypeRussianName = (type) => {
    switch(type) {
      case "breakfast": return "завтраков";
      case "second_breakfast": return "вторых завтраков";
      case "lunch": return "обедов";
      case "dinner": return "ужинов";
      default: return "блюд";
    }
  };

  // Получение списка рецептов для выбранного типа приема пищи
  const getRecipesForMealType = (mealType) => {
    return mealIdeas[mealType] || [];
  };

  // Функция для парсинга рецептов из текста
  const parseRecipesSection = (content, maxRecipes = 4) => {
    try {
      const recipes = [];
      
      // Разделяем на отдельные рецепты (по номерам или пустым строкам)
      const recipeBlocks = content.split(/\d+\.\s+/).slice(1);
      
      // Обрабатываем каждый блок рецепта
      recipeBlocks.forEach(block => {
        if (recipes.length >= maxRecipes) return; // Не обрабатываем больше maxRecipes рецептов
        
        const lines = block.split('\n').filter(line => line.trim());
        if (lines.length < 5) return; // Пропускаем слишком короткие блоки
        
        // Парсим название
        const titleLine = lines[0].trim();
        
        // Парсим категорию
        const categoryLine = lines.find(line => line.toLowerCase().includes('категория'));
        const category = categoryLine && categoryLine.toLowerCase().includes('pink') ? "pink" : "purple";
        
        // Парсим ингредиенты
        const ingredientsStartIndex = lines.findIndex(line => line.includes('Ингредиенты'));
        const ingredientsEndIndex = lines.findIndex((line, index) => 
          index > ingredientsStartIndex && (line.includes('Приготовление') || line.includes('Инструкции')));
        
        if (ingredientsStartIndex === -1 || ingredientsEndIndex === -1) return; // Пропускаем, если не найдены разделы
        
        const ingredients = lines.slice(ingredientsStartIndex + 1, ingredientsEndIndex)
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(ing => ing);
        
        // Парсим инструкции
        const instructionsLine = lines.find(line => line.includes('Приготовление') || line.includes('Инструкции'));
        const instructions = instructionsLine ? 
          instructionsLine.replace(/(Приготовление|Инструкции):\s*/, '').trim() : "";
        
        // Парсим пищевую ценность
        const nutritionLine = lines.find(line => line.includes('Калории') || line.includes('ккал'));
        let calories = 500, protein = 20, fat = 20, carbs = 30;
        
        if (nutritionLine) {
          const caloriesMatch = nutritionLine.match(/(\d+)\s*ккал/);
          if (caloriesMatch) calories = parseInt(caloriesMatch[1]);
          
          const proteinMatch = nutritionLine.match(/Белки:\s*(\d+)/i) || nutritionLine.match(/Белки\s*:?\s*(\d+)/i);
          if (proteinMatch) protein = parseInt(proteinMatch[1]);
          
          const fatMatch = nutritionLine.match(/Жиры:\s*(\d+)/i) || nutritionLine.match(/Жиры\s*:?\s*(\d+)/i);
          if (fatMatch) fat = parseInt(fatMatch[1]);
          
          const carbsMatch = nutritionLine.match(/Углеводы:\s*(\d+)/i) || nutritionLine.match(/Углеводы\s*:?\s*(\d+)/i);
          if (carbsMatch) carbs = parseInt(carbsMatch[1]);
        }
        
        // Парсим вес блюда
        const weightLine = lines.find(line => line.includes('Вес готового блюда'));
        let grams = estimateGramsFromCalories(calories);
        
        if (weightLine) {
          const weightMatch = weightLine.match(/(\d+)\s*г/);
          if (weightMatch) grams = parseInt(weightMatch[1]);
        }
        
        // Добавляем рецепт в список, только если у нас есть основные данные
        if (titleLine && ingredients.length > 0 && instructions) {
          recipes.push({
            title: titleLine,
            category,
            ingredients,
            instructions,
            calories,
            protein,
            fat,
            carbs,
            grams
          });
        }
      });
      
      return recipes;
    } catch (error) {
      console.error("Ошибка при парсинге рецептов:", error);
      return [];
    }
  };

  // Функция для генерации идей блюд через Claude
  const regenerateIdeas = async () => {
    const apiKey = localStorage.getItem("anthropic_api_key");
    if (!apiKey) {
      alert("Добавьте API ключ Anthropic в настройках");
      return;
    }

    setIsLoading(true);
    try {
      const dislikedFoodsString = dislikedFoods.length > 0 
        ? `Не используй следующие продукты: ${dislikedFoods.join(", ")}.` 
        : "";

      // Отправляем запрос на каждый тип блюда отдельно, чтобы получить более качественные результаты
      const breakfastResponse = await fetch("http://localhost:5001/claude", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          apiKey: localStorage.getItem("anthropic_api_key"),
          payload: {
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            messages: [
              {
                role: "user",
                content: `Ты - диетолог-повар, специализирующийся на здоровом наборе веса. Сгенерируй 4 рецепта завтраков для набора веса в следующем формате:

1. 🍳 НАЗВАНИЕ ЗАВТРАКА
Категория: purple
Ингредиенты:
- Ингредиент 1 - 100г
- Ингредиент 2 - 50г
- Ингредиент 3 - 30г
Приготовление: Краткое описание процесса приготовления.
Калории: 500 ккал | Белки: 25г | Жиры: 20г | Углеводы: 40г
Вес готового блюда: 300г

2. 🥞 НАЗВАНИЕ РЕЦЕПТА
...

Рецепты должны быть:
- Питательными и калорийными (400-700 ккал)
- Богатыми белком
- Разнообразными по составу
- Простыми в приготовлении (5-10 минут)
${dislikedFoodsString}

Важно: генерируй только 4 завтрака строго в указанном формате, без дополнительных пояснений.`
              }
            ]
          } 
        })
      });

      const secondBreakfastResponse = await fetch("http://localhost:5001/claude", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          apiKey: localStorage.getItem("anthropic_api_key"),
          payload: {
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            messages: [
              {
                role: "user",
                content: `Ты - диетолог-повар, специализирующийся на здоровом наборе веса. Сгенерируй 4 рецепта вторых завтраков для набора веса в следующем формате:

1. 🥤 НАЗВАНИЕ ВТОРОГО ЗАВТРАКА
Категория: purple
Ингредиенты:
- Ингредиент 1 - 100г
- Ингредиент 2 - 50г
- Ингредиент 3 - 30г
Приготовление: Краткое описание процесса приготовления.
Калории: 500 ккал | Белки: 25г | Жиры: 20г | Углеводы: 40г
Вес готового блюда: 300г

2. 🥪 НАЗВАНИЕ РЕЦЕПТА
...

Рецепты должны быть:
- Питательными и калорийными (400-700 ккал)
- Богатыми белком
- Разнообразными по составу
- Простыми в приготовлении (5-10 минут)
${dislikedFoodsString}

Важно: генерируй только 4 вторых завтрака строго в указанном формате, без дополнительных пояснений.`
              }
            ]
          } 
        })
      });

      const lunchResponse = await fetch("http://localhost:5001/claude", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          apiKey: localStorage.getItem("anthropic_api_key"),
          payload: {
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            messages: [
              {
                role: "user",
                content: `Ты - диетолог-повар, специализирующийся на здоровом наборе веса. Сгенерируй 4 рецепта обедов для набора веса в следующем формате:

1. 🍲 НАЗВАНИЕ ОБЕДА
Категория: purple
Ингредиенты:
- Ингредиент 1 - 100г
- Ингредиент 2 - 50г
- Ингредиент 3 - 30г
Приготовление: Краткое описание процесса приготовления.
Калории: 600 ккал | Белки: 30г | Жиры: 25г | Углеводы: 50г
Вес готового блюда: 400г

2. 🍝 НАЗВАНИЕ РЕЦЕПТА
...

Рецепты должны быть:
- Питательными и калорийными (500-800 ккал)
- Богатыми белком
- Разнообразными по составу
- Простыми в приготовлении (10-15 минут)
${dislikedFoodsString}

Важно: генерируй только 4 обеда строго в указанном формате, без дополнительных пояснений.`
              }
            ]
          } 
        })
      });

      const dinnerResponse = await fetch("http://localhost:5001/claude", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          apiKey: localStorage.getItem("anthropic_api_key"),
          payload: {
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            messages: [
              {
                role: "user",
                content: `Ты - диетолог-повар, специализирующийся на здоровом наборе веса. Сгенерируй 4 рецепта ужинов для набора веса в следующем формате:

1. 🥗 НАЗВАНИЕ УЖИНА
Категория: pink
Ингредиенты:
- Ингредиент 1 - 100г
- Ингредиент 2 - 50г
- Ингредиент 3 - 30г
Приготовление: Краткое описание процесса приготовления.
Калории: 550 ккал | Белки: 30г | Жиры: 20г | Углеводы: 40г
Вес готового блюда: 350г

2. 🍖 НАЗВАНИЕ РЕЦЕПТА
...

Рецепты должны быть:
- Питательными и калорийными (450-700 ккал)
- Богатыми белком
- Разнообразными по составу
- Простыми в приготовлении (10-15 минут)
${dislikedFoodsString}

Важно: генерируй только 4 ужина строго в указанном формате, без дополнительных пояснений.`
              }
            ]
          } 
        })
      });

      // Дожидаемся ответов от всех запросов
      const [breakfastData, secondBreakfastData, lunchData, dinnerData] = await Promise.all([
        breakfastResponse.json(),
        secondBreakfastResponse.json(),
        lunchResponse.json(),
        dinnerResponse.json()
      ]);

      // Парсим полученные ответы
      const breakfastContent = breakfastData.content[0].text;
      const secondBreakfastContent = secondBreakfastData.content[0].text;
      const lunchContent = lunchData.content[0].text;
      const dinnerContent = dinnerData.content[0].text;

      // Парсим каждую категорию отдельно
      const breakfastRecipes = parseRecipesSection(breakfastContent, 4);
      const secondBreakfastRecipes = parseRecipesSection(secondBreakfastContent, 4);
      const lunchRecipes = parseRecipesSection(lunchContent, 4);
      const dinnerRecipes = parseRecipesSection(dinnerContent, 4);

      // Создаем обновленный объект с идеями блюд
      const newIdeas = {
        breakfast: breakfastRecipes,
        second_breakfast: secondBreakfastRecipes,
        lunch: lunchRecipes,
        dinner: dinnerRecipes
      };

      console.log("Новые идеи блюд:", newIdeas);
      
      // Обновляем состояние и сохраняем в localStorage
      setMealIdeas(newIdeas);
      localStorage.setItem("mealIdeas", JSON.stringify(newIdeas));
      alert("Идеи блюд успешно обновлены!");
      
    } catch (error) {
      console.error("Ошибка при получении идей блюд:", error);
      alert("Произошла ошибка при получении идей блюд. Проверьте API ключ и подключение.");
    } finally {
      setIsLoading(false);
    }
  };

  // Состояние для хранения данных о новом перекусе
  const [newSnack, setNewSnack] = useState("");
  const [editingSnackMealIndex, setEditingSnackMealIndex] = useState(null);

  // Компонент формы для добавления перекуса
  const SnackForm = ({ mealIndex }) => {
    return (
      <div className="flex items-center mt-1">
        <input
          type="text"
          className="flex-grow border rounded-l px-2 py-1 text-sm"
          value={editingSnackMealIndex === mealIndex ? newSnack : ""}
          onChange={(e) => setNewSnack(e.target.value)}
          placeholder="Добавить перекус"
          onFocus={() => setEditingSnackMealIndex(mealIndex)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              addSnack(mealIndex, newSnack);
              setNewSnack("");
            }
          }}
        />
        <button 
          className="bg-purple-500 text-white px-2 py-1 rounded-r text-sm"
          onClick={() => {
            addSnack(mealIndex, newSnack);
            setNewSnack("");
          }}
        >
          +
        </button>
      </div>
    );
  };
  
  // Компонент для отображения перекусов
  const SnackList = ({ snacks, mealIndex }) => {
    if (!snacks || snacks.length === 0) {
      return <div className="text-xs text-gray-500">Нет перекусов</div>;
    }
    
    return (
      <div>
        {snacks.map((snack, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div>{snack.name}</div>
            <button 
              className="text-red-500 hover:text-red-700 text-xs ml-2"
              onClick={() => removeSnack(mealIndex, index)}
            >
              ✖
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Расчет суммарных данных о перекусах
  const calculateSnacksTotals = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    
    currentMeals.forEach(meal => {
      if (meal.snacks && Array.isArray(meal.snacks)) {
        meal.snacks.forEach(snack => {
          totalCalories += snack.calories || 0;
          totalProtein += snack.protein || 0;
          totalFat += snack.fat || 0;
          totalCarbs += snack.carbs || 0;
        });
      }
    });
    
    return {
      calories: totalCalories,
      protein: totalProtein,
      fat: totalFat,
      carbs: totalCarbs
    };
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-purple-600 mb-4">
          МУРЛЫКАЮЩИЙ ПЛАН ПИТАНИЯ
        </h2>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-700">
              План на неделю
            </h3>
            <div className="flex space-x-4 items-center">
              {/* Кнопка для переключения отображения колонки перекусов */}
              <button
                className={`px-3 py-1 text-sm rounded-lg ${
                  showSnackColumn
                    ? "bg-pink-100 text-pink-700"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={toggleShowSnackColumn}
              >
                {showSnackColumn ? "Скрыть перекусы" : "Показать перекусы"}
              </button>
              <div className="flex space-x-1">
                {days.map((day, idx) => (
                  <button
                    key={day}
                    className={`px-3 py-1 text-sm rounded-full ${
                      idx === currentDay
                        ? "bg-purple-400 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-purple-100"
                    }`}
                    onClick={() => setCurrentDay(idx)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider w-1/8">
                  Прием пищи
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider w-2/8">
                  Блюдо
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider w-1/8">
                  Граммы
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider w-1/8">
                  Калории
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider w-1/8">
                  Б/Ж/У
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider w-1/8">
                  Статус
                </th>
                {/* Дополнительная колонка для перекусов, которую можно скрыть */}
                {showSnackColumn && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider w-1/8">
                    Перекусы
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider w-1/8">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentMeals.map((meal, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-pink-50" : "bg-purple-50"}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {meal.meal}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {editingMeal === index ? (
                      <input
                        type="text"
                        className="border rounded px-2 py-1 w-full text-sm"
                        value={newDish}
                        onChange={(e) => setNewDish(e.target.value)}
                      />
                    ) : (
                      <div className="flex justify-between items-center">
                        <div
                          className="cursor-pointer hover:text-purple-700"
                          onClick={() => {
                            setEditingMeal(index);
                            setNewDish(meal.dish);
                            setNewCalories(meal.calories.toString());
                            setNewGrams(meal.grams.toString() || "0");
                            setNewProtein(meal.protein.toString() || "0");
                            setNewFat(meal.fat.toString() || "0");
                            setNewCarbs(meal.carbs.toString() || "0");
                            setIsFromRecipe(meal.fromRecipe || false);
                          }}
                        >
                          {meal.dish || "Нажмите, чтобы добавить блюдо"}
                        </div>
                        <button
                          className="ml-2 px-2 py-1 bg-purple-200 text-purple-800 rounded-md text-xs hover:bg-purple-300"
                          onClick={() => {
                            setRecipeModalType(getMealTypeFromIndex(index));
                            setSelectedMealData({ index });
                            setShowRecipeModal(true);
                          }}
                        >
                          Выбрать
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {editingMeal === index ? (
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-full text-sm"
                        value={newGrams}
                        onChange={(e) => {
                          setNewGrams(e.target.value);
                          
                          // Автоматически рассчитываем калории и БЖУ на основе новой граммовки, если это блюдо из рецепта
                          if (isFromRecipe && meal.calories > 0 && meal.grams > 0) {
                            const ratio = parseInt(e.target.value) / meal.grams;
                            setNewCalories(Math.round(meal.calories * ratio).toString());
                            setNewProtein(Math.round(meal.protein * ratio).toString());
                            setNewFat(Math.round(meal.fat * ratio).toString());
                            setNewCarbs(Math.round(meal.carbs * ratio).toString());
                          }
                        }}
                      />
                    ) : (
                      `${meal.grams || 0} г`
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {editingMeal === index ? (
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-full text-sm"
                        value={newCalories}
                        onChange={(e) => {
                          setNewCalories(e.target.value);
                          
                          // Если блюдо не из рецепта, позволяем изменять калории независимо
                          if (!isFromRecipe) {
                            // Автоматически расчитываем граммовку, если есть соотношение калорий к граммам
                            if (meal.calories > 0 && meal.grams > 0) {
                              const originalRatio = meal.grams / meal.calories;
                              const newGramsValue = Math.round(parseInt(e.target.value) * originalRatio);
                              setNewGrams(newGramsValue.toString());
                            } else if (!newGrams || newGrams === "0") {
                              setNewGrams(estimateGramsFromCalories(parseInt(e.target.value)).toString());
                            }
                          }
                        }}
                        disabled={isFromRecipe} // Блокируем редактирование калорий для блюд из рецептов
                      />
                    ) : (
                      `${meal.calories} ккал`
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {editingMeal === index ? (
                      isFromRecipe ? (
                        // Для блюд из рецептов просто показываем текущие значения без возможности редактирования
                        <div className="text-sm text-gray-600">
                          Б:{newProtein}/Ж:{newFat}/У:{newCarbs}
                        </div>
                      ) : (
                        // Для блюд, добавленных вручную, позволяем редактировать БЖУ
                        <div className="flex space-x-1">
                          <input
                            type="number"
                            className="border rounded px-1 py-1 w-12 text-xs"
                            value={newProtein}
                            onChange={(e) => setNewProtein(e.target.value)}
                            placeholder="Б"
                          />
                          <input
                            type="number"
                            className="border rounded px-1 py-1 w-12 text-xs"
                            value={newFat}
                            onChange={(e) => setNewFat(e.target.value)}
                            placeholder="Ж"
                          />
                          <input
                            type="number"
                            className="border rounded px-1 py-1 w-12 text-xs"
                            value={newCarbs}
                            onChange={(e) => setNewCarbs(e.target.value)}
                            placeholder="У"
                          />
                        </div>
                      )
                    ) : (
                      `${meal.protein}/${meal.fat}/${meal.carbs}`
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {editingMeal === index ? (
                      <div className="flex space-x-2">
                        <button
                          className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                          onClick={() => {
                            editMealDish(index, newDish);
                            editMealCalories(
                              index,
                              parseInt(newCalories) || meal.calories
                            );
                            editMealGrams(
                              index,
                              parseInt(newGrams) || 0,
                              false // не рассчитывать калории, так как мы уже установили их вручную
                            );
                            if (!isFromRecipe) {
                              editMealNutrition(
                                index,
                                parseInt(newProtein) || 0,
                                parseInt(newFat) || 0,
                                parseInt(newCarbs) || 0
                              );
                            }
                            setEditingMeal(null);
                          }}
                        >
                          Сохранить
                        </button>
                        <button
                          className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                          onClick={() => setEditingMeal(null)}
                        >
                          Отмена
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        {meal.status === "completed" ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Выполнено ✓
                          </span>
                        ) : meal.status === "in-progress" ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            В процессе ⌛
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            Ожидается ○
                          </span>
                        )}
                        <div className="flex space-x-1">
                          <button
                            className="text-green-500 hover:text-green-700 text-xs"
                            onClick={() => updateMealStatus(index, "completed")}
                          >
                            ✓
                          </button>
                          <button
                            className="text-yellow-500 hover:text-yellow-700 text-xs"
                            onClick={() =>
                              updateMealStatus(index, "in-progress")
                            }
                          >
                            ⌛
                          </button>
                          <button
                            className="text-gray-500 hover:text-gray-700 text-xs"
                            onClick={() => updateMealStatus(index, "pending")}
                          >
                            ○
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                  {/* Колонка с перекусами */}
                  {showSnackColumn && (
                    <td className="px-4 py-3 text-sm">
                      <SnackList snacks={meal.snacks} mealIndex={index} />
                      <SnackForm mealIndex={index} />
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    <button
                      className="text-red-500 hover:text-red-700 text-xl"
                      onClick={() => clearMeal(index)}
                      title="Очистить прием пищи"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-purple-100">
              <tr>
                <td
                  className="px-4 py-2 text-right text-sm font-medium text-purple-700"
                  colSpan={2}
                >
                  Всего за день:
                </td>
                <td className="px-4 py-2 text-sm font-medium text-purple-700">
                  {currentMeals.reduce((total, meal) => total + (meal.grams || 0), 0)} г
                </td>
                <td className="px-4 py-2 text-sm font-medium text-purple-700">
                  {currentMeals.reduce((total, meal) => total + (meal.calories || 0), 0)} ккал
                </td>
                <td className="px-4 py-2 text-sm font-medium text-purple-700">
                  {currentMeals.reduce((total, meal) => total + (meal.protein || 0), 0)}/
                  {currentMeals.reduce((total, meal) => total + (meal.fat || 0), 0)}/
                  {currentMeals.reduce((total, meal) => total + (meal.carbs || 0), 0)}
                </td>
                <td className="px-4 py-2 text-sm font-medium text-purple-700" colSpan={showSnackColumn ? 3 : 2}>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-purple-400 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (currentMeals.reduce(
                              (total, meal) => total + (meal.calories || 0),
                              0
                            ) /
                              2300) *
                              100
                          )
                        )}%`,
                      }}
                    ></div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-purple-700">Список идей блюд</h3>
        <button
          className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 flex items-center"
          onClick={regenerateIdeas}
          disabled={isLoading}
        >
          <span className="mr-1">{isLoading ? "..." : "🔄"}</span> Перегенерировать
        </button>
      </div>

      <Section title="Идеи для разных приемов пищи" icon="🍴">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border border-purple-200 rounded-lg">
            <div className="font-medium text-purple-700 mb-2 flex justify-between items-center">
              <span>Завтраки 🍳</span>
              <button
                className="px-2 py-1 bg-purple-200 text-purple-800 rounded-md text-xs hover:bg-purple-300"
                onClick={() => openRecipeModal("breakfast")}
              >
                Показать рецепты
              </button>
            </div>
            <ul className="text-sm">
              {mealIdeas.breakfast && mealIdeas.breakfast.slice(0, 4).map((recipe, index) => (
                <li key={index} className="mb-1 flex items-center">
                  <span className="w-4 h-4 mr-2 text-pink-500">•</span>
                  <span>{recipe.title.replace(/^🍳|🥣|🍮|🥑|🥞\s/, '')}</span>
                </li>
              ))}
              {(!mealIdeas.breakfast || mealIdeas.breakfast.length === 0) && (
                <li className="text-gray-500 italic">Нажмите "Перегенерировать" для получения идей завтраков</li>
              )}
            </ul>
          </div>

          <div className="p-3 border border-pink-200 rounded-lg">
            <div className="font-medium text-pink-700 mb-2 flex justify-between items-center">
              <span>Вторые завтраки 🥪</span>
              <button
                className="px-2 py-1 bg-pink-200 text-pink-800 rounded-md text-xs hover:bg-pink-300"
                onClick={() => openRecipeModal("second_breakfast")}
              >
                Показать рецепты
              </button>
            </div>
            <ul className="text-sm">
              {mealIdeas.second_breakfast && mealIdeas.second_breakfast.slice(0, 4).map((recipe, index) => (
                <li key={index} className="mb-1 flex items-center">
                  <span className="w-4 h-4 mr-2 text-purple-500">•</span>
                  <span>{recipe.title.replace(/^🥤|🍰|🥜|🍪\s/, '')}</span>
                </li>
              ))}
              {(!mealIdeas.second_breakfast || mealIdeas.second_breakfast.length === 0) && (
                <li className="text-gray-500 italic">Нажмите "Перегенерировать" для получения идей вторых завтраков</li>
              )}
            </ul>
          </div>

          <div className="p-3 border border-purple-200 rounded-lg">
            <div className="font-medium text-purple-700 mb-2 flex justify-between items-center">
              <span>Обеды 🍲</span>
              <button
                className="px-2 py-1 bg-purple-200 text-purple-800 rounded-md text-xs hover:bg-purple-300"
                onClick={() => openRecipeModal("lunch")}
              >
                Показать рецепты
              </button>
            </div>
            <ul className="text-sm">
              {mealIdeas.lunch && mealIdeas.lunch.slice(0, 4).map((recipe, index) => (
                <li key={index} className="mb-1 flex items-center">
                  <span className="w-4 h-4 mr-2 text-pink-500">•</span>
                  <span>{recipe.title.replace(/^🍝|🐟|🍲|🥘\s/, '')}</span>
                </li>
              ))}
              {(!mealIdeas.lunch || mealIdeas.lunch.length === 0) && (
                <li className="text-gray-500 italic">Нажмите "Перегенерировать" для получения идей обедов</li>
              )}
            </ul>
          </div>

          <div className="p-3 border border-pink-200 rounded-lg">
            <div className="font-medium text-pink-700 mb-2 flex justify-between items-center">
              <span>Ужины 🥗</span>
              <button
                className="px-2 py-1 bg-pink-200 text-pink-800 rounded-md text-xs hover:bg-pink-300"
                onClick={() => openRecipeModal("dinner")}
              >
                Показать рецепты
              </button>
            </div>
            <ul className="text-sm">
              {mealIdeas.dinner && mealIdeas.dinner.slice(0, 4).map((recipe, index) => (
                <li key={index} className="mb-1 flex items-center">
                  <span className="w-4 h-4 mr-2 text-purple-500">•</span>
                  <span>{recipe.title.replace(/^🥄|🍳|🥑|🥗\s/, '')}</span>
                </li>
              ))}
              {(!mealIdeas.dinner || mealIdeas.dinner.length === 0) && (
                <li className="text-gray-500 italic">Нажмите "Перегенерировать" для получения идей ужинов</li>
              )}
            </ul>
          </div>
        </div>
      </Section>
      
      {/* Модальное окно с рецептами (код не изменился, поэтому опустим для краткости) */}
      {/* ... */}
    </div>
  );
};

export default MealPlan;