import React, { useState, useEffect } from "react";
import Section from "./common/Section";

const Recipes = ({ data, updateData }) => {
  const { dislikedFoods = [], mealPlanData = {} } = data;
  const [isLoading, setIsLoading] = useState(false);
  const [showNewRecipeForm, setShowNewRecipeForm] = useState(false);
  const [showRecipeDetails, setShowRecipeDetails] = useState(null);
  
  // Состояние для модального окна выбора приема пищи
  const [showMealSelection, setShowMealSelection] = useState(false);
  const [selectedRecipeForMeal, setSelectedRecipeForMeal] = useState(null);
  
  // Новый рецепт (пустой бланк)
  const emptyRecipeTemplate = {
    title: "",
    category: "pink",
    type: "other", // Новое поле для типа рецепта
    ingredients: ["", "", ""],
    instructions: "",
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    grams: 0
  };
  
  const [newRecipe, setNewRecipe] = useState({...emptyRecipeTemplate});

  // Названия категорий блюд
  const mealTypeNames = {
    "breakfast": "Завтраки",
    "second_breakfast": "Вторые завтраки",
    "lunch": "Обеды",
    "dinner": "Ужины",
    "smoothies": "Смузи",
    "soups": "Супы",
    "snacks": "Перекусы",
    "desserts": "Десерты",
    "other": "Разное"
  };

  // Названия приемов пищи для выбора
  const mealNames = {
    0: "Завтрак",
    1: "Второй завтрак",
    2: "Обед",
    3: "Ужин",
    4: "Перекус" // Добавлен новый прием пищи
  };

  // Состояния для хранения рецептов
  const [savedRecipes, setSavedRecipes] = useState([]);
  
  // Состояние для хранения классифицированных рецептов
  const [recipesByType, setRecipesByType] = useState({
    "breakfast": [],
    "second_breakfast": [],
    "lunch": [],
    "dinner": [],
    "smoothies": [],
    "soups": [],
    "snacks": [],
    "desserts": [],
    "other": []
  });

  // Состояние для хранения новых сгенерированных рецептов, которые пока не сохранены
  const [newRecipes, setNewRecipes] = useState([]);

  // Текущая отображаемая категория
  const [activeCategory, setActiveCategory] = useState("saved");
  
  // Состояние для хранения категорий, по которым будут генерироваться рецепты
  const [generatingCategory, setGeneratingCategory] = useState("breakfast");

  // Загрузка рецептов из localStorage при первом рендере
  useEffect(() => {
    const savedRecipesData = localStorage.getItem("savedRecipes");
    if (savedRecipesData) {
      try {
        const parsedRecipes = JSON.parse(savedRecipesData);
        setSavedRecipes(parsedRecipes);
        
        // Классифицируем рецепты
        classifyRecipes(parsedRecipes);
      } catch (error) {
        console.error("Ошибка при загрузке сохраненных рецептов:", error);
      }
    } else {
      // Если нет сохраненных рецептов, сразу генерируем их для каждой категории
      generateInitialRecipes();
    }
  }, []);

  // Функция для автоматической генерации начальных рецептов при первом использовании
  const generateInitialRecipes = async () => {
    // Генерируем рецепты только для основных категорий
    const mainCategories = ["breakfast", "lunch", "dinner", "smoothies"];
    
    for (const category of mainCategories) {
      await regenerateRecipes(category);
    }
  };

  // Функция для классификации рецептов по категориям
  const classifyRecipes = (recipes) => {
    // Создаем новый объект для классифицированных рецептов
    const classified = {
      "breakfast": [],
      "second_breakfast": [],
      "lunch": [],
      "dinner": [],
      "smoothies": [],
      "soups": [],
      "snacks": [],
      "desserts": [],
      "other": []
    };
    
    // Классифицируем каждый рецепт на основе его типа
    recipes.forEach(recipe => {
      // Если у рецепта уже есть тип, используем его
      if (recipe.type && classified[recipe.type]) {
        classified[recipe.type].push(recipe);
        return;
      }
      
      // Иначе определяем тип на основе названия и ингредиентов
      const type = determineRecipeType(recipe);
      classified[type].push({...recipe, type});
    });
    
    // Обновляем состояние с классифицированными рецептами
    setRecipesByType(classified);
  };

  // Сохранение рецептов в localStorage при изменении
  useEffect(() => {
    if (savedRecipes.length > 0) {
      // Сохраняем все рецепты в одном месте
      localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes));
      
      // Классифицируем рецепты при изменении
      classifyRecipes(savedRecipes);
    }
  }, [savedRecipes]);

  // Открыть модальное окно выбора приема пищи
  const openMealSelection = (recipe) => {
    setSelectedRecipeForMeal(recipe);
    setShowMealSelection(true);
  };

  // Функция для добавления рецепта в план питания с выбором приема пищи
  const addToMealPlan = (recipe, mealIndex) => {
    // Получаем текущий день недели (0-6, где 0 - понедельник)
    const getCurrentDayOfWeek = () => {
      const today = new Date();
      // Получаем день недели (0 - воскресенье, 6 - суббота)
      let dayIndex = today.getDay();
      // Преобразуем в наш формат (0 - понедельник, 6 - воскресенье)
      return dayIndex === 0 ? 6 : dayIndex - 1;
    };

    const currentDay = getCurrentDayOfWeek();
    
    // Инициализация плана питания, если он пустой
    let updatedMealPlan = { ...mealPlanData };
    
    // Проверяем и инициализируем текущий день, если нужно
    if (!updatedMealPlan[currentDay] || !Array.isArray(updatedMealPlan[currentDay])) {
      updatedMealPlan[currentDay] = [
        { meal: "Завтрак", dish: "", calories: 0, protein: 0, fat: 0, carbs: 0, grams: 0, status: "pending", fromRecipe: false },
        { meal: "Второй завтрак", dish: "", calories: 0, protein: 0, fat: 0, carbs: 0, grams: 0, status: "pending", fromRecipe: false },
        { meal: "Обед", dish: "", calories: 0, protein: 0, fat: 0, carbs: 0, grams: 0, status: "pending", fromRecipe: false },
        { meal: "Ужин", dish: "", calories: 0, protein: 0, fat: 0, carbs: 0, grams: 0, status: "pending", fromRecipe: false },
        { meal: "Перекус", dish: "", calories: 0, protein: 0, fat: 0, carbs: 0, grams: 0, status: "pending", fromRecipe: false }
      ];
    }
    
    // Если в плане еще нет приема пищи "Перекус", добавляем его
    if (updatedMealPlan[currentDay].length < 5) {
      updatedMealPlan[currentDay].push({ 
        meal: "Перекус", 
        dish: "", 
        calories: 0, 
        protein: 0, 
        fat: 0, 
        carbs: 0, 
        grams: 0, 
        status: "pending", 
        fromRecipe: false 
      });
    }
    
    // Добавляем рецепт в план питания
    updatedMealPlan[currentDay][mealIndex] = {
      ...updatedMealPlan[currentDay][mealIndex],
      dish: recipe.title,
      calories: recipe.calories,
      protein: recipe.protein || 0,
      fat: recipe.fat || 0,
      carbs: recipe.carbs || 0,
      grams: recipe.grams || estimateGramsFromCalories(recipe.calories), // Используем указанную граммовку или рассчитываем по калориям
      status: "pending",
      fromRecipe: true // Помечаем, что блюдо добавлено из рецепта
    };
    
    // Сохраняем в localStorage
    localStorage.setItem("mealPlanData", JSON.stringify(updatedMealPlan));
    
    // Обновляем состояние
    updateData({ mealPlanData: updatedMealPlan });
    
    // Закрываем модальное окно выбора приема пищи
    setShowMealSelection(false);
    setSelectedRecipeForMeal(null);
    
    // Показываем уведомление
    alert(`Рецепт "${recipe.title}" добавлен в ${mealNames[mealIndex]} на сегодня!`);
  };

  // Функция для сохранения рецепта
  const saveRecipe = (recipe) => {
    // Проверяем, есть ли уже такой рецепт
    const isExisting = savedRecipes.some(r => r.title === recipe.title);
    
    if (!isExisting) {
      // Если тип не указан, определяем его
      if (!recipe.type) {
        recipe.type = determineRecipeType(recipe);
      }
      
      const updatedSavedRecipes = [...savedRecipes, recipe];
      setSavedRecipes(updatedSavedRecipes);
      
      // Если это был новый рецепт, удаляем его из списка новых
      setNewRecipes(prevRecipes => prevRecipes.filter(r => r.title !== recipe.title));
      
      // Сообщаем о успешном сохранении
      alert(`Рецепт "${recipe.title}" сохранен!`);
      return true;
    } else {
      alert(`Рецепт "${recipe.title}" уже сохранен!`);
      return false;
    }
  };

  // Функция для определения типа рецепта
  const determineRecipeType = (recipe) => {
    const title = recipe.title.toLowerCase();
    const ingredients = recipe.ingredients.join(' ').toLowerCase();
    
    if (title.includes('смузи') || title.includes('коктейл') || title.includes('шейк')) {
      return "smoothies";
    } else if (title.includes('суп') || ingredients.includes('бульон')) {
      return "soups";
    } else if (title.includes('завтрак') || title.includes('омлет') || title.includes('каша') || 
              title.includes('тост') || title.includes('яичниц')) {
      return "breakfast";
    } else if (title.includes('обед') || title.includes('паста') || title.includes('плов') || 
              title.includes('рис') || title.includes('картофель') || title.includes('мясо')) {
      return "lunch";
    } else if (title.includes('ужин') || title.includes('салат') || title.includes('запеканка')) {
      return "dinner";
    } else if (title.includes('перекус') || title.includes('снэк') || title.includes('бутерброд')) {
      return "snacks";
    } else if (title.includes('десерт') || title.includes('торт') || title.includes('печень') || 
              title.includes('сладк')) {
      return "desserts";
    } else if (title.includes('полдник') || title.includes('второй завтрак')) {
      return "second_breakfast";
    } else {
      return "other";
    }
  };

  // Функция для удаления сохраненного рецепта
  const removeRecipe = (recipeTitle) => {
    const updatedSavedRecipes = savedRecipes.filter(recipe => recipe.title !== recipeTitle);
    setSavedRecipes(updatedSavedRecipes);
    
    // Сохраняем в localStorage
    localStorage.setItem("savedRecipes", JSON.stringify(updatedSavedRecipes));
  };

  // Функция для обработки изменений в форме добавления рецепта
  const handleRecipeChange = (field, value) => {
    setNewRecipe(prevState => ({
      ...prevState,
      [field]: value
    }));
  };

  // Функция для обработки изменений ингредиентов
  const handleIngredientChange = (index, value) => {
    const updatedIngredients = [...newRecipe.ingredients];
    updatedIngredients[index] = value;
    setNewRecipe(prevState => ({
      ...prevState,
      ingredients: updatedIngredients
    }));
  };

  // Функция для добавления нового ингредиента
  const addIngredient = () => {
    setNewRecipe(prevState => ({
      ...prevState,
      ingredients: [...prevState.ingredients, ""]
    }));
  };

  // Функция для удаления ингредиента
  const removeIngredient = (index) => {
    if (newRecipe.ingredients.length <= 1) {
      // Если это последний ингредиент, не удаляем его
      return;
    }
    
    const updatedIngredients = [...newRecipe.ingredients];
    updatedIngredients.splice(index, 1);
    setNewRecipe(prevState => ({
      ...prevState,
      ingredients: updatedIngredients
    }));
  };

  // Расчет граммовки на основе калорий
  const estimateGramsFromCalories = (calories) => {
    // Очень примерная оценка: 1 грамм пищи ≈ 1-2 ккал в среднем
    // Используем коэффициент 1.5 для простоты
    return Math.round(calories / 1.5);
  };

  // Функция для сохранения нового рецепта
  const saveNewRecipe = () => {
    // Проверка на заполненность основных полей
    if (newRecipe.title.trim() === '') {
      alert('Пожалуйста, заполните название рецепта.');
      return;
    }
    
    if (newRecipe.instructions.trim() === '') {
      alert('Пожалуйста, добавьте инструкции по приготовлению.');
      return;
    }
    
    // Фильтруем пустые ингредиенты перед проверкой
    const filteredIngredients = newRecipe.ingredients.filter(ingredient => ingredient.trim() !== '');
    
    if (filteredIngredients.length === 0) {
      alert('Пожалуйста, добавьте хотя бы один ингредиент.');
      return;
    }
    
    const calories = parseInt(newRecipe.calories) || 0;
    const grams = parseInt(newRecipe.grams) || estimateGramsFromCalories(calories);
    
    // Если тип не выбран, автоматически определяем его
    const recipeType = newRecipe.type !== "other" ? 
      newRecipe.type : 
      determineRecipeType(newRecipe);
    
    const recipeToSave = {
      ...newRecipe,
      type: recipeType,
      ingredients: filteredIngredients,
      calories: calories,
      protein: parseInt(newRecipe.protein) || 0,
      fat: parseInt(newRecipe.fat) || 0,
      carbs: parseInt(newRecipe.carbs) || 0,
      grams: grams
    };
    
    // Сохраняем в список сохраненных рецептов
    const updatedSavedRecipes = [...savedRecipes, recipeToSave];
    setSavedRecipes(updatedSavedRecipes);
    
    // Сохраняем в localStorage
    localStorage.setItem("savedRecipes", JSON.stringify(updatedSavedRecipes));
    
    // Сбрасываем форму
    setNewRecipe({...emptyRecipeTemplate});
    
    // Закрываем форму
    setShowNewRecipeForm(false);
    alert('Рецепт успешно сохранен!');
  };

  // Функция для получения рецептов от Claude
  const regenerateRecipes = async (category = generatingCategory) => {
    const apiKey = localStorage.getItem("anthropic_api_key");
    if (!apiKey) {
      alert("Добавьте API ключ Anthropic в настройках");
      return;
    }

    setGeneratingCategory(category);
    setIsLoading(true);
    
    try {
      // Формируем запрос с учетом нелюбимых продуктов и категории
      const dislikedFoodsString = dislikedFoods.length > 0 
        ? `Не используй следующие продукты: ${dislikedFoods.join(", ")}.` 
        : "";
        
      const categoryDescription = getCategoryDescription(category);

      const response = await fetch("/claude", {
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
            max_tokens: 1500,
            messages: [
              {
                role: "user",
                content: `Ты - диетолог-повар, специализирующийся на здоровом наборе веса. Сгенерируй 10 разнообразных рецептов в категории "${categoryDescription}" для набора веса в следующем формате:

                1. Название рецепта (с эмодзи)
                2. Категория (pink или purple - для стилей)
                3. Ингредиенты (список с указанием граммовки для каждого ингредиента)
                4. Инструкции (детальные)
                5. Пищевая ценность: калории, белки, жиры, углеводы
                6. Общий вес готового блюда в граммах

                Рецепты должны быть:
                - Простыми в приготовлении (5-10 минут)
                - Высококалорийными (400-700 ккал)
                - Питательными и богатыми белком
                - Подходящими для категории "${categoryDescription}"
                
                ${dislikedFoodsString}
                
                Дай только рецепты без дополнительных пояснений. Генерируй ровно 10 различных рецептов.`
              }
            ]
          } 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ошибка: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content[0].text;
      
      // Парсим полученный контент
      const parsedRecipes = parseRecipesFromResponse(content);
      
      if (parsedRecipes.length > 0) {
        // Добавляем тип рецепта
        const typedRecipes = parsedRecipes.map(recipe => ({
          ...recipe,
          type: category
        }));
        
        // Сохраняем новые рецепты в состоянии (но не в saved)
        setNewRecipes(typedRecipes);
        
        // Обновляем активную категорию на только что сгенерированную
        setActiveCategory(category);
        
        // Сохраняем дату последней генерации
        localStorage.setItem("lastRecipesDate", new Date().toISOString());
        
        alert(`Сгенерировано ${typedRecipes.length} новых рецептов в категории "${mealTypeNames[category]}"!`);
      } else {
        alert("Не удалось сгенерировать рецепты. Попробуйте еще раз.");
      }
    } catch (error) {
      console.error("Ошибка при получении рецептов:", error);
      alert("Произошла ошибка при получении рецептов. Проверьте API ключ и подключение.");
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для получения описания категории
  const getCategoryDescription = (category) => {
    switch(category) {
      case "smoothies": return "смузи и коктейли";
      case "soups": return "супы";
      case "breakfast": return "завтраки";
      case "second_breakfast": return "вторые завтраки";
      case "snacks": return "перекусы и закуски";
      case "lunch": return "обеды";
      case "dinner": return "ужины";
      case "desserts": return "десерты";
      default: return "разные блюда";
    }
  };

  // Функция для парсинга ответа от Claude и создания объектов рецептов
  const parseRecipesFromResponse = (content) => {
    try {
      // Разделяем ответ на отдельные рецепты
      const recipeBlocks = content.split(/\d+\.\s+/).slice(1); // Пропускаем заголовок секции
      
      const parsedRecipes = [];
      
      for (const block of recipeBlocks) {
        const lines = block.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 5) continue;
        
        // Парсим название и эмодзи
        const titleMatch = lines[0].match(/(.*)/);
        const title = titleMatch ? titleMatch[1].trim() : "Неизвестный рецепт";
        
        // Определяем категорию
        const categoryLine = lines.find(line => line.toLowerCase().includes('pink') || line.toLowerCase().includes('purple'));
        const category = categoryLine && categoryLine.toLowerCase().includes('pink') ? "pink" : "purple";
        
        // Парсим ингредиенты
        const ingredientsStartIndex = lines.findIndex(line => 
          line.toLowerCase().includes('ингредиент') || line.includes('-'));
        let ingredientsEndIndex = lines.findIndex((line, index) => 
          index > ingredientsStartIndex && (line.toLowerCase().includes('инструкци') || line.toLowerCase().includes('приготовлени')));
        
        if (ingredientsEndIndex === -1) {
          ingredientsEndIndex = lines.findIndex((line, index) => 
            index > ingredientsStartIndex && line.toLowerCase().includes('калори'));
        }
        
        const ingredients = lines.slice(ingredientsStartIndex + 1, ingredientsEndIndex)
          .filter(line => line.trim() !== '')
          .map(line => line.replace(/^-|\*|\•/, '').trim());
        
        // Парсим инструкции
        const instructionsStartIndex = lines.findIndex(line => 
          line.toLowerCase().includes('инструкци') || line.toLowerCase().includes('приготовлени'));
        let instructionsEndIndex = lines.findIndex((line, index) => 
          index > instructionsStartIndex && (line.toLowerCase().includes('калори') || line.toLowerCase().includes('пищевая ценность')));
        
        if (instructionsEndIndex === -1) instructionsEndIndex = lines.length;
        
        const instructions = lines.slice(instructionsStartIndex + 1, instructionsEndIndex)
          .filter(line => line.trim() !== '')
          .join(' ');
        
        // Парсим пищевую ценность
        const nutritionLine = lines.find(line => 
          line.toLowerCase().includes('калори') || line.includes('ккал'));
        
        let calories = 500, protein = 20, fat = 20, carbs = 30, grams = 300;
        
        if (nutritionLine) {
          const caloriesMatch = nutritionLine.match(/(\d+)\s*ккал/);
          if (caloriesMatch) calories = parseInt(caloriesMatch[1]);
          
          const proteinMatch = nutritionLine.match(/белки\s*:?\s*(\d+)/i) || nutritionLine.match(/(\d+)\s*г\s*белк/i);
          if (proteinMatch) protein = parseInt(proteinMatch[1]);
          
          const fatMatch = nutritionLine.match(/жиры\s*:?\s*(\d+)/i) || nutritionLine.match(/(\d+)\s*г\s*жир/i);
          if (fatMatch) fat = parseInt(fatMatch[1]);
          
          const carbsMatch = nutritionLine.match(/углеводы\s*:?\s*(\d+)/i) || nutritionLine.match(/(\d+)\s*г\s*углевод/i);
          if (carbsMatch) carbs = parseInt(carbsMatch[1]);
        }
        
        // Парсим общий вес блюда
        const weightLine = lines.find(line => 
          line.toLowerCase().includes('вес') || line.toLowerCase().includes('грамм'));
        
        if (weightLine) {
          const weightMatch = weightLine.match(/(\d+)\s*г/);
          if (weightMatch) grams = parseInt(weightMatch[1]);
        } else {
          // Если вес не указан, рассчитываем примерно
          grams = estimateGramsFromCalories(calories);
        }
        
        parsedRecipes.push({
          title,
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
      
      return parsedRecipes.length > 0 ? parsedRecipes : [];
    } catch (error) {
      console.error("Ошибка при парсинге рецептов:", error);
      return [];
    }
  };

  // Получение списка текущих рецептов для отображения
  const getCurrentRecipes = () => {
    if (activeCategory === "saved") {
      return savedRecipes;
    } else if (newRecipes.length > 0 && newRecipes[0].type === activeCategory) {
      // Если новые рецепты соответствуют активной категории, показываем их
      return newRecipes;
    } else {
      // Иначе показываем сохраненные рецепты для данной категории
      return recipesByType[activeCategory] || [];
    }
  };

  // Рендер рецепта
  const renderRecipe = (recipe, index, isSaved = false) => (
    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      <div className={`bg-${recipe.category}-100 p-3 cursor-pointer flex justify-between items-center`}
           onClick={() => setShowRecipeDetails(showRecipeDetails === recipe.title ? null : recipe.title)}>
        <h3 className={`font-semibold text-${recipe.category}-700`}>
          {recipe.title}
        </h3>
        <div className="flex space-x-2">
          {!showRecipeDetails || showRecipeDetails !== recipe.title ? (
            <span className="text-sm text-gray-600">&#9660; Подробнее</span>
          ) : (
            <span className="text-sm text-gray-600">&#9650; Скрыть</span>
          )}
        </div>
      </div>
      
      {showRecipeDetails === recipe.title && (
        <div className="p-4">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-purple-700 mb-2">
              Ингредиенты:
            </h4>
            <ul className="text-sm list-disc pl-5">
              {recipe.ingredients.map((ingredient, idx) => (
                <li key={idx}>{ingredient}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-purple-700 mb-2">
              Приготовление:
            </h4>
            <p className="text-sm text-gray-700">
              {recipe.instructions}
            </p>
          </div>
          <div className="mt-3 flex justify-between">
            <div className="text-xs text-gray-600">
              Калории: ~{recipe.calories} ккал
            </div>
            <div className="text-xs text-gray-600">
              Белки: {recipe.protein}г | Жиры: {recipe.fat}г | Углеводы: {recipe.carbs}г
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-600">
            Примерный вес порции: {recipe.grams || estimateGramsFromCalories(recipe.calories)}г
          </div>
          <div className="mt-1 text-xs text-gray-600">
            Категория: {mealTypeNames[recipe.type || "other"]}
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600"
              onClick={() => openMealSelection(recipe)}
            >
              Добавить в план питания
            </button>
            {isSaved ? (
              <button
                className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600"
                onClick={() => removeRecipe(recipe.title)}
              >
                Удалить из сохраненных
              </button>
            ) : (
              <button
                className="px-3 py-1 bg-purple-500 text-white rounded-lg text-xs hover:bg-purple-600"
                onClick={() => saveRecipe(recipe)}
              >
                Сохранить рецепт
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Функция для очистки формы и открытия модального окна
  const handleOpenNewRecipeForm = () => {
    setNewRecipe({...emptyRecipeTemplate});
    setShowNewRecipeForm(true);
  };

  // Модальное окно выбора приема пищи
  const renderMealSelectionModal = () => {
    if (!showMealSelection || !selectedRecipeForMeal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-bold text-purple-600 mb-4">Выберите прием пищи</h3>
          
          <div className="space-y-3">
            {Object.entries(mealNames).map(([index, name]) => (
              <button
                key={index}
                className="w-full px-4 py-3 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-between hover:bg-purple-200"
                onClick={() => addToMealPlan(selectedRecipeForMeal, parseInt(index))}
              >
                <span className="font-medium">{name}</span>
                <span>→</span>
              </button>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              onClick={() => {
                setShowMealSelection(false);
                setSelectedRecipeForMeal(null);
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-purple-600">
            БЫСТРЫЕ РЕЦЕПТЫ ДЛЯ НАБОРА ВЕСА
          </h2>
          <div className="flex space-x-2">
            <button
              className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 flex items-center"
              onClick={handleOpenNewRecipeForm}
            >
              <span className="mr-1">➕</span> Добавить рецепт
            </button>
            {activeCategory !== "saved" && (
              <button
                className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 flex items-center"
                onClick={() => regenerateRecipes(activeCategory)}
                disabled={isLoading}
              >
                <span className="mr-1">{isLoading ? "..." : "🔄"}</span> Перегенерировать
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно для добавления нового рецепта */}
      {showNewRecipeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-purple-600 mb-4">Добавить новый рецепт</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название рецепта</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newRecipe.title}
                  onChange={(e) => handleRecipeChange('title', e.target.value)}
                  placeholder="Например: 🥤 СУПЕР-КАЛОРИЙНЫЙ СМУЗИ"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Цветовая схема</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newRecipe.category}
                    onChange={(e) => handleRecipeChange('category', e.target.value)}
                  >
                    <option value="pink">Розовый</option>
                    <option value="purple">Фиолетовый</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Тип блюда</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newRecipe.type}
                    onChange={(e) => handleRecipeChange('type', e.target.value)}
                  >
                    {Object.entries(mealTypeNames).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ингредиенты</label>
                {newRecipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                      value={ingredient}
                      onChange={(e) => handleIngredientChange(index, e.target.value)}
                      placeholder={`Ингредиент ${index + 1} (с указанием граммовки)`}
                    />
                    <button
                      className="ml-2 px-2 py-2 bg-red-100 text-red-700 rounded-md"
                      onClick={() => removeIngredient(index)}
                      disabled={newRecipe.ingredients.length <= 1}
                      type="button"
                    >
                      ✖
                    </button>
                  </div>
                ))}
                <button
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 mt-2"
                  onClick={addIngredient}
                  type="button"
                >
                  + Добавить ингредиент
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Приготовление</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="4"
                  value={newRecipe.instructions}
                  onChange={(e) => handleRecipeChange('instructions', e.target.value)}
                  placeholder="Опишите процесс приготовления..."
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Калории (ккал)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newRecipe.calories || ""}
                    onChange={(e) => {
                      const calories = parseInt(e.target.value) || 0;
                      handleRecipeChange('calories', calories);
                      
                      // Автоматически оцениваем граммовку, если она не установлена
                      if (!newRecipe.grams) {
                        handleRecipeChange('grams', estimateGramsFromCalories(calories));
                      }
                    }}
                    placeholder="Например: 450"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Вес порции (г)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newRecipe.grams || ""}
                    onChange={(e) => handleRecipeChange('grams', parseInt(e.target.value) || 0)}
                    placeholder="Например: 300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Белки (г)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newRecipe.protein || ""}
                    onChange={(e) => handleRecipeChange('protein', parseInt(e.target.value) || 0)}
                    placeholder="Например: 25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Жиры (г)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newRecipe.fat || ""}
                    onChange={(e) => handleRecipeChange('fat', parseInt(e.target.value) || 0)}
                    placeholder="Например: 20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Углеводы (г)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newRecipe.carbs || ""}
                    onChange={(e) => handleRecipeChange('carbs', parseInt(e.target.value) || 0)}
                    placeholder="Например: 45"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  onClick={() => setShowNewRecipeForm(false)}
                  type="button"
                >
                  Отмена
                </button>
                <button
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                  onClick={saveNewRecipe}
                  type="button"
                >
                  Сохранить рецепт
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно выбора приема пищи */}
      {renderMealSelectionModal()}

      {/* Навигация по категориям */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          className={`px-3 py-2 text-sm rounded-full ${
            activeCategory === "saved"
              ? "bg-purple-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setActiveCategory("saved")}
        >
          ⭐ Сохраненные рецепты
        </button>
        {Object.entries(mealTypeNames).map(([key, name]) => (
          key !== "other" && (
            <button
              key={key}
              className={`px-3 py-2 text-sm rounded-full ${
                activeCategory === key
                  ? "bg-purple-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setActiveCategory(key)}
            >
              {name}
            </button>
          )
        ))}
      </div>

      {/* Отображение рецептов выбранной категории */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-purple-700">
            {activeCategory === "saved" ? "Мои сохраненные рецепты" : mealTypeNames[activeCategory]}
          </h3>
          {activeCategory !== "saved" && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">
                {(activeCategory === newRecipes[0]?.type ? newRecipes.length : recipesByType[activeCategory]?.length) || 0} рецептов
              </span>
              <button
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
                onClick={() => regenerateRecipes(activeCategory)}
                disabled={isLoading}
              >
                {isLoading ? "Генерация..." : "Сгенерировать новые"}
              </button>
            </div>
          )}
        </div>
        
        {getCurrentRecipes().length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {getCurrentRecipes().map((recipe, index) => 
              renderRecipe(recipe, index, activeCategory === "saved")
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              {activeCategory === "saved" 
                ? "У вас пока нет сохраненных рецептов. Добавьте рецепт или сохраните из предложенных."
                : "В этой категории пока нет рецептов."}
            </p>
            {activeCategory !== "saved" && (
              <button
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                onClick={() => regenerateRecipes(activeCategory)}
                disabled={isLoading}
                type="button"
              >
                {isLoading ? "Генерация..." : "Сгенерировать рецепты"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;
