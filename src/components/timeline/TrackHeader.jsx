import React from 'react';

// eslint-disable-next-line no-unused-vars
const TrackHeader = ({ icon: Icon, label, active, height = 96 }) => {
    return (
        <div 
            className={`border-b border-gray-800 flex flex-row items-center justify-start px-4 gap-2 transition-colors relative flex-shrink-0 w-24
            ${active ? 'bg-gray-800/50 text-gray-200' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'}`}
            style={{ height: `${height}px` }}
        >
            {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-medium text-left truncate">{label}</span>
        </div>
    );
};

export default TrackHeader;
