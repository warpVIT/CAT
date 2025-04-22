import React, { useState, useEffect } from "react";
import Section from "./common/Section";

const Habits = ({ data, updateData }) => {
  const { habitData } = data;
  const days = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
  const [newHabitName, setNewHabitName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Состояния для советов
  const [adviceList, setAdviceList] = useState([
    {
      title: "Добавляй калории, не объем",
      category: "purple",
      items: [
        "Добавляй орехи/семечки в салаты и кашу",
        "Используй сливки вместо молока",
        "Добавляй масло в готовые блюда"
      ]
    },
    {
      title: "Перекусывай умно",
      category: "pink",
      items: [
        "Держи калорийные снеки под рукой",
        "Пей смузи между основными приемами пищи",
        "Съедай что-то перед сном"
      ]
    },
    {
      title: "Тренируйся с умом",
      category: "purple",
      items: [
        "Делай силовые тренировки для наращивания мышц",
        "Ограничь кардио (много ходишь и так!)",
        "Ешь белок до и после тренировок"
      ]
    },
    {
      title: "Хитрости для увеличения калорий",
      category: "pink",
      items: [
        "Посыпай еду тертым сыром",
        "Используй соусы на основе сливок и масла",
        "Пей калорийные напитки"
      ]
    }
  ]);

  // Загрузка привычек из localStorage при первом рендере
  useEffect(() => {
    const savedHabits = localStorage.getItem("habitData");
    if (savedHabits) {
      try {
        const parsedHabits = JSON.parse(savedHabits);
        updateData({ habitData: parsedHabits });
      } catch (error) {
        console.error("Ошибка при загрузке привычек:", error);
      }
    }
    
    // Загрузка советов, если они уже были сгенерированы
    const savedAdvice = localStorage.getItem("generatedAdvice");
    if (savedAdvice) {
      try {
        const parsedAdvice = JSON.parse(savedAdvice);
        setAdviceList(parsedAdvice);
      } catch (error) {
        console.error("Ошибка при загрузке советов:", error);
      }
    }
  }, []);

  // Инициализация пустых привычек, если их нет
  const initialHabits = [];

  const habits = habitData.length > 0 ? habitData : initialHabits;

  // Переключение состояния привычки
  const toggleHabit = (habitIndex, dayIndex) => {
    const updatedHabits = [...habits];
    updatedHabits[habitIndex].checked[dayIndex] =
      !updatedHabits[habitIndex].checked[dayIndex];

    // Сохраняем в localStorage
    localStorage.setItem("habitData", JSON.stringify(updatedHabits));
    updateData({ habitData: updatedHabits });
  };

  // Добавление новой привычки
  const addNewHabit = (habitName) => {
    if (habitName.trim() !== "") {
      const newHabit = {
        name: habitName,
        checked: [false, false, false, false, false, false, false],
      };

      const updatedHabits = [...habits, newHabit];

      // Сохраняем в localStorage
      localStorage.setItem("habitData", JSON.stringify(updatedHabits));
      updateData({ habitData: updatedHabits });
      setNewHabitName("");
    }
  };

  // Удаление привычки
  const removeHabit = (index) => {
    const updatedHabits = [...habits];
    updatedHabits.splice(index, 1);

    // Сохраняем в localStorage
    localStorage.setItem("habitData", JSON.stringify(updatedHabits));
    updateData({ habitData: updatedHabits });
  };

  // Функция для получения советов от Claude
  const regenerateAdvice = async () => {
    const apiKey = localStorage.getItem("anthropic_api_key");
    if (!apiKey) {
      alert("Добавьте API ключ Anthropic в настройках");
      return;
    }

    setIsLoading(true);
    try {
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
                content: `Ты - диетолог, специализирующийся на здоровом наборе веса. Сгенерируй 4 категории полезных советов для набора веса, каждая категория должна содержать 3 конкретных совета.

                Формат должен быть следующим:
                1. Название категории
                2. Цвет категории (purple или pink - для стилей)
                3. Три конкретных совета (короткие, по 5-10 слов)

                Категории советов могут быть о питании, тренировках, режиме дня, психологии и других аспектах здорового набора веса.
                
                Советы должны быть:
                - Конкретными и практичными
                - Легко применимыми в повседневной жизни
                - Эффективными для набора веса
                - Полезными для здоровья
                
                Дай только советы без дополнительных пояснений.`
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
      const newAdvice = parseAdviceFromResponse(content);
      if (newAdvice.length > 0) {
        setAdviceList(newAdvice);
        localStorage.setItem("generatedAdvice", JSON.stringify(newAdvice));
      }
      
      localStorage.setItem("lastAdviceDate", new Date().toISOString());
    } catch (error) {
      console.error("Ошибка при получении советов:", error);
      alert("Произошла ошибка при получении советов. Проверьте API ключ и подключение.");
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для парсинга ответа от Claude и создания объектов с советами
  const parseAdviceFromResponse = (content) => {
    try {
      // Разделяем ответ на секции по числам с точкой
      const sections = content.split(/\d+\.\s+/).filter(section => section.trim() !== '');
      
      const parsedAdvice = [];
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const lines = section.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 4) continue; // Пропускаем секции с недостаточным количеством строк
        
        // Первая строка - название категории
        const title = lines[0].trim();
        
        // Определяем цвет (вторая строка или по умолчанию чередуем)
        let category = "purple";
        const colorLine = lines.find(line => line.toLowerCase().includes('pink') || line.toLowerCase().includes('purple'));
        
        if (colorLine) {
          category = colorLine.toLowerCase().includes('pink') ? "pink" : "purple";
        } else {
          category = i % 2 === 0 ? "purple" : "pink";
        }
        
        // Остальные строки - советы
        const itemLines = lines.filter(line => line.trim() !== '' && !line.toLowerCase().includes('pink') && !line.toLowerCase().includes('purple') && line !== title);
        
        // Берем первые три совета или меньше, если их меньше трех
        const items = itemLines.slice(0, 3).map(line => {
          // Удаляем маркеры списка, если они есть
          return line.replace(/^[-•*]\s*|\d+\.\s*/, '').trim();
        });
        
        if (items.length > 0) {
          parsedAdvice.push({
            title,
            category,
            items
          });
        }
      }
      
      return parsedAdvice.length > 0 ? parsedAdvice : [];
    } catch (error) {
      console.error("Ошибка при парсинге советов:", error);
      return [];
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-purple-600 mb-4">
          КОТО-ТРЕКЕР ПРИВЫЧЕК
        </h2>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-purple-700">
                Мои пушистые привычки
              </h3>
              <span className="text-sm text-gray-600">Неделя 18-24 апреля</span>
            </div>

            <table className="min-w-full border border-purple-200 rounded-lg overflow-hidden">
              <thead className="bg-purple-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-purple-700">
                    Привычка
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="px-2 py-2 text-center text-xs font-medium text-purple-700"
                    >
                      {day}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center text-xs font-medium text-purple-700">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {habits.map((habit, habitIdx) => (
                  <tr
                    key={habitIdx}
                    className={
                      habitIdx % 2 === 0 ? "bg-pink-50" : "bg-purple-50"
                    }
                  >
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {habit.name}
                    </td>
                    {habit.checked.map((checked, dayIdx) => (
                      <td key={dayIdx} className="px-2 py-2 text-center">
                        <div className="flex justify-center">
                          <div
                            className={`w-5 h-5 rounded ${
                              checked
                                ? "bg-purple-400 text-white"
                                : "bg-gray-200"
                            } flex items-center justify-center text-xs cursor-pointer`}
                            onClick={() => toggleHabit(habitIdx, dayIdx)}
                          >
                            {checked && "✓"}
                          </div>
                        </div>
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center">
                      <button
                        className="text-red-500 hover:text-red-700 text-xs"
                        onClick={() => removeHabit(habitIdx)}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100">
                  <td colSpan={9} className="px-4 py-2">
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="Добавить новую привычку"
                        className="border rounded px-2 py-1 w-full text-sm mr-2"
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addNewHabit(newHabitName);
                          }
                        }}
                      />
                      <button
                        className="bg-purple-500 text-white px-3 py-1 rounded text-xs"
                        onClick={() => addNewHabit(newHabitName)}
                      >
                        Добавить
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="План калорий и питательных веществ" icon="📝">
          <table className="min-w-full border border-purple-200 rounded-lg overflow-hidden">
            <thead className="bg-purple-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-purple-700">
                  Неделя
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-purple-700">
                  Калории
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-purple-700">
                  Белки
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-purple-700">
                  Жиры
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-purple-700">
                  Углеводы
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  week: "1-2 недели",
                  calories: 2200,
                  protein: "85-90г",
                  fat: "70-75г",
                  carbs: "275-300г",
                },
                {
                  week: "3-4 недели",
                  calories: 2300,
                  protein: "90-95г",
                  fat: "75-80г",
                  carbs: "290-310г",
                },
                {
                  week: "5-6 недель",
                  calories: 2400,
                  protein: "95-100г",
                  fat: "80-85г",
                  carbs: "300-320г",
                },
                {
                  week: "7-8 недель",
                  calories: 2500,
                  protein: "100-105г",
                  fat: "85-90г",
                  carbs: "310-330г",
                },
              ].map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-pink-50" : "bg-purple-50"}
                >
                  <td className="px-4 py-2 text-sm font-medium">{row.week}</td>
                  <td className="px-4 py-2 text-sm text-center">
                    {row.calories}
                  </td>
                  <td className="px-4 py-2 text-sm text-center">
                    {row.protein}
                  </td>
                  <td className="px-4 py-2 text-sm text-center">{row.fat}</td>
                  <td className="px-4 py-2 text-sm text-center">{row.carbs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Бонусные наклейки" icon="🌟">
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "Королева калорий", icon: "👑" },
              { name: "Пушистик недели", icon: "🐱" },
              { name: "Мастер протеина", icon: "💪" },
              { name: "Чемпион по привесу", icon: "🏆" },
              { name: "Звезда стабильности", icon: "🌟" },
              { name: "Гуру вкусняшек", icon: "🍰" },
              { name: "Силовая красотка", icon: "🏋️‍♀️" },
              { name: "Котик прогресса", icon: "📈" },
            ].map((sticker, idx) => (
              <div
                key={idx}
                className="bg-white border border-purple-200 rounded-lg p-3 flex items-center"
              >
                <span className="text-2xl mr-3">{sticker.icon}</span>
                <div>
                  <div className="text-sm font-medium">{sticker.name}</div>
                  <div className="text-xs text-gray-600">
                    Заработано: {idx < 3 ? "1 раз" : "0 раз"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-purple-600">
            Советы: как незаметно набрать вес и питаться здорово
          </h3>
          <button
            className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 flex items-center"
            onClick={regenerateAdvice}
            disabled={isLoading}
          >
            <span className="mr-1">{isLoading ? "..." : "🔄"}</span> Перегенерировать
          </button>
        </div>

        <Section title="Полезные советы" icon="💡">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adviceList.map((advice, index) => (
              <div key={index} className={`bg-${advice.category}-50 p-3 rounded-lg`}>
                <div className={`font-medium text-${advice.category}-700 mb-2`}>
                  {advice.title}
                </div>
                <ul className="text-sm">
                  {advice.items.map((item, idx) => (
                    <li key={idx} className="mb-1 flex items-start">
                      <span className={`w-4 h-4 mr-2 mt-1 text-${advice.category === 'purple' ? 'pink' : 'purple'}-500`}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
};

export default Habits;