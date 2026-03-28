import React from 'react';

const ActionButton = ({ icon, label }) => {
  const Icon = icon;
  return (
    <button className="w-full flex items-center gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-700 transition-all text-sm font-medium group">
      <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      {label}
    </button>
  );
};

export default ActionButton;
