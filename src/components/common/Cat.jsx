import React from 'react';

const Cat = ({ size = 'sm', mood = 'happy', crown = false }) => {
  const sizeClass = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }[size];
  
  return (
    <div className={`${sizeClass} relative flex items-center justify-center`}>
      {/* Базовая форма кота */}
      <div className="bg-white rounded-full w-full h-full flex items-center justify-center border border-gray-200 shadow-sm">
        <div className="text-center">
          {crown && <span className="text-yellow-400 absolute -top-2">👑</span>}
          <div className="cat-face">
            {mood === 'happy' && '😺'}
            {mood === 'love' && '😻'}
            {mood === 'sleepy' && '😸'}
            {mood === 'big' && '🐱'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cat;