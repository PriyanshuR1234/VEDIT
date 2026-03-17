import React from 'react';

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00:00';
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

const TimelineRuler = ({ timelineWidth, tickInterval, zoom }) => {
    return (
        <div className="h-8 border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10">
            {Array.from({ length: Math.ceil(timelineWidth / (100 * tickInterval)) }).map((_, i) => (
                <div
                    key={i}
                    className="absolute top-0 bottom-0 border-l border-gray-700 text-[10px] text-gray-500 pl-1 pt-1 font-mono"
                    style={{ left: `${i * 100 * tickInterval * zoom}px` }}
                >
                    {formatTime(i * tickInterval)}
                </div>
            ))}
        </div>
    );
};

export default TimelineRuler;
