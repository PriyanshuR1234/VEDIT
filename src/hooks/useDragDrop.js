import { useState, useCallback, useEffect } from 'react';

export const useDragDrop = (clips, setClips, zoom, timelineRef) => {
    const [draggedClip, setDraggedClip] = useState(null);
    const [resizeHandle, setResizeHandle] = useState(null);
    const [dragOffset, setDragOffset] = useState(0);

    const handleClipMouseDown = useCallback((e, clip) => {
        e.stopPropagation();
        setDraggedClip(clip);
        setResizeHandle(null);
        
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset(e.clientX - rect.left);
    }, []);

    const handleResizeMouseDown = useCallback((e, clip, handle) => {
        e.stopPropagation();
        setDraggedClip(clip);
        setResizeHandle(handle);
        setDragOffset(e.clientX);
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!draggedClip || !timelineRef.current) return;

        if (resizeHandle) {
            const deltaX = e.clientX - dragOffset;
            const timeDelta = deltaX / (100 * zoom);
            
            setClips(prevClips => prevClips.map(clip => {
                if (clip.id !== draggedClip.id) return clip;
                
                let newStart = clip.startPosition;
                let newDuration = clip.duration;
                let newOffset = clip.videoOffset || 0;
                
                if (resizeHandle === 'left') {
                    const maxDelta = clip.duration;
                    const boundedDelta = Math.max(-clip.startPosition / 100, Math.min(timeDelta, maxDelta - 0.1));
                    
                    newStart = clip.startPosition + (boundedDelta * 100);
                    newDuration = clip.duration - boundedDelta;
                    newOffset = Math.max(0, clip.videoOffset + boundedDelta);
                } else if (resizeHandle === 'right') {
                    const boundedDelta = Math.max(-clip.duration + 0.1, timeDelta);
                    newDuration = clip.duration + boundedDelta;
                }
                
                return { ...clip, startPosition: newStart, duration: newDuration, videoOffset: newOffset };
            }));
            setDragOffset(e.clientX);
            return;
        }

        // Handle moving
        const timelineRect = timelineRef.current.getBoundingClientRect();
            const scrollLeft = timelineRef.current.scrollLeft;
            const scrollTop = timelineRef.current.scrollTop;
            const rawPosition = e.clientX - timelineRect.left + scrollLeft - dragOffset;
            const newPosition = Math.max(0, rawPosition);
            
            const rawY = e.clientY - timelineRect.top + scrollTop;
            const relativeY = rawY - 32; // Subtract ruler height

            const videoTrackHeight = 96;
            const otherTrackHeight = 40;

            const videoClips = clips.filter(c => c.trackIndex >= 0);
            const maxOccupiedVideoTrack = videoClips.length > 0 ? Math.max(...videoClips.map(c => c.trackIndex)) : -1;
            const allowedMaxTrack = Math.max(0, clips.length - 1);
            const renderMaxTrack = Math.min(allowedMaxTrack, maxOccupiedVideoTrack + 1);

            const totalVideoHeight = (renderMaxTrack + 1) * videoTrackHeight;
            let targetTrack = 0;

            if (relativeY >= totalVideoHeight + otherTrackHeight) {
                targetTrack = -2; // Text
            } else if (relativeY >= totalVideoHeight) {
                targetTrack = -1; // Audio
            } else {
                targetTrack = Math.max(0, Math.min(renderMaxTrack, Math.floor(relativeY / videoTrackHeight)));
            }
            
            // Enforce track restrictions based on clip type
            if (draggedClip.type === 'audio') {
                targetTrack = -1; // Force audio to audio track
            } else if (draggedClip.type === 'text') {
                targetTrack = -2; // Force text to text track
            } else if (draggedClip.type === 'video' || draggedClip.type === 'image') {
                // If it's video/image and aimed at audio/text tracks, force it to the main video track (0)
                if (targetTrack < 0) {
                    targetTrack = 0;
                }
            }

            setClips(prevClips => {
                let updatedClips = prevClips.map(clip =>
                    clip.id === draggedClip.id
                        ? { ...clip, startPosition: newPosition / zoom, trackIndex: targetTrack }
                        : clip
                );

                updatedClips.sort((a, b) => a.startPosition - b.startPosition);
                const movedClip = updatedClips.find(c => c.id === draggedClip.id);
                if (!movedClip) return prevClips;

                for (let i = 0; i < updatedClips.length; i++) {
                    const clip = updatedClips[i];
                    if (clip.id === movedClip.id) continue;
                    if (clip.trackIndex !== movedClip.trackIndex) continue;

                    const movedStart = movedClip.startPosition;
                    const movedEnd = movedStart + (movedClip.duration * 100);
                    const clipStart = clip.startPosition;
                    const clipEnd = clipStart + (clip.duration * 100);

                    if (movedStart < clipEnd && movedEnd > clipStart) {
                        if (movedStart <= clipStart) {
                           clip.startPosition = movedEnd; 
                        }
                    }
                }
                return updatedClips;
            });
    }, [draggedClip, dragOffset, zoom, clips, timelineRef, setClips, resizeHandle]);

    const handleMouseUp = useCallback(() => {
        setDraggedClip(null);
        setResizeHandle(null);
    }, []);

    useEffect(() => {
        if (draggedClip) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [draggedClip, handleMouseMove, handleMouseUp]);

    return {
        draggedClip,
        handleClipMouseDown,
        handleResizeMouseDown
    };
};
