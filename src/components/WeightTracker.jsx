import React, { useState, useEffect } from "react";
import Section from "./common/Section";

const WeightTracker = ({ data, updateData }) => {
  const { weightData, mealPlanData } = data;
  const [newWeightInput, setNewWeightInput] = useState("");
  const [newProteinInput, setNewProteinInput] = useState("");
  const [newFatInput, setNewFatInput] = useState("");
  const [newCarbsInput, setNewCarbsInput] = useState("");
  const [newCaloriesInput, setNewCaloriesInput] = useState("");

  // Загрузка данных из localStorage только при первоначальной загрузке
  useEffect(() => {
    const savedWeightData = localStorage.getItem("weightData");
    if (savedWeightData && weightData.length === 0) {
      try {
        const parsedData = JSON.parse(savedWeightData);
        updateData({ weightData: parsedData });
      } catch (error) {
        console.error("Ошибка при загрузке данных из localStorage:", error);
      }
    }
  }, []); // Пустой массив зависимостей для запуска только при монтировании

  // Функция для расчета БЖУ из плана питания за неделю
  const calculateWeeklyNutrients = () => {
    // Проверяем, что mealPlanData существует и является объектом
    if (!mealPlanData || typeof mealPlanData !== 'object') {
      return { calories: 0, protein: 0, fat: 0, carbs: 0 };
    }

    // Суммируем значения со всех дней
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let totalCalories = 0;

    // Проходим по всем дням (ключи 0-6)
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      if (mealPlanData[dayIndex] && Array.isArray(mealPlanData[dayIndex])) {
        // Проходим по всем приемам пищи текущего дня
        mealPlanData[dayIndex].forEach(meal => {
          // Учитываем только выполненные приемы пищи (статус "completed")
          if (meal.status === "completed") {
            totalProtein += meal.protein || 0;
            totalFat += meal.fat || 0;
            totalCarbs += meal.carbs || 0;
            totalCalories += meal.calories || 0;
          }
        });
      }
    }

    return {
      calories: totalCalories,
      protein: totalProtein,
      fat: totalFat,
      carbs: totalCarbs,
    };
  };

  // Добавление нового записи о весе, с автоматическим расчетом БЖУ из плана питания
  const addNewWeightEntry = () => {
    if (newWeightInput && !isNaN(newWeightInput)) {
      const weight = parseFloat(newWeightInput);

      // Определение прироста
      let gain = 0;
      if (weightData.length > 0) {
        const lastEntry = weightData[weightData.length - 1];
        gain = weight - lastEntry.weight;
      }

      // Определяем количество котиков на основе прогресса
      let cats = "";
      if (weight > 49.5) cats = "😺😺😺";
      else if (weight > 48.0) cats = "😺😺";
      else cats = "😺";

      // Получаем БЖУ из плана питания
      const nutrients = calculateWeeklyNutrients();

      const newEntry = {
        week:
          weightData.length > 0
            ? weightData[weightData.length - 1].week + 1
            : 1,
        weight: weight,
        gain: parseFloat(gain.toFixed(1)),
        calories: parseInt(newCaloriesInput) || nutrients.calories || 2200,
        protein: parseInt(newProteinInput) || nutrients.protein || 85,
        fat: parseInt(newFatInput) || nutrients.fat || 70,
        carbs: parseInt(newCarbsInput) || nutrients.carbs || 275,
        cat: cats,
      };

      const updatedData = [...weightData, newEntry];

      // Сохраняем в localStorage и обновляем состояние
      localStorage.setItem("weightData", JSON.stringify(updatedData));
      updateData({ weightData: updatedData });

      // Очистка полей ввода
      setNewWeightInput("");
      setNewProteinInput("");
      setNewFatInput("");
      setNewCarbsInput("");
      setNewCaloriesInput("");
    }
  };

  // Удаление записи о весе
  const removeWeightEntry = (week) => {
    const updatedData = weightData.filter((entry) => entry.week !== week);
    // Пересчитываем номера недель
    const recalculatedData = updatedData.map((entry, index) => ({
      ...entry,
      week: index + 1,
    }));

    // Сохраняем в localStorage и обновляем состояние
    localStorage.setItem("weightData", JSON.stringify(recalculatedData));
    updateData({ weightData: recalculatedData });
  };

  // Улучшенный график веса со скругленными линиями
  const renderWeightChart = () => {
    if (weightData.length < 2) {
      return (
        <div className="h-48 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-gray-400 italic text-sm">
            Добавьте как минимум 2 измерения веса, чтобы увидеть график
          </div>
        </div>
      );
    }

    const maxWeight = Math.max(...weightData.map((d) => d.weight)) + 0.5;
    const minWeight = Math.min(...weightData.map((d) => d.weight)) - 0.5;
    const range = maxWeight - minWeight;

    // Улучшенный стиль графика со скруглёнными линиями
    return (
      <div className="h-48 bg-white rounded-lg p-4 relative">
        {/* Фон графика */}
        <div className="absolute inset-0 p-4">
          {/* Горизонтальные линии */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <div
              key={percent}
              className="absolute w-full h-px bg-gray-200"
              style={{ top: `${percent}%` }}
            />
          ))}
        </div>

        {/* График */}
        <div className="absolute left-12 right-4 top-4 bottom-8">
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${weightData.length - 1} 1`}
            preserveAspectRatio="none"
          >
            <path
              d={`M0,${
                1 - (weightData[0].weight - minWeight) / range
              } ${weightData
                .slice(1)
                .map(
                  (entry, index) =>
                    `C${index + 0.5},${
                      1 - (weightData[index].weight - minWeight) / range
                    } ${index + 0.5},${
                      1 - (entry.weight - minWeight) / range
                    } ${index + 1},${1 - (entry.weight - minWeight) / range}`
                )
                .join(" ")}`}
              fill="none"
              stroke="#c084fc"
              strokeWidth="0.02"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {weightData.map((entry, index) => (
              <circle
                key={index}
                cx={index}
                cy={1 - (entry.weight - minWeight) / range}
                r="0.03"
                fill="#9c64a6"
                stroke="#ffffff"
                strokeWidth="0.01"
              />
            ))}
          </svg>
        </div>

        {/* Вертикальная ось */}
        <div className="absolute left-0 top-4 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-500">
          <span>{maxWeight.toFixed(1)}</span>
          <span>{((maxWeight + minWeight) / 2).toFixed(1)}</span>
          <span>{minWeight.toFixed(1)}</span>
        </div>

        {/* Горизонтальная ось */}
        <div className="absolute left-12 right-4 bottom-0 h-8 flex justify-between text-xs text-gray-500">
          {weightData.map((entry, index) => (
            <div key={index} className="flex flex-col items-center">
              <span>{entry.week}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-purple-600 mb-4">
          KОШАЧИЙ ТРЕКЕР ВЕСА
        </h2>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                  Неделя
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                  Вес(кг)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                  Прирост
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                  Каллории
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                  Белки (г)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                  Жиры (г)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                  Углеводы (г)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                  Котик
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {weightData.map((row) => (
                <tr
                  key={row.week}
                  className={row.week % 2 === 0 ? "bg-pink-50" : "bg-purple-50"}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    Нед {row.week}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.weight}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">
                    {row.gain > 0 ? "+" + row.gain : row.gain}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {row.calories}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {row.protein}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {row.fat}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {row.carbs}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {row.cat}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeWeightEntry(row.week)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  Нед {weightData.length > 0 ? weightData.length + 1 : 1}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Вес"
                    className="border rounded px-2 py-1 w-full text-sm"
                    value={newWeightInput}
                    onChange={(e) => setNewWeightInput(e.target.value)}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  Авто
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="number"
                    placeholder="Калории"
                    className="border rounded px-2 py-1 w-full text-sm"
                    value={newCaloriesInput}
                    onChange={(e) => setNewCaloriesInput(e.target.value)}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="number"
                    placeholder="Белки"
                    className="border rounded px-2 py-1 w-full text-sm"
                    value={newProteinInput}
                    onChange={(e) => setNewProteinInput(e.target.value)}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="number"
                    placeholder="Жиры"
                    className="border rounded px-2 py-1 w-full text-sm"
                    value={newFatInput}
                    onChange={(e) => setNewFatInput(e.target.value)}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="number"
                    placeholder="Углеводы"
                    className="border rounded px-2 py-1 w-full text-sm"
                    value={newCarbsInput}
                    onChange={(e) => setNewCarbsInput(e.target.value)}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  Авто
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    className="bg-purple-500 text-white px-3 py-1 rounded text-xs"
                    onClick={addNewWeightEntry}
                  >
                    Добавить
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Статистика прогресса" icon="📊">
          {renderWeightChart()}
        </Section>

        {/* Показываем достижения только если есть данные */}
        {weightData.length > 0 && (
          <Section title="Достижения" icon="🏆">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-pink-50 p-3 rounded-lg flex items-center">
                <span className="text-xl mr-2">🔥</span>
                <div>
                  <div className="text-sm font-medium text-pink-700">
                    Стабильный рост
                  </div>
                  <div className="text-xs text-gray-600">
                    {weightData.length} измерений
                  </div>
                </div>
              </div>
              {weightData.filter((d) => d.protein >= 95).length > 0 && (
                <div className="bg-purple-50 p-3 rounded-lg flex items-center">
                  <span className="text-xl mr-2">🥄</span>
                  <div>
                    <div className="text-sm font-medium text-purple-700">
                      Белковая королева
                    </div>
                    <div className="text-xs text-gray-600">
                      {weightData.filter((d) => d.protein >= 95).length} дней
                      &gt; 95г белка
                    </div>
                  </div>
                </div>
              )}
              {weightData.length > 1 && (
                <div className="bg-pink-50 p-3 rounded-lg flex items-center">
                  <span className="text-xl mr-2">⚡</span>
                  <div>
                    <div className="text-sm font-medium text-pink-700">
                      Рекордный прирост
                    </div>
                    <div className="text-xs text-gray-600">
                      +
                      {Math.max(
                        ...weightData
                          .map((d) => (d.gain > 0 ? d.gain : 0))
                          .filter(Boolean)
                      ).toFixed(1)}{" "}
                      кг за неделю
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

export default WeightTracker;