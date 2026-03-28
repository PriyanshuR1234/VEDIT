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
            // Match the new 2-default-track logic
            const renderMaxTrack = Math.max(1, maxOccupiedVideoTrack + 1);

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
                targetTrack = -1;
            } else if (draggedClip.type === 'text') {
                targetTrack = -2;
            } else if (draggedClip.type === 'video' || draggedClip.type === 'image') {
                if (targetTrack < 0) targetTrack = 0;
            }

            setClips(prevClips => {
                const rawNewStart = newPosition / zoom;
                const draggedDurationUnits = draggedClip.duration * 100;
                let finalNewStart = rawNewStart;

                // 1. Initial pass: See if we should snap to avoid overlap (under 50% threshold)
                // Filter other clips on the SAME target track
                const otherClipsOnTrack = prevClips.filter(c => c.trackIndex === targetTrack && c.id !== draggedClip.id);
                
                let shouldRipple = false;
                let rippleTarget = null;

                for (const clip of otherClipsOnTrack) {
                    const clipStart = clip.startPosition;
                    const clipEnd = clipStart + (clip.duration * 100);
                    
                    // Check for collision
                    if (rawNewStart < clipEnd && (rawNewStart + draggedDurationUnits) > clipStart) {
                        // Calculate overlap amount
                        const overlapStart = Math.max(rawNewStart, clipStart);
                        const overlapEnd = Math.min(rawNewStart + draggedDurationUnits, clipEnd);
                        const overlapDuration = overlapEnd - overlapStart;
                        const clipDurationUnits = clip.duration * 100;
                        
                        // Overlap percentage relative to the *colliding* clip
                        const overlapPercent = overlapDuration / clipDurationUnits;

                        if (overlapPercent >= 0.5) {
                            shouldRipple = true;
                            rippleTarget = clip;
                            // When rippling, we keep the raw position (the user is "forcing" it)
                            break; 
                        } else {
                            // Snap to outside
                            if (rawNewStart + draggedDurationUnits / 2 > clipStart + clipDurationUnits / 2) {
                                // Dragged mostly to the right of this clip, snap to right
                                finalNewStart = clipEnd;
                            } else {
                                // Dragged mostly to the left, snap to left
                                finalNewStart = Math.max(0, clipStart - draggedDurationUnits);
                            }
                        }
                    }
                }

                // 2. Update clips based on determined positions
                let updatedClips = prevClips.map(clip =>
                    clip.id === draggedClip.id
                        ? { ...clip, startPosition: finalNewStart, trackIndex: targetTrack }
                        : { ...clip }
                );

                if (!shouldRipple) return updatedClips;

                // 3. Apply Ripple Push (if threshold met)
                const movedClip = updatedClips.find(c => c.id === draggedClip.id);
                const movedEnd = movedClip.startPosition + (movedClip.duration * 100);

                const sameTrackClips = updatedClips
                    .filter(c => c.trackIndex === targetTrack && c.id !== movedClip.id)
                    .sort((a, b) => a.startPosition - b.startPosition);

                const clipUpdates = {};
                let currentPushThreshold = movedEnd;
                let hasRippled = false;

                for (const clip of sameTrackClips) {
                    const clipStart = clip.startPosition;
                    if (clipStart < currentPushThreshold) {
                        clipUpdates[clip.id] = { ...clip, startPosition: currentPushThreshold };
                        currentPushThreshold += (clip.duration * 100);
                        hasRippled = true;
                    }
                }

                if (!hasRippled) return updatedClips;

                return updatedClips
                    .map(clip => clipUpdates[clip.id] || clip)
                    .sort((a, b) => a.startPosition - b.startPosition);
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
