import React, { useState, useEffect } from "react";
import Section from "./common/Section";
import Cat from "./common/Cat";
import ProgressTracker from "./common/ProgressTracker";
import DonutChart from "./common/DonutChart";

const Dashboard = ({ data, updateData, setActiveTab }) => {
  const { weightData, mealPlanData, targetWeight, startWeight, height } = data;
  const currentWeight =
    weightData.length > 0
      ? weightData[weightData.length - 1].weight
      : startWeight;

  // Состояние для модального окна настроек
  const [showSettings, setShowSettings] = useState(false);
  const [newStartWeight, setNewStartWeight] = useState(startWeight || 45);
  const [newTargetWeight, setNewTargetWeight] = useState(targetWeight || 55);
  const [newHeight, setNewHeight] = useState(height || 170); // По умолчанию 170 см, если не задано
  const [newApiKey, setNewApiKey] = useState("");

  // Состояния для работы с Claude
  const [dailyAdvice, setDailyAdvice] = useState("");
  const [weightTrend, setWeightTrend] = useState("");
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  
  // Новое состояние для хранения максимальных значений БЖУ
  const [maxNutrients, setMaxNutrients] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0
  });

  // Загрузка максимальных значений БЖУ из localStorage
  useEffect(() => {
    const savedMaxNutrients = localStorage.getItem("maxNutrients");
    if (savedMaxNutrients) {
      try {
        const parsedMaxNutrients = JSON.parse(savedMaxNutrients);
        setMaxNutrients(parsedMaxNutrients);
      } catch (error) {
        console.error("Ошибка при загрузке максимальных значений БЖУ:", error);
      }
    }
  }, []);

  // Загрузка данных из localStorage при первом рендере
  useEffect(() => {
    // Загружаем сначала настройки дашборда
    const savedSettings = localStorage.getItem("dashboardSettings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        // Применяем настройки к состоянию компонента
        setNewStartWeight(parsedSettings.startWeight || 45);
        setNewTargetWeight(parsedSettings.targetWeight || 55);
        setNewHeight(parsedSettings.height || 170);

        // Обновляем глобальное состояние приложения
        const updateObject = {};
        if (parsedSettings.startWeight)
          updateObject.startWeight = parsedSettings.startWeight;
        if (parsedSettings.targetWeight)
          updateObject.targetWeight = parsedSettings.targetWeight;
        if (parsedSettings.height) updateObject.height = parsedSettings.height;

        // Обновляем только если есть что обновлять
        if (Object.keys(updateObject).length > 0) {
          updateData(updateObject);
        }
      } catch (error) {
        console.error("Ошибка при загрузке настроек:", error);
      }
    }

    // Получаем API ключ из localStorage
    const savedApiKey = localStorage.getItem("anthropic_api_key");
    if (savedApiKey) {
      setNewApiKey(savedApiKey);
    }

    // Проверяем, есть ли сохраненные данные в localStorage
    const savedData = localStorage.getItem("appData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData) {
          // Обновляем только те данные, которые присутствуют в сохраненной версии
          const updateObj = {};

          // Проверяем и добавляем все ключи, которые присутствуют в parsedData
          Object.keys(parsedData).forEach((key) => {
            if (parsedData[key] !== undefined) {
              updateObj[key] = parsedData[key];
            }
          });

          // Обновляем только если есть что обновлять
          if (Object.keys(updateObj).length > 0) {
            updateData(updateObj);
          }
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      }
    }

    // Загружаем сохраненные советы и тренды
    const lastAdvice = localStorage.getItem("lastAdvice");
    const lastTrend = localStorage.getItem("lastTrend");
    const lastAdviceDate = localStorage.getItem("lastAdviceDate");

    if (lastAdvice) setDailyAdvice(lastAdvice);
    else setDailyAdvice("Добавь арахисовую пасту в утреннюю овсянку для вкуса и дополнительных 100-200 ккал");

    if (lastTrend && weightData.length > 2) setWeightTrend(lastTrend);
    else if (weightData.length > 2) setWeightTrend("Твой вес стабильно растёт последние недели. Отличный прогресс!");
    else setWeightTrend("Добавь больше измерений веса в трекере, чтобы увидеть тренд.");

    // Проверяем, нужно ли обновить совет (раз в сутки)
    if (lastAdviceDate) {
      const lastDate = new Date(lastAdviceDate);
      const now = new Date();
      if ((now - lastDate) / (1000 * 60 * 60 * 24) >= 1) {
        generateAdvice();
        generateTrend();
      }
    }
    
    // Обновляем максимальные значения БЖУ при первой загрузке
    updateMaxNutrientsFromMealPlan();
  }, []);
  
  // Отслеживаем изменения в плане питания, чтобы обновлять максимальные значения БЖУ
  useEffect(() => {
    updateMaxNutrientsFromMealPlan();
  }, [mealPlanData]);

  // Сохраняем данные в localStorage каждый раз, когда они меняются
  useEffect(() => {
    localStorage.setItem("appData", JSON.stringify(data));
  }, [data]);

  // Синхронизация локального состояния с глобальным при его изменении
  useEffect(() => {
    setNewStartWeight(startWeight || 45);
    setNewTargetWeight(targetWeight || 55);
    setNewHeight(height || 170);
  }, [startWeight, targetWeight, height]);

  // Функция обновления максимальных значений БЖУ из плана питания
  const updateMaxNutrientsFromMealPlan = () => {
    if (!mealPlanData || typeof mealPlanData !== 'object') {
      return;
    }
    
    // Текущие максимальные значения
    const currMaxNutrients = { ...maxNutrients };
    let updated = false;
    
    // Проходим по всем дням недели (от 0 до 6)
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      if (!mealPlanData[dayIndex] || !Array.isArray(mealPlanData[dayIndex])) {
        continue;
      }
      
      // Проходим по всем приемам пищи этого дня
      mealPlanData[dayIndex].forEach(meal => {
        // Учитываем только выполненные приемы пищи (статус "completed")
        if (meal.status === "completed") {
          // Проверяем, превышают ли значения текущие максимумы
          if (meal.protein > currMaxNutrients.protein) {
            currMaxNutrients.protein = meal.protein;
            updated = true;
          }
          
          if (meal.fat > currMaxNutrients.fat) {
            currMaxNutrients.fat = meal.fat;
            updated = true;
          }
          
          if (meal.carbs > currMaxNutrients.carbs) {
            currMaxNutrients.carbs = meal.carbs;
            updated = true;
          }
          
          if (meal.calories > currMaxNutrients.calories) {
            currMaxNutrients.calories = meal.calories;
            updated = true;
          }
        }
      });
    }
    
    // Если были изменения, обновляем состояние и сохраняем в localStorage
    if (updated) {
      setMaxNutrients(currMaxNutrients);
      localStorage.setItem("maxNutrients", JSON.stringify(currMaxNutrients));
    }
  };

  // Функция для расчета ИМТ
  const calculateBMI = () => {
    if (!currentWeight || !height) return { value: 0, category: "Неизвестно" };

    const heightInMeters = height / 100;
    const bmi = currentWeight / (heightInMeters * heightInMeters);
    const roundedBMI = Math.round(bmi * 10) / 10;

    let category = "Неизвестно";
    if (bmi < 18.5) {
      category = "Недостаточный вес";
    } else if (bmi >= 18.5 && bmi < 25) {
      category = "Нормальный вес";
    } else if (bmi >= 25 && bmi < 30) {
      category = "Избыточный вес";
    } else {
      category = "Ожирение";
    }

    return { value: roundedBMI, category };
  };

  const bmiData = calculateBMI();

  // Функция для сохранения настроек
  const saveSettings = () => {
    const updatedSettings = {
      startWeight: parseFloat(newStartWeight),
      targetWeight: parseFloat(newTargetWeight),
      height: parseInt(newHeight),
    };

    // Сохраняем в localStorage
    localStorage.setItem("dashboardSettings", JSON.stringify(updatedSettings));

    // Сохраняем API ключ, если он был изменен
    if (newApiKey) {
      localStorage.setItem("anthropic_api_key", newApiKey);
    }

    // Обновляем данные в приложении
    updateData(updatedSettings);
    setShowSettings(false);
  };

  // Теперь функция calculateNutrients возвращает максимальные значения из состояния
  const calculateNutrients = () => {
    // Если в плане питания нет данных, используем данные из трекера веса
    if (maxNutrients.calories === 0 && weightData.length > 0) {
      const latestData = weightData[weightData.length - 1];
      return {
        calories: latestData.calories || 0,
        protein: latestData.protein || 0,
        fat: latestData.fat || 0,
        carbs: latestData.carbs || 0,
      };
    }

    return maxNutrients;
  };

  // Функция генерации совета с использованием API Claude
  const generateAdvice = async () => {
    const apiKey = localStorage.getItem("anthropic_api_key");
    if (!apiKey) {
      setDailyAdvice("Добавьте API ключ Anthropic в настройках");
      return;
    }

    setIsAdviceLoading(true);
    try {
      const response = await fetch("http://localhost:5001/claude", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          apiKey: localStorage.getItem("anthropic_api_key"), // <-- получаешь из настроек
          payload: {
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 150,
            messages: [
              {
                role: "user",
               content: "Ты - диетолог, специализирующийся на здоровом наборе веса. Дай короткий совет для набора веса (до 150 символов)."
              }
            ]
          } 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ошибка: ${response.status}`);
      }

      const data = await response.json();
      const adviceText = data.content[0].text;
      
      setDailyAdvice(adviceText);
      localStorage.setItem("lastAdvice", adviceText);
      localStorage.setItem("lastAdviceDate", new Date().toISOString());
    } catch (error) {
      console.error("Ошибка при получении совета:", error);
      let errorMessage = "Ошибка при получении совета.";

      if (error.message) {
        errorMessage += ` ${error.message}`;
      }

      setDailyAdvice(errorMessage);
    } finally {
      setIsAdviceLoading(false);
    }
  };

  // Функция генерации тренда с использованием API Claude
  const generateTrend = async () => {
    if (weightData.length < 3) {
      setWeightTrend(
        "Добавь больше измерений веса в трекере, чтобы увидеть тренд."
      );
      return;
    }

    const apiKey = localStorage.getItem("anthropic_api_key");
    if (!apiKey) {
      setWeightTrend("Добавьте API ключ Anthropic в настройках");
      return;
    }

    setIsAdviceLoading(true);
    try {
      const weightInfo = weightData.slice(-10).map((entry) => ({
        date: entry.date,
        weight: entry.weight,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 150,
          messages: [
            {
              role: "user",
              content: `Ты - диетолог, анализирующий вес. Проанализируй мои данные о весе и дай оценку тренда (до 150 символов): ${JSON.stringify(
                weightInfo
              )}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ошибка: ${response.status}`);
      }

      const data = await response.json();
      const trendText = data.content[0].text;
      
      setWeightTrend(trendText);
      localStorage.setItem("lastTrend", trendText);
      localStorage.setItem("lastTrendDate", new Date().toISOString());
    } catch (error) {
      console.error("Ошибка при анализе тренда:", error);
      setWeightTrend("Ошибка при анализе тренда. Проверьте API ключ.");
    } finally {
      setIsAdviceLoading(false);
    }
  };

  const nutrients = calculateNutrients();

  return (
    <div>
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-purple-600">
              КОТОМЯУТНЫЙ ПЛАН НАБОРА ВЕСА
            </h1>
            <p className="text-purple-500 italic">
              "Мой путь к силе, балансу и +60 кг"
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="px-3 py-1 bg-purple-200 text-purple-700 rounded-lg text-sm hover:bg-purple-300 flex items-center"
              onClick={() => setShowSettings(true)}
            >
              <span className="mr-1">⚙️</span> Настройки
            </button>
            <div className="flex space-x-2">
              <Cat size="md" mood="happy" />
              <Cat size="md" mood="love" crown={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно настроек */}
      {showSettings && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-5 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold text-purple-600 mb-4">
              Настройки
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Начальный вес (кг)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={newStartWeight}
                onChange={(e) => setNewStartWeight(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Целевой вес (кг)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={newTargetWeight}
                onChange={(e) => setNewTargetWeight(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Рост (см)
              </label>
              <input
                type="number"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={newHeight}
                onChange={(e) => setNewHeight(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API ключ Anthropic (для Claude)
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={newApiKey}
                placeholder="sk-ant-api03..."
                onChange={(e) => setNewApiKey(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Необходим для генерации советов. Получите на{" "}
                <a
                  href="https://console.anthropic.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  console.anthropic.com
                </a>
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                onClick={() => setShowSettings(false)}
              >
                Отмена
              </button>
              <button
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                onClick={saveSettings}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Прогресс мурчания к целевому весу" icon="🐱">
          <div className="px-4">
            <div className="mb-2">
              <span className="font-medium">Текущий вес:</span>{" "}
              <span className="text-purple-600 font-semibold">
                {currentWeight} кг
              </span>
            </div>
            {/* Исправлено - прогресс от стартового веса */}
            <ProgressTracker
              current={currentWeight}
              target={targetWeight}
              label="Прогресс к цели"
              color="bg-purple-400"
              startFrom={startWeight}
            />
            <div className="flex justify-between text-sm mb-4">
              <span>
                Осталось набрать:{" "}
                <b>{(targetWeight - currentWeight).toFixed(1)} кг</b>
              </span>
              <span>
                ИМТ: <b>{bmiData.value}</b> -{" "}
                <span className="text-purple-600">{bmiData.category}</span>
              </span>
            </div>
            <div className="mt-6">
              <div className="text-sm text-center mb-2">
                Милые котики растут вместе с тобой:
              </div>
              <div className="flex justify-between">
                <div className="text-center">
                  <Cat size="xs" mood="happy" />
                  <div className="text-xs mt-1">{startWeight} кг</div>
                </div>
                <div className="text-center">
                  <Cat size="sm" mood="happy" />
                  <div className="text-xs mt-1">
                    {(startWeight + (targetWeight - startWeight) / 3).toFixed(
                      1
                    )}{" "}
                    кг
                  </div>
                </div>
                <div className="text-center">
                  <Cat size="md" mood="happy" />
                  <div className="text-xs mt-1">
                    {(
                      startWeight +
                      ((targetWeight - startWeight) * 2) / 3
                    ).toFixed(1)}{" "}
                    кг
                  </div>
                </div>
                <div className="text-center">
                  <Cat size="lg" mood="love" crown={true} />
                  <div className="text-xs mt-1">{targetWeight} кг</div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Питательные вещества этой недели" icon="🥄">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <DonutChart
                percentage={
                  nutrients.protein > 0
                    ? Math.round((nutrients.protein / 100) * 100)
                    : 0
                }
                label="Белки"
                color="text-blue-400"
              />
              <div className="text-xs text-gray-600 mt-6">
                {nutrients.protein}/100г
              </div>
            </div>
            <div className="text-center">
              <DonutChart
                percentage={
                  nutrients.fat > 0 ? Math.round((nutrients.fat / 80) * 100) : 0
                }
                label="Жиры"
                color="text-pink-400"
              />
              <div className="text-xs text-gray-600 mt-6">
                {nutrients.fat}/80г
              </div>
            </div>
            <div className="text-center">
              <DonutChart
                percentage={
                  nutrients.carbs > 0
                    ? Math.round((nutrients.carbs / 300) * 100)
                    : 0
                }
                label="Углеводы"
                color="text-purple-400"
              />
              <div className="text-xs text-gray-600 mt-6">
                {nutrients.carbs}/300г
              </div>
            </div>
          </div>
          <div className="mt-4">
            <ProgressTracker
              current={nutrients.calories}
              target={2300}
              label="Калории"
              color="bg-pink-400"
              showCat={false}
            />
          </div>
        </Section>

        <Section title="Быстрый доступ" icon="✨">
          <div className="grid grid-cols-2 gap-4">
            <button
              className="p-3 bg-purple-100 rounded-lg text-purple-700 text-sm hover:bg-purple-200 flex items-center"
              onClick={() => setActiveTab("meal-plan")}
            >
              <span className="mr-2">🍽️</span> План питания на сегодня
            </button>
            <button
              className="p-3 bg-pink-100 rounded-lg text-pink-700 text-sm hover:bg-pink-200 flex items-center"
              onClick={() => setActiveTab("weight-tracker")}
            >
              <span className="mr-2">⚖️</span> Записать вес
            </button>
            <button
              className="p-3 bg-purple-100 rounded-lg text-purple-700 text-sm hover:bg-purple-200 flex items-center"
              onClick={() => setActiveTab("meal-plan")}
            >
              <span className="mr-2">🥄</span> Записать приём пищи
            </button>
            <button
              className="p-3 bg-pink-100 rounded-lg text-pink-700 text-sm hover:bg-pink-200 flex items-center"
              onClick={() => setActiveTab("products")}
            >
              <span className="mr-2">🧠</span> Идеи для перекуса
            </button>
          </div>
        </Section>

        <Section title="Статистика и советы" icon="📈">
          <div className="text-sm">
            <div className="mb-3 p-2 bg-purple-50 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium text-purple-700">💪 Совет дня:</div>
                <button
                  className="text-xs px-2 py-1 bg-purple-200 text-purple-700 rounded hover:bg-purple-300 flex items-center"
                  onClick={generateAdvice}
                  disabled={isAdviceLoading}
                >
                  {isAdviceLoading ? "..." : "🔄"}
                </button>
              </div>
              <p>{dailyAdvice}</p>
            </div>
            <div className="mb-3 p-2 bg-pink-50 rounded-lg">
              <div className="font-medium text-pink-700 mb-1">
                🌟 Достижение недели:
              </div>
              <p>
                {weightData.length > 1
                  ? `Ты набрала ${
                      weightData[weightData.length - 1].gain > 0
                        ? weightData[weightData.length - 1].gain
                        : 0
                    } кг за последнюю неделю!`
                  : "Добавь данные о весе в трекере, чтобы видеть прогресс!"}{" "}
                Продолжай в том же духе!
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium text-purple-700">📊 Тренд:</div>
                <button
                  className="text-xs px-2 py-1 bg-purple-200 text-purple-700 rounded hover:bg-purple-300 flex items-center"
                  onClick={generateTrend}
                  disabled={isAdviceLoading || weightData.length < 3}
                >
                  {isAdviceLoading ? "..." : "🔄"}
                </button>
              </div>
              <p>{weightTrend}</p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default Dashboard;