import React from "react";
import Cat from "./Cat";

const ProgressTracker = ({
  current,
  target,
  label,
  color = "bg-purple-400",
  showCat = true,
  startFrom = 0, // Начальное значение прогресса
}) => {
  // Расчет процента выполнения от стартового значения до целевого
  const total = target - startFrom;
  const completed = current - startFrom;
  const percentage =
    total > 0 ? Math.min(100, Math.max(0, (completed / total) * 100)) : 0;

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium">{percentage.toFixed(0)}%</span>
      </div>
      <div className="h-4 bg-gray-200 rounded-full relative">
        {/* Полоса прогресса */}
        <div
          className={`h-4 ${color} rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>

        {/* Котик, который соответствует проценту прогресса */}
        {showCat && (
          <div
            className="absolute bottom-full"
            style={{
              left: `${percentage}%`,
              transform: `translateX(-50%)`,
            }}
          >
            <Cat size="xs" mood={percentage >= 100 ? "love" : "happy"} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;
