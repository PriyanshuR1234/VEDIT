import React from 'react';
import TimelineRuler from './TimelineRuler';
import Track from './Track';
import Clip from './Clip';

const TimelineGrid = ({
    timelineWidth,
    zoom,
    tickInterval,
    tracks,
    clips,
    currentVideo,
    currentTime,
    onClipClick,
    onClipMouseDown,
    onClipResizeMouseDown,
    getTrackY
}) => {
    return (
        <div style={{ width: `${timelineWidth * zoom}px` }} className="min-h-full relative">
            <TimelineRuler timelineWidth={timelineWidth} tickInterval={tickInterval} zoom={zoom} />

            <div className="relative">
                {tracks.map(track => (
                    <Track key={`bg-${track.index}`} track={track} zoom={zoom} />
                ))}
            </div>

            {clips.map((clip) => {
                const isActive = currentVideo?.id === clip.id;
                const trackY = getTrackY(clip.trackIndex);
                return (
                    <Clip 
                        key={clip.id} 
                        clip={clip} 
                        zoom={zoom} 
                        isActive={isActive} 
                        trackY={trackY}
                        onClipClick={onClipClick}
                        onClipMouseDown={onClipMouseDown}
                        onClipResizeMouseDown={onClipResizeMouseDown}
                    />
                );
            })}

            <div 
                className="absolute top-0 bottom-0 left-0 w-[1px] bg-red-500 z-30 shadow-[0_0_10px_rgba(239,68,68,0.5)] pointer-events-none" 
                style={{ transform: `translateX(${(currentTime * 100) * zoom}px)` }}
            >
                <div className="absolute -top-1 -left-2 w-4 h-4 bg-red-500 rounded-sm shadow-sm flex items-center justify-center">
                    <div className="w-1 h-2 border-l border-r border-red-700/50" />
                </div>
            </div>
        </div>
    );
};

export default TimelineGrid;
