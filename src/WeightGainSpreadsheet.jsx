import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import WeightTracker from "./components/WeightTracker";
import MealPlan from "./components/MealPlan";
import Products from "./components/Products";
import Recipes from "./components/Recipes";
import Habits from "./components/Habits";
import CatChat from "./components/CatChat"; // Импорт CatChat

const WeightGainSpreadsheet = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [saveNotification, setSaveNotification] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [data, setData] = useState({
    weightData: [],
    mealPlanData: {},
    habitData: [],
    dislikedFoods: ["Оливки"],
    targetWeight: 60,
    startWeight: 46.2,
  });

  // Обновление данных + авто-сохранение
  const updateData = (newData) => {
    setData((prevData) => {
      const updatedData = { ...prevData, ...newData };
      localStorage.setItem("weightGainData", JSON.stringify(updatedData));
      return updatedData;
    });
    triggerSaveNotification();
  };

  // Уведомление о сохранении
  const triggerSaveNotification = () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    const timeout = setTimeout(() => {
      setSaveNotification(true);
      setTimeout(() => setSaveNotification(false), 1500);
    }, 500);
    setSaveTimeout(timeout);
  };

  // Загрузка данных из localStorage
  useEffect(() => {
    const loadData = () => {
      const savedData = localStorage.getItem("weightGainData");
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);

          // Миграция структуры плана питания
          if (Array.isArray(parsedData.mealPlanData)) {
            parsedData.mealPlanData = {
              0: parsedData.mealPlanData,
              1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
            };
          }

          if (!parsedData.targetWeight) parsedData.targetWeight = 60;
          if (!parsedData.startWeight) {
            parsedData.startWeight = parsedData.weightData.length > 0
              ? parsedData.weightData[0].weight
              : 46.2;
          }

          setData(parsedData);
        } catch (error) {
          console.error("Ошибка при загрузке данных:", error);
        }
      }
      setIsLoaded(true);
    };

    loadData();
  }, []);

  // Компонент таба
  const TabButton = ({ id, label, icon }) => (
    <button
      className={`flex items-center px-4 py-2 rounded-t-lg border-b-2 ${
        activeTab === id
          ? "bg-purple-100 border-purple-400 text-purple-700 font-semibold"
          : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-purple-50"
      }`}
      onClick={() => setActiveTab(id)}
    >
      <span className="mr-1">{icon}</span>
      {label}
    </button>
  );

  // Таб-панель
  const renderTabs = () => (
    <div className="flex space-x-1 mb-4 border-b border-gray-200">
      <TabButton id="dashboard" label="Дашборд" icon="📊" />
      <TabButton id="weight-tracker" label="Трекер веса" icon="⚖️" />
      <TabButton id="meal-plan" label="План питания" icon="🍽️" />
      <TabButton id="products" label="Продукты" icon="🥑" />
      <TabButton id="recipes" label="Рецепты" icon="🍲" />
      <TabButton id="habits" label="Привычки" icon="📝" />
      <TabButton id="catchat" label="Кошачий ИИ" icon="😺" />
    </div>
  );

  // Контент по активной вкладке
  const renderActiveTab = () => {
    if (!isLoaded) return null;

    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            data={data}
            updateData={updateData}
            setActiveTab={setActiveTab}
          />
        );
      case "weight-tracker":
        return <WeightTracker data={data} updateData={updateData} />;
      case "meal-plan":
        return <MealPlan data={data} updateData={updateData} />;
      case "products":
        return <Products data={data} updateData={updateData} />;
      case "recipes":
        return <Recipes data={data} updateData={updateData} />; {/* Добавлены пропсы */}
      case "habits":
        return <Habits data={data} updateData={updateData} />;
      case "catchat":
        return <CatChat data={data} updateData={updateData} />; {/* Добавлены пропсы для совместимости */}
      default:
        return (
          <Dashboard
            data={data}
            updateData={updateData}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  // Компонент уведомления
  const SaveNotification = () => (
    <div
      className={`fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transform transition-transform ${
        saveNotification
          ? "translate-y-0 opacity-100"
          : "translate-y-10 opacity-0"
      }`}
    >
      <div className="flex items-center">
        <span className="mr-2">✅</span>
        <span>Данные сохранены</span>
      </div>
    </div>
  );

  return (
    <div className="bg-purple-50 p-4 font-sans">
      {renderTabs()}
      {renderActiveTab()}
      <div className="mt-8 text-center text-sm text-purple-500">
        <p>"Мой путь к силе, балансу и +60 кг" 💪🐱</p>
      </div>
      <SaveNotification />
    </div>
  );
};

export default WeightGainSpreadsheet;