import React, { useRef, useEffect, useCallback } from 'react';
import { Video, Music, Type } from 'lucide-react';
import TimelineHeader from './timeline/TimelineHeader';
import TrackHeader from './timeline/TrackHeader';
import TimelineGrid from './timeline/TimelineGrid';

const Timeline = ({ 
    zoom, 
    setZoom, 
    clips, 
    currentVideo, 
    currentTime, 
    onClipClick, 
    onClipMouseDown,
    onClipResizeMouseDown,
    onSeek, 
    timelineRef,
    handleUploadClick,
    handleAudioUpload,
    onSplit,
    onDelete
}) => {
    const isDraggingPlayhead = useRef(false);

    const getTimelineWidth = () => {
        const maxEndPosition = clips.reduce((max, clip) => {
            const endPosition = clip.startPosition + (clip.duration * 100);
            return Math.max(max, endPosition);
        }, 0);

        const minWidth = (window.innerWidth / zoom) * 1.5; 
        return Math.max(minWidth, maxEndPosition + (window.innerWidth / zoom));
    };

    const timelineWidth = getTimelineWidth();

    const getTickInterval = () => {
        if (zoom < 0.2) return 30;
        if (zoom < 0.5) return 10;
        if (zoom < 1) return 5;
        if (zoom < 5) return 2;
        if (zoom < 10) return 1;
        return 0.5;
    };
    
    const tickInterval = getTickInterval();
    const pxPerSecond = 100 * zoom;

    const lastSeekTimeRef = useRef(0);

    const updatePlayheadPosition = useCallback((e, isClick = false) => {
        if (!timelineRef.current) return;
        
        const rect = timelineRef.current.getBoundingClientRect();
        const scrollLeft = timelineRef.current.scrollLeft;
        
        const rawX = e.clientX - rect.left + scrollLeft;
        const boundedX = Math.max(0, Math.min(rawX, timelineWidth * zoom));
        
        const newTime = boundedX / pxPerSecond;
        
        // Always seek immediately on mouse down (click)
        if (isClick) {
            onSeek(Math.max(0, newTime));
            lastSeekTimeRef.current = performance.now();
            return;
        }

        // Throttle during drag (~15fps)
        const now = performance.now();
        if (now - lastSeekTimeRef.current > 66) {
            onSeek(Math.max(0, newTime));
            lastSeekTimeRef.current = now;
        }
    }, [timelineRef, zoom, pxPerSecond, timelineWidth, onSeek]);

    const handleTimelineMouseDown = (e) => {
        if (!timelineRef.current) return;
        isDraggingPlayhead.current = true;
        updatePlayheadPosition(e, true);
    };

    const handleMouseMove = useCallback((e) => {
        if (isDraggingPlayhead.current) {
            updatePlayheadPosition(e);
        }
    }, [updatePlayheadPosition]);

    const handleMouseUp = useCallback(() => {
        isDraggingPlayhead.current = false;
    }, []);

    // Add trackpad pinch-to-zoom (wheel + ctrlKey) listener
    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                setZoom(prev => {
                    // Normalize zoom speed
                    const delta = e.deltaY;
                    const zoomFactor = delta > 0 ? 0.9 : 1.1; // scale down or up by 10%
                    const newZoom = prev * zoomFactor;
                    return Math.max(0.1, Math.min(newZoom, 20)); // bounds
                });
            }
        };

        const timelineEl = timelineRef.current;
        if (timelineEl) {
            timelineEl.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (timelineEl) {
                timelineEl.removeEventListener('wheel', handleWheel);
            }
        };
    }, [setZoom, timelineRef]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const videoClips = clips.filter(c => c.trackIndex >= 0);
    const maxOccupiedVideoTrack = videoClips.length > 0 ? Math.max(...videoClips.map(c => c.trackIndex)) : -1;
    const allowedMaxTrack = Math.max(0, clips.length - 1);
    const renderMaxTrack = Math.min(allowedMaxTrack, maxOccupiedVideoTrack + 1);

    const tracks = [];
    for (let i = 0; i <= renderMaxTrack; i++) {
        tracks.push({ index: i, label: `Video ${i + 1}`, icon: Video, height: 96 });
    }
    tracks.push({ index: -1, label: 'Audio', icon: Music, height: 40 });
    tracks.push({ index: -2, label: 'Text', icon: Type, height: 40 });

    const getTrackY = (trackIndex) => {
        let y = 32;
        for (const t of tracks) {
            if (t.index === trackIndex) {
                return y;
            }
            y += t.height;
        }
        return y;
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <TimelineHeader 
                zoom={zoom}
                setZoom={setZoom}
                currentVideo={currentVideo}
                onSplit={onSplit}
                onDelete={onDelete}
                handleUploadClick={handleUploadClick}
                handleAudioUpload={handleAudioUpload}
            />

            <div className="flex-1 flex overflow-hidden">
                <div className="w-24 bg-gray-900 border-r border-gray-800 flex flex-col z-20 flex-shrink-0">
                    <div className="h-8 border-b border-gray-800 bg-gray-900/50 flex-shrink-0" />
                    
                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar" 
                         onScroll={(e) => {
                             if (timelineRef.current) {
                                 timelineRef.current.scrollTop = e.target.scrollTop;
                             }
                         }}>
                        {tracks.map(track => (
                            <TrackHeader 
                                key={track.index}
                                icon={track.icon} 
                                label={track.label} 
                                active={currentVideo?.trackIndex === track.index} 
                                height={track.height}
                            />
                        ))}
                    </div>
                </div>

                <div 
                    ref={timelineRef}
                    className="flex-1 overflow-auto relative custom-scrollbar select-none"
                    onMouseDown={handleTimelineMouseDown}
                >
                    <TimelineGrid 
                        timelineWidth={timelineWidth}
                        zoom={zoom}
                        tickInterval={tickInterval}
                        tracks={tracks}
                        clips={clips}
                        currentVideo={currentVideo}
                        currentTime={currentTime}
                        onClipClick={onClipClick}
                        onClipMouseDown={onClipMouseDown}
                        onClipResizeMouseDown={onClipResizeMouseDown}
                        getTrackY={getTrackY}
                    />
                </div>
            </div>
        </div>
    );
};

export default Timeline;
