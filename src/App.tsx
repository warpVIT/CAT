import { useEffect } from "react";
import WeightGainSpreadsheet from "./WeightGainSpreadsheet.jsx";

// Расширим интерфейс Window
declare global {
  interface Window {
    saveDataToLocalStorage: (data: any) => void;
    initialAppData?: any;
  }
}

// Загрузка данных из localStorage
const loadDataFromLocalStorage = () => {
  try {
    const savedData = localStorage.getItem("weightGainAppData");
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error("Ошибка при загрузке данных:", error);
    return null;
  }
};

// Объявим глобальную функцию для сохранения
window.saveDataToLocalStorage = (data: any) => {
  try {
    localStorage.setItem("weightGainAppData", JSON.stringify(data));
    console.log("Данные успешно сохранены в localStorage");
  } catch (error) {
    console.error("Ошибка при сохранении данных:", error);
  }
};

function App() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("Сохраняем данные перед выходом...");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Загружаем данные и передаём глобально
  const initialData = loadDataFromLocalStorage();
  if (initialData) {
    window.initialAppData = initialData;
  }

  return (
    <div className="App">
      <WeightGainSpreadsheet />
    </div>
  );
}

export default App;
