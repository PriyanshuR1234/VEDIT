import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Upload, Volume2, VolumeX, Maximize } from 'lucide-react';

const VideoPreview = ({
    currentVideo,
    videoRef,
    isPlaying,
    handlePlayPause,
    currentTime,
    duration,
    handleUploadClick,
    seek,
    clips = [],
    onUpdateTextClip,
    onUpdateClip
}) => {
    const [draggedTextId, setDraggedTextId] = useState(null);
    const [dragStart, setDragStart] = useState(null);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Filter text clips that should be visible at current time
    const visibleTextClips = clips.filter(clip => 
        clip.type === 'text' && 
        (clip.startPosition / 100) <= currentTime && 
        ((clip.startPosition / 100) + clip.duration) >= currentTime
    );

    const handleTextMouseDown = (e, clip) => {
        // Prevent event from bubbling up to video click handler (which toggles play/pause)
        e.stopPropagation();
        
        // Use the relative position within the container to avoid immediate snapping
        setDraggedTextId(clip.id);
        setDragStart({
            x: e.clientX,
            y: e.clientY,
            initialClipX: clip.x || 50,
            initialClipY: clip.y || 50
        });
    };

    const handleTextMouseMove = (e) => {
        if (!draggedTextId || !dragStart || !onUpdateTextClip) return;

        // Container dimensions
        const container = e.currentTarget;
        const rect = container.getBoundingClientRect();

        // Calculate delta in pixels
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        // Convert delta to percentages
        const deltaXPercent = (deltaX / rect.width) * 100;
        const deltaYPercent = (deltaY / rect.height) * 100;

        // Calculate new position
        let newX = dragStart.initialClipX + deltaXPercent;
        let newY = dragStart.initialClipY + deltaYPercent;

        // Constrain to container (0-100%)
        newX = Math.max(0, Math.min(100, newX));
        newY = Math.max(0, Math.min(100, newY));

        onUpdateTextClip(draggedTextId, { x: newX, y: newY });
    };

    const handleTextMouseUp = () => {
        setDraggedTextId(null);
        setDragStart(null);
    };

    const handleToggleMute = (e) => {
        e.stopPropagation();
        if (currentVideo && currentVideo.type === 'video' && onUpdateClip) {
            onUpdateClip(currentVideo.id, { muted: !currentVideo.muted });
        }
    };

    return (
        <div className="flex-1 bg-black flex items-center justify-center p-4 relative overflow-hidden">
            <div
                className="relative aspect-video bg-gray-900 shadow-2xl overflow-hidden group max-h-full max-w-full"
                onMouseMove={handleTextMouseMove}
                onMouseUp={handleTextMouseUp}
                onMouseLeave={handleTextMouseUp}
            >
                {currentVideo ? (
                    currentVideo.type === 'image' ? (
                        <img
                            src={currentVideo.url}
                            className="w-full h-full object-contain"
                            alt="Preview"
                        />
                    ) : (
                        <video
                            ref={videoRef}
                            src={currentVideo.url}
                            className="w-full h-full object-contain"
                            onClick={handlePlayPause}
                            muted={currentVideo.muted || false}
                        />
                    )
                ) : (
                    <div 
                        className="w-full h-full flex flex-col items-center justify-center border border-gray-800 rounded-2xl cursor-pointer hover:bg-gray-800/20 transition-colors"
                        onClick={handleUploadClick}
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="p-5 bg-gray-800 rounded-full mb-4 hover:scale-110 transition-transform duration-300 shadow-xl relative z-10">
                            <Upload className="w-8 h-8 text-gray-400 hover:text-white" />
                        </div>
                        <p className="text-sm font-medium text-gray-500 relative z-10">Import a video to start editing</p>
                    </div>
                )}

                {/* Render Text Overlays */}
                {visibleTextClips.map(clip => (
                    <div
                        key={clip.id}
                        className={`absolute cursor-move px-4 py-2 rounded-lg border-2 ${draggedTextId === clip.id ? 'border-indigo-500 bg-black/40' : 'border-transparent hover:border-white/50 bg-transparent'} transition-colors whitespace-nowrap z-50`}
                        style={{
                            left: `${clip.x || 50}%`,
                            top: `${clip.y || 50}%`,
                            transform: 'translate(-50%, -50%)',
                            color: clip.color || '#ffffff',
                            fontSize: `${clip.fontSize || 48}px`,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                            userSelect: 'none'
                        }}
                        onMouseDown={(e) => handleTextMouseDown(e, clip)}
                    >
                        {clip.text}
                    </div>
                ))}

                {/* Controls Overlay */}
                {clips.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-50">
                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-4">
                                <button onClick={handlePlayPause} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                </button>
                                <span className="font-mono text-sm">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                {currentVideo && currentVideo.type === 'video' && (
                                    <button 
                                        onClick={handleToggleMute}
                                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                        title={currentVideo.muted ? "Unmute" : "Mute"}
                                    >
                                        {currentVideo.muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                    </button>
                                )}
                                <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                    <Maximize className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoPreview;
