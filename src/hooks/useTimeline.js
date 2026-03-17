import { useState, useCallback } from 'react';

export const useTimeline = () => {
    const [state, setState] = useState({
        history: [[]],
        currentIndex: 0
    });
    const [zoom, setZoom] = useState(1);

    const clips = state.history[state.currentIndex] || [];

    const setClips = useCallback((action) => {
        setState(prev => {
            const currentClips = prev.history[prev.currentIndex];
            const newClips = typeof action === 'function' ? action(currentClips) : action;
            
            // If the state didn't actually change, don't push a new history state
            if (JSON.stringify(currentClips) === JSON.stringify(newClips)) {
                return prev;
            }

            const newHistory = prev.history.slice(0, prev.currentIndex + 1);
            return {
                history: [...newHistory, newClips],
                currentIndex: prev.currentIndex + 1
            };
        });
    }, []);

    const addClips = useCallback((newClips) => {
        setClips(prev => [...prev, ...newClips]);
    }, [setClips]);

    const updateClips = useCallback((updatedClips) => {
        setClips(updatedClips);
    }, [setClips]);

    const splitClip = useCallback((currentTime) => {
        setClips(prev => {
            const clipToSplit = prev.find(clip => {
                const start = clip.startPosition / 100;
                const end = start + clip.duration;
                return currentTime > start && currentTime < end;
            });

            if (!clipToSplit) return prev;

            const splitPoint = currentTime - (clipToSplit.startPosition / 100);

            const leftClip = {
                ...clipToSplit,
                id: Date.now() + Math.random(),
                duration: splitPoint,
            };

            const rightClip = {
                ...clipToSplit,
                id: Date.now() + Math.random() + 1,
                duration: clipToSplit.duration - splitPoint,
                startPosition: clipToSplit.startPosition + (splitPoint * 100),
                videoOffset: (clipToSplit.videoOffset || 0) + splitPoint,
            };

            const others = prev.filter(c => c.id !== clipToSplit.id);
            return [...others, leftClip, rightClip];
        });
    }, [setClips]);

    const deleteClip = useCallback((clipId) => {
        setClips(prev => prev.filter(c => c.id !== clipId));
    }, [setClips]);

    const undo = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentIndex: Math.max(0, prev.currentIndex - 1)
        }));
    }, []);

    const redo = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentIndex: Math.min(prev.history.length - 1, prev.currentIndex + 1)
        }));
    }, []);

    return {
        clips,
        setClips,
        zoom,
        setZoom,
        addClips,
        updateClips,
        splitClip,
        deleteClip,
        undo,
        redo,
        canUndo: state.currentIndex > 0,
        canRedo: state.currentIndex < state.history.length - 1
    };
};
