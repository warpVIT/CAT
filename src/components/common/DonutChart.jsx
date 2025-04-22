import React from 'react';

const DonutChart = ({ percentage, label, color }) => (
  <div className="relative w-24 h-24 mx-auto mb-2">
    <svg className="w-full h-full" viewBox="0 0 36 36">
      <path
        className="text-gray-200"
        strokeLinecap="round"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <path
        className={color}
        strokeLinecap="round"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray={`${percentage}, 100`}
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <text x="18" y="20.5" textAnchor="middle" className="text-xs font-semibold fill-purple-700">
        {percentage}%
      </text>
    </svg>
    {/* Исправлено - поднят текст, чтобы не заходил на круг */}
    <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-purple-700">
      {label}
    </div>
  </div>
);

export default DonutChart;