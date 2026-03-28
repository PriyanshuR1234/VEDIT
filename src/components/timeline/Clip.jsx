import React from 'react';
import Filmstrip from './Filmstrip';
import AudioWaveform from './AudioWaveform';

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00:00';
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

const Clip = ({ clip, zoom, isActive, trackY, onClipClick, onClipMouseDown, onClipResizeMouseDown }) => {
    const clipWidth = clip.duration * 100;
    const clipHeight = clip.trackIndex >= 0 ? 80 : (clip.type === 'audio' ? 32 : 24);

    return (
        <div
            className={`absolute rounded-lg cursor-pointer group shadow-lg overflow-hidden transition-all
                ${isActive ? 'ring-2 ring-indigo-500 z-10' : 'hover:ring-1 hover:ring-gray-400 z-0'}`}
            style={{
                left: `${clip.startPosition * zoom}px`,
                width: `${clipWidth * zoom}px`,
                top: `${trackY + 8}px`,
                height: `${clipHeight}px`,
                backgroundColor: isActive ? '#4f46e5' : 
                               (clip.type === 'text' ? '#1e1b4b' : 
                               (clip.type === 'image' ? '#14532d' : '#374151')),
                borderLeft: `4px solid ${clip.type === 'text' ? '#818cf8' : (clip.type === 'image' ? '#4ade80' : '#6366f1')}`
            }}
            onMouseDown={(e) => onClipMouseDown(e, clip)}
            onClick={(e) => {
                e.stopPropagation();
                onClipClick(clip.id);
            }}
        >
            {clip.type === 'video' && (
                <Filmstrip videoUrl={clip.url} duration={clip.duration} width={clipWidth * zoom} videoOffset={clip.videoOffset} />
            )}
            {clip.type === 'audio' && (
                <AudioWaveform audioUrl={clip.url} duration={clip.duration} width={clipWidth * zoom} height={clipHeight} />
            )}
            <div className={`px-2 ${clipHeight <= 32 ? 'py-0.5' : 'py-2'} h-full flex flex-col ${clipHeight <= 32 ? 'justify-center' : 'justify-between'} relative z-10 ${clip.type === 'video' ? 'bg-gradient-to-r from-black/50 to-transparent' : ''}`}>
                <span className={`${clipHeight <= 32 ? 'text-[10px]' : 'text-xs'} font-bold truncate text-white drop-shadow-md`}>
                    {clip.type === 'text' ? `"${clip.text}"` : clip.name}
                </span>
                {clipHeight > 32 && (
                    <span className="text-[10px] text-gray-300 font-mono drop-shadow-md">
                        {formatTime(clip.duration)}
                    </span>
                )}
            </div>
            {/* Drag Handles */}
            <div 
                className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/50 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-20" 
                onMouseDown={(e) => {
                    if (onClipResizeMouseDown) onClipResizeMouseDown(e, clip, 'left');
                }}
            />
            <div 
                className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/50 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-20" 
                onMouseDown={(e) => {
                    if (onClipResizeMouseDown) onClipResizeMouseDown(e, clip, 'right');
                }}
            />
        </div>
    );
};

export default Clip;
