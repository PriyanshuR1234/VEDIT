import React from 'react';

const Track = ({ track, zoom }) => {
    return (
        <div 
            className="border-b border-gray-800/50 relative group"
            style={{ height: `${track.height}px` }}
        >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#333_1px,transparent_1px)] opacity-20 pointer-events-none" style={{ backgroundSize: `${10 * zoom}px 100%` }} />
        </div>
    );
};

export default Track;
