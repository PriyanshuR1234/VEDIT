import React from 'react';

const ToolButton = ({ icon, label, variant = 'default' }) => {
  const Icon = icon;
  return (
    <button className={`
      flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all group
      ${variant === 'active' 
        ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' 
        : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white hover:border-gray-700'}
    `}>
      <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

export default ToolButton;
