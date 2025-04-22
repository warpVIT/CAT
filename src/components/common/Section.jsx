import React from 'react';

const Section = ({ title, children, icon, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-4 mb-6 ${className}`}>
    <div className="flex items-center mb-4">
      <span className="mr-2">{icon}</span>
      <h3 className="text-lg font-semibold text-purple-700">{title}</h3>
    </div>
    {children}
  </div>
);

export default Section;