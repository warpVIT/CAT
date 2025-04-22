import React, { createContext, useState, useContext } from 'react';

// Определяем тип для данных приложения
export interface AppData {
  weightData: any[];
  mealPlanData: any;
  habitData: any[];
  dislikedFoods: string[];
  targetWeight: number;
  startWeight: number;
  height?: number;
}

// Определяем тип для контекста
export interface AppContextType {
  data: AppData;
  updateData: (newData: Partial<AppData>) => void;
}

// Создаем начальное значение для контекста
const initialContextValue: AppContextType = {
  data: {
    weightData: [],
    mealPlanData: {},
    habitData: [],
    dislikedFoods: ["Оливки"],
    targetWeight: 60,
    startWeight: 46.2,
    height: 170
  },
  updateData: () => {} // Пустая функция-заглушка
};

// Создаем контекст с начальным значением
const AppContext = createContext<AppContextType>(initialContextValue);

// Хук для использования контекста
export const useAppData = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppProvider');
  }
  return context;
};

// Провайдер контекста
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(initialContextValue.data);

  const updateData = (newData: Partial<AppData>) => {
    setData(prevData => ({ ...prevData, ...newData }));
    
    // Сохраняем данные в localStorage
    localStorage.setItem("weightGainData", JSON.stringify({ ...data, ...newData }));
  };

  // Загружаем данные из localStorage при инициализации
  React.useEffect(() => {
    const savedData = localStorage.getItem("weightGainData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      }
    }
  }, []);

  return (
    <AppContext.Provider value={{ data, updateData }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;