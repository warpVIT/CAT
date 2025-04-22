import React, { useState, useEffect } from "react";
import Section from "./common/Section";

const Products = ({ data, updateData }) => {
  const { dislikedFoods = [], mealPlanData = {} } = data;
  const [newDislikedFood, setNewDislikedFood] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showProductRecipe, setShowProductRecipe] = useState(null);
  const [currentProductRecipes, setCurrentProductRecipes] = useState([]);
  
  // Состояния для хранения рекомендаций продуктов
  const [proteinFoods, setProteinFoods] = useState([
    "Курица (особенно бедра с кожей)",
    "Говядина",
    "Индейка",
    "Свинина",
    "Лосось и жирная рыба",
    "Яйца (целиком)",
    "Сыр твердых сортов",
    "Творог (полножирный)",
  ]);
  
  const [fatFoods, setFatFoods] = useState([
    "Авокадо",
    "Орехи (миндаль, грецкие, фундук)",
    "Семечки (тыквенные, подсолнечные)",
    "Оливковое масло",
    "Кокосовое масло",
    "Темный шоколад (70%+)",
    "Сливочное масло",
    "Жирная рыба (лосось, форель, сардины)",
  ]);
  
  const [carbFoods, setCarbFoods] = useState([
    "Овсянка",
    "Коричневый рис",
    "Картофель",
    "Макароны",
    "Сладкий картофель",
    "Цельнозерновой хлеб",
    "Киноа",
    "Бананы и другие фрукты",
  ]);
  
  const [sweetAlternatives, setSweetAlternatives] = useState([
    "Греческий йогурт с медом и орехами",
    "Смузи из бананов и арахисовой пасты",
    "Финики с ореховой пастой",
    "Овсяные батончики с сухофруктами",
    "Фруктовый салат с йогуртом и орехами",
    "Рисовый пудинг на кокосовом молоке",
    "Темный шоколад с орехами",
  ]);
  
  const [saltyAlternatives, setSaltyAlternatives] = useState([
    "Авокадо тост с яйцом",
    "Хумус с цельнозерновыми крекерами",
    "Гуакамоле с начос",
    "Сырная тарелка с орехами и сухофруктами",
    "Тост с сыром и помидорами",
    "Орехи, обжаренные с солью и специями",
    "Фаршированные яйца",
  ]);

  const [noMoodAlternatives, setNoMoodAlternatives] = useState([
    "Готовый протеиновый коктейль",
    "Орехи и сухофрукты",
    "Творожный десерт из магазина",
    "Банан с арахисовой пастой",
    "Готовые снеки из супермаркета",
    "Сыр и крекеры",
    "Заказать доставку",
  ]);

  const [moodBoostAlternatives, setMoodBoostAlternatives] = useState([
    "Темный шоколад (70%+)",
    "Бананы (содержат триптофан)",
    "Орехи (особенно грецкие и миндаль)",
    "Ягоды (клубника, черника, малина)",
    "Авокадо (богаты витамином B и фолиевой кислотой)",
    "Жирная рыба (содержит Омега-3)",
    "Теплый чай с медом",
  ]);

  // Список продуктов, для которых имеет смысл генерировать рецепты
  const cookableProducts = [
    "Курица", "Говядина", "Индейка", "Свинина", "Лосось", "жирная рыба", 
    "Картофель", "Коричневый рис", "Макароны", "Овсянка", "Киноа", "яйца",
    "Цельнозерновой хлеб", "Творог", "Сыр"
  ];

  // Объект для хранения рецептов для каждого продукта
  const [productRecipes, setProductRecipes] = useState({});

  // Загрузка нелюбимых продуктов и рецептов из localStorage при первом рендере
  useEffect(() => {
    const savedDislikedFoods = localStorage.getItem("dislikedFoods");
    if (savedDislikedFoods) {
      try {
        const parsedFoods = JSON.parse(savedDislikedFoods);
        updateData({ dislikedFoods: parsedFoods });
      } catch (error) {
        console.error("Ошибка при загрузке нелюбимых продуктов:", error);
      }
    }

    const savedProductRecipes = localStorage.getItem("productRecipes");
    if (savedProductRecipes) {
      try {
        const parsedRecipes = JSON.parse(savedProductRecipes);
        setProductRecipes(parsedRecipes);
      } catch (error) {
        console.error("Ошибка при загрузке рецептов продуктов:", error);
      }
    }
  }, []);

  // Добавление нелюбимого продукта
  const addDislikedFood = () => {
    if (
      newDislikedFood.trim() !== "" &&
      !dislikedFoods.includes(newDislikedFood.trim())
    ) {
      const updatedFoods = [...dislikedFoods, newDislikedFood.trim()];
      // Сохраняем в localStorage
      localStorage.setItem("dislikedFoods", JSON.stringify(updatedFoods));
      updateData({ dislikedFoods: updatedFoods });
      setNewDislikedFood("");
    }
  };

  // Удаление нелюбимого продукта
  const removeDislikedFood = (food) => {
    const updatedFoods = dislikedFoods.filter((item) => item !== food);
    // Сохраняем в localStorage
    localStorage.setItem("dislikedFoods", JSON.stringify(updatedFoods));
    updateData({ dislikedFoods: updatedFoods });
  };

  // Проверка, можно ли для этого продукта генерировать рецепт
  const isProductCookable = (product) => {
    return cookableProducts.some(cookableProduct => 
      product.toLowerCase().includes(cookableProduct.toLowerCase())
    );
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

  // Функция для получения рецепта продукта от Claude
  const getProductRecipe = async (product) => {
    // Проверяем, можно ли для этого продукта генерировать рецепт
    if (!isProductCookable(product)) {
      alert(`Для продукта "${product}" не требуется рецепт, его можно употреблять в готовом виде или в составе других блюд.`);
      return;
    }

    const apiKey = localStorage.getItem("anthropic_api_key");
    if (!apiKey) {
      alert("Добавьте API ключ Anthropic в настройках");
      return;
    }

    setIsLoading(true);
    try {
      // Формируем запрос с учетом нелюбимых продуктов
      const dislikedFoodsString = dislikedFoods.length > 0 
        ? `Избегай следующих продуктов: ${dislikedFoods.join(", ")}.` 
        : "";

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
            max_tokens: 800,
            messages: [
              {
                role: "user",
                content: `Ты - диетолог-повар, специализирующийся на здоровом наборе веса. Сгенерируй 1 полный и детальный рецепт с использованием продукта "${product}" для набора веса в следующем формате:

                Название рецепта (с эмодзи)
                Категория (pink или purple - для стилей)
                Ингредиенты (список с указанием граммовки для каждого ингредиента)
                Инструкции (детальные)
                Пищевая ценность: калории, белки, жиры, углеводы
                Общий вес готового блюда в граммах

                Рецепт должен быть:
                - Простым в приготовлении (5-10 минут)
                - Высококалорийным (400-700 ккал)
                - Питательным и богатым белком
                - С обязательным использованием "${product}" как основного ингредиента
                
                ${dislikedFoodsString}
                
                Дай только один подробный рецепт без дополнительных пояснений.`
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
      const recipes = parseRecipesFromResponse(content);
      
      if (recipes.length > 0) {
        // Сохраняем текущую выбранную категорию для отображения в модальном окне
        setCurrentProductRecipes(recipes);
        
        // Обновляем рецепты для продукта
        const updatedProductRecipes = { ...productRecipes };
        updatedProductRecipes[product] = recipes;
        
        setProductRecipes(updatedProductRecipes);
        localStorage.setItem("productRecipes", JSON.stringify(updatedProductRecipes));
        
        // Показываем окно с рецептами
        setShowProductRecipe(product);
      }
    } catch (error) {
      console.error("Ошибка при получении рецептов:", error);
      alert("Произошла ошибка при получении рецептов. Проверьте API ключ и подключение.");
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для парсинга ответа от Claude и создания объектов рецептов
  const parseRecipesFromResponse = (content) => {
    try {
      const parsedRecipes = [];
      
      // Делим контент на строки для анализа
      const lines = content.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length < 5) return [];
      
      // Парсим название и эмодзи
      const titleLine = lines[0].trim();
      
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
      
      let calories = 500, protein = 20, fat = 20, carbs = 30;
      
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
      
      const grams = estimateGramsFromIngredients(ingredients);
      
      const recipe = {
        title: titleLine,
        category,
        ingredients,
        instructions,
        calories,
        protein,
        fat,
        carbs,
        grams
      };
      
      // Добавляем только если есть все необходимые поля
      if (recipe.title && recipe.ingredients.length > 0 && recipe.instructions) {
        parsedRecipes.push(recipe);
      }
      
      return parsedRecipes;
    } catch (error) {
      console.error("Ошибка при парсинге рецептов:", error);
      return [];
    }
  };

  // Оценка веса готового блюда на основе ингредиентов
  const estimateGramsFromIngredients = (ingredients) => {
    // Пытаемся извлечь граммовку из ингредиентов
    let totalGrams = 0;
    
    ingredients.forEach(ingredient => {
      const gramMatch = ingredient.match(/(\d+)\s*г/);
      if (gramMatch) {
        totalGrams += parseInt(gramMatch[1]);
      }
      
      const mlMatch = ingredient.match(/(\d+)\s*мл/);
      if (mlMatch) {
        totalGrams += parseInt(mlMatch[1]); // 1мл ≈ 1г для простоты
      }
      
      const tbspMatch = ingredient.match(/(\d+)\s*ст\.л/);
      if (tbspMatch) {
        totalGrams += parseInt(tbspMatch[1]) * 15; // 1 ст.л. ≈ 15г
      }
      
      const tspMatch = ingredient.match(/(\d+)\s*ч\.л/);
      if (tspMatch) {
        totalGrams += parseInt(tspMatch[1]) * 5; // 1 ч.л. ≈ 5г
      }
    });
    
    // Если не удалось оценить, возвращаем примерный вес на основе калорий
    if (totalGrams < 100) {
      return 300; // Примерный вес одной порции
    }
    
    return totalGrams;
  };

  // Функция для сохранения рецепта
  const saveRecipeToSaved = (recipe) => {
    try {
      // Получаем текущие сохраненные рецепты
      const savedRecipes = JSON.parse(localStorage.getItem("savedRecipes") || "[]");
      
      // Проверяем, есть ли уже такой рецепт
      const isExisting = savedRecipes.some(r => r.title === recipe.title);
      
      if (!isExisting) {
        // Создаем копию рецепта с добавленным типом
        const recipeToSave = {
          ...recipe,
          // Определяем тип рецепта на основе названия или ингредиентов
          type: determineRecipeType(recipe)
        };
        
        const updatedSavedRecipes = [...savedRecipes, recipeToSave];
        localStorage.setItem("savedRecipes", JSON.stringify(updatedSavedRecipes));
        console.log("Рецепт сохранен:", recipeToSave);
        alert(`Рецепт "${recipe.title}" сохранен!`);
        return true;
      } else {
        alert(`Рецепт "${recipe.title}" уже сохранен!`);
        return false;
      }
    } catch (error) {
      console.error("Ошибка при сохранении рецепта:", error);
      alert("Произошла ошибка при сохранении рецепта. Попробуйте еще раз.");
      return false;
    }
  };

  // Функция для получения рекомендаций от Claude
  const regenerateProducts = async () => {
    const apiKey = localStorage.getItem("anthropic_api_key");
    if (!apiKey) {
      alert("Добавьте API ключ Anthropic в настройках");
      return;
    }

    setIsLoading(true);
    try {
      // Формируем запрос с учетом нелюбимых продуктов
      const dislikedFoodsString = dislikedFoods.length > 0 
        ? `Нелюбимые продукты: ${dislikedFoods.join(", ")}.` 
        : "";

      const response = await fetch("http://localhost:5001/claude", {
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
            max_tokens: 800,
            messages: [
              {
                role: "user",
                content: `Ты - диетолог, специализирующийся на здоровом наборе веса. Сгенерируй семь разных категорий продуктов в следующем формате:
                1. Белковые продукты (8 продуктов, в первую очередь мясо, рыба)
                2. Здоровые жиры (8 продуктов)
                3. Полезные углеводы (8 продуктов, включая крупы, макароны и т.д.)
                4. Альтернативы сладкому (7 продуктов)
                5. Альтернативы соленому (7 продуктов)
                6. Продукты, когда нет настроения готовить (7 продуктов, только готовые продукты)
                7. Продукты для поднятия настроения (7 продуктов, которые улучшают настроение)
                
                Продукты должны быть полезными, питательными и подходить для набора веса. ${dislikedFoodsString}
                Не используй продукты из списка нелюбимых. Дай только списки продуктов без дополнительных пояснений.`
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
      parseAndUpdateFoodLists(content);
      
      // Сохраняем в localStorage на будущее
      localStorage.setItem("lastProductsRecommendation", content);
      localStorage.setItem("lastProductsDate", new Date().toISOString());
    } catch (error) {
      console.error("Ошибка при получении рекомендаций:", error);
      alert("Произошла ошибка при получении рекомендаций. Проверьте API ключ и подключение.");
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для парсинга ответа от Claude и обновления состояний
  const parseAndUpdateFoodLists = (content) => {
    try {
      // Разделяем ответ на секции по числам с точкой
      const sections = content.split(/\d+\.\s+/).filter(section => section.trim() !== '');
      
      // Парсим каждую секцию
      if (sections.length >= 7) {
        // Белковые продукты
        const proteinSection = sections[0].split(/\n-|\n•|\n\*/).filter(item => item.trim() !== '');
        if (proteinSection.length > 0) {
          setProteinFoods(proteinSection.map(item => item.trim()));
        }
        
        // Здоровые жиры
        const fatSection = sections[1].split(/\n-|\n•|\n\*/).filter(item => item.trim() !== '');
        if (fatSection.length > 0) {
          setFatFoods(fatSection.map(item => item.trim()));
        }
        
        // Углеводы
        const carbSection = sections[2].split(/\n-|\n•|\n\*/).filter(item => item.trim() !== '');
        if (carbSection.length > 0) {
          setCarbFoods(carbSection.map(item => item.trim()));
        }
        
        // Альтернативы сладкому
        const sweetSection = sections[3].split(/\n-|\n•|\n\*/).filter(item => item.trim() !== '');
        if (sweetSection.length > 0) {
          setSweetAlternatives(sweetSection.map(item => item.trim()));
        }
        
        // Альтернативы соленому
        const saltySection = sections[4].split(/\n-|\n•|\n\*/).filter(item => item.trim() !== '');
        if (saltySection.length > 0) {
          setSaltyAlternatives(saltySection.map(item => item.trim()));
        }
        
        // Продукты, когда нет настроения
        const noMoodSection = sections[5].split(/\n-|\n•|\n\*/).filter(item => item.trim() !== '');
        if (noMoodSection.length > 0) {
          setNoMoodAlternatives(noMoodSection.map(item => item.trim()));
        }
        
        // Продукты для поднятия настроения
        const moodBoostSection = sections[6].split(/\n-|\n•|\n\*/).filter(item => item.trim() !== '');
        if (moodBoostSection.length > 0) {
          setMoodBoostAlternatives(moodBoostSection.map(item => item.trim()));
        }
      }
    } catch (error) {
      console.error("Ошибка при парсинге ответа:", error);
    }
  };

  // Функция для добавления рецепта в план питания
  const addRecipeToMealPlan = (recipe) => {
    // Получаем текущий день недели (0-6, где 0 - понедельник)
    const getCurrentDayOfWeek = () => {
      const today = new Date();
      // Получаем день недели (0 - воскресенье, 6 - суббота)
      let dayIndex = today.getDay();
      // Преобразуем в наш формат (0 - понедельник, 6 - воскресенье)
      return dayIndex === 0 ? 6 : dayIndex - 1;
    };

    const currentDay = getCurrentDayOfWeek();
    
    // Определяем время суток и соответствующий прием пищи
    const currentHour = new Date().getHours();
    let mealIndex = 0; // Завтрак по умолчанию
    
    if (currentHour >= 12 && currentHour < 15) mealIndex = 2; // Обед
    else if (currentHour >= 15 && currentHour < 18) mealIndex = 1; // Второй завтрак/полдник
    else if (currentHour >= 18) mealIndex = 3; // Ужин
    
    // Инициализация плана питания, если он пустой
    let updatedMealPlan = { ...mealPlanData };
    
    // Проверяем и инициализируем текущий день, если нужно
    if (!updatedMealPlan[currentDay] || !Array.isArray(updatedMealPlan[currentDay])) {
      updatedMealPlan[currentDay] = [
        { meal: "Завтрак", dish: "", calories: 0, protein: 0, fat: 0, carbs: 0, grams: 0, status: "pending", fromRecipe: false },
        { meal: "Второй завтрак", dish: "", calories: 0, protein: 0, fat: 0, carbs: 0, grams: 0, status: "pending", fromRecipe: false },
        { meal: "Обед", dish: "", calories: 0, protein: 0, fat: 0, carbs: 0, grams: 0, status: "pending", fromRecipe: false },
        { meal: "Ужин", dish: "", calories: 0, protein: 0, fat: 0, carbs: 0, grams: 0, status: "pending", fromRecipe: false }
      ];
    }
    
    // Добавляем рецепт в план питания
    updatedMealPlan[currentDay][mealIndex] = {
      ...updatedMealPlan[currentDay][mealIndex],
      dish: recipe.title,
      calories: recipe.calories,
      protein: recipe.protein || 0,
      fat: recipe.fat || 0,
      carbs: recipe.carbs || 0,
      grams: recipe.grams || Math.round(recipe.calories / 1.5), // Примерная оценка граммовки
      status: "pending",
      fromRecipe: true // Помечаем, что блюдо добавлено из рецепта
    };
    
    // Сохраняем в localStorage
    localStorage.setItem("mealPlanData", JSON.stringify(updatedMealPlan));
    
    // Обновляем состояние
    updateData({ mealPlanData: updatedMealPlan });
    
    // Показываем уведомление
    alert(`Рецепт "${recipe.title}" добавлен в план питания на сегодня!`);
  };

  // Рендер продукта с кнопкой
  const renderProduct = (product, index) => (
    <li key={index} className="mb-2 flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-lg mr-2">🐱</span>
        <span>{product}</span>
      </div>
      <div>
        {isProductCookable(product) && (
          <button
            className="px-2 py-1 bg-purple-200 text-purple-800 rounded-md text-xs hover:bg-purple-300"
            onClick={() => getProductRecipe(product)}
            disabled={isLoading}
          >
            {isLoading && showProductRecipe === product ? "..." : "Рецепт"}
          </button>
        )}
      </div>
    </li>
  );

  // Рендер модального окна с рецептами продукта
  const renderProductRecipeModal = () => {
    if (!showProductRecipe || currentProductRecipes.length === 0) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-purple-600">
              Рецепт с {showProductRecipe}
            </h3>
            <button
              className="text-gray-500 hover:text-gray-800 text-xl"
              onClick={() => setShowProductRecipe(null)}
            >
              ✖
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {currentProductRecipes.map((recipe, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={`bg-${recipe.category}-100 p-3`}>
                  <h3 className={`font-semibold text-${recipe.category}-700`}>
                    {recipe.title}
                  </h3>
                </div>
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
                    Примерный вес порции: {recipe.grams}г
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      className="px-3 py-1 bg-purple-500 text-white rounded-lg text-xs hover:bg-purple-600"
                      onClick={() => {
                        const saved = saveRecipeToSaved(recipe);
                        if (saved) {
                          // Если сохранение прошло успешно, можно обновить индикатор
                          console.log("Рецепт успешно сохранен");
                        }
                      }}
                    >
                      Сохранить рецепт
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
            ПОЛЕЗНЫЕ И КАЛОРИЙНЫЕ ПРОДУКТЫ
          </h2>
          <button
            className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 flex items-center"
            onClick={regenerateProducts}
            disabled={isLoading}
          >
            <span className="mr-1">{isLoading ? "..." : "🔄"}</span> Перегенерировать
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Section
          title="Белковые котики"
          icon="💪"
          className="border-l-4 border-blue-400"
        >
          <ul className="text-sm">
            {proteinFoods.map((item, idx) => renderProduct(item, idx))}
          </ul>
        </Section>

        <Section
          title="Здоровые жирные котики"
          icon="🧈"
          className="border-l-4 border-pink-400"
        >
          <ul className="text-sm">
            {fatFoods.map((item, idx) => renderProduct(item, idx))}
          </ul>
        </Section>

        <Section
          title="Углеводные котики"
          icon="🍚"
          className="border-l-4 border-purple-400"
        >
          <ul className="text-sm">
            {carbFoods.map((item, idx) => renderProduct(item, idx))}
          </ul>
        </Section>
      </div>

      <Section
        title="Нелюбимые продукты"
        icon="🙅‍♀️"
        className="mb-6 border-l-4 border-red-400"
      >
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <textarea
              className="border rounded px-3 py-2 mr-2 flex-grow"
              placeholder="Добавить нелюбимый продукт"
              value={newDislikedFood}
              onChange={(e) => setNewDislikedFood(e.target.value)}
              maxLength={255}
              rows={2}
            />
            <button
              className="bg-purple-500 text-white px-4 py-2 rounded"
              onClick={addDislikedFood}
            >
              Добавить
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Продукты, которые ты не любишь - они не будут предлагаться в планах
            питания
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {dislikedFoods.map((food, index) => (
            <div
              key={index}
              className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center"
            >
              {food}
              <button
                className="ml-2 text-red-700 hover:text-red-900"
                onClick={() => removeDislikedFood(food)}
              >
                ×
              </button>
            </div>
          ))}
          {dislikedFoods.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              Нет нелюбимых продуктов
            </p>
          )}
        </div>
      </Section>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-purple-600">
            ЧТО ЕСТЬ, ЕСЛИ
          </h3>
          <button
            className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 flex items-center"
            onClick={regenerateProducts}
            disabled={isLoading}
          >
            <span className="mr-1">{isLoading ? "..." : "🔄"}</span> Перегенерировать
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Section
            title="Хочется сладкого"
            icon="🍬"
            className="border-l-4 border-pink-400"
          >
            <ul className="text-sm">
              {sweetAlternatives.map((item, idx) => renderProduct(item, idx))}
            </ul>
          </Section>

          <Section
            title="Хочется жирного/соленого"
            icon="🧀"
            className="border-l-4 border-purple-400"
          >
            <ul className="text-sm">
              {saltyAlternatives.map((item, idx) => renderProduct(item, idx))}
            </ul>
          </Section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section
            title="Я устала — что съесть"
            icon="😴"
            className="border-l-4 border-orange-400"
          >
            <ul className="text-sm">
              {noMoodAlternatives.map((item, idx) => renderProduct(item, idx))}
            </ul>
          </Section>

          <Section
            title="Для поднятия настроения"
            icon="🌟"
            className="border-l-4 border-green-400"
          >
            <ul className="text-sm">
              {moodBoostAlternatives.map((item, idx) => renderProduct(item, idx))}
            </ul>
          </Section>
        </div>
      </div>

      {/* Модальное окно с рецептами продукта */}
      {renderProductRecipeModal()}
    </div>
  );
};

export default Products;
