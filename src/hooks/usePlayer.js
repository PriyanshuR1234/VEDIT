import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export const usePlayer = (clips, duration) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [currentVideo, setCurrentVideo] = useState(null);

    const videoRef = useRef(null);
    const requestRef = useRef();
    const previousTimeRef = useRef();
    const audioElementsRef = useRef({}); // Map clip.id -> Audio object

    // Memoize sorted clips to avoid sorting on every frame
    // Sort clips by track index (higher tracks on top)
    const sortedClips = useMemo(() => {
        return [...clips].sort((a, b) => b.trackIndex - a.trackIndex);
    }, [clips]);

    // Determine which clip should be playing at a given global time
    const determineActiveClip = useCallback((time) => {
        const activeClip = sortedClips.find(clip => {
            if (clip.type === 'audio') return false; // Ignore audio clips for video display
            const start = clip.startPosition / 100;
            const end = start + clip.duration;
            return time >= start && time < end;
        });

        return activeClip || null;
    }, [sortedClips]);

    // Sync video element with current time and active clip
    const syncVideo = useCallback((time, activeClip) => {
        if (!activeClip) {
            setCurrentVideo(null);
            return;
        }

        // If the active clip has changed, update state
        if (!currentVideo || activeClip.id !== currentVideo.id) {
            setCurrentVideo(activeClip);

            // We need to wait for the video src to update before seeking
            // This is handled by the useEffect watching currentVideo below
        } else if (videoRef.current) {
            // Same clip, just update time
            const clipStartSeconds = activeClip.startPosition / 100;
            const relativeTime = time - clipStartSeconds;
            const videoTime = relativeTime + (activeClip.videoOffset || 0);

            // Only seek if the difference is significant to avoid jitter
            // Increased drift tolerance during playback to avoid stutter loops on high-res videos
            const maxDrift = videoRef.current && !videoRef.current.paused ? 0.4 : 0.1;
            if (Math.abs(videoRef.current.currentTime - videoTime) > maxDrift) {
                videoRef.current.currentTime = videoTime;
            }
            
            // Apply volume and muted state
            if (activeClip.type === 'video') {
                videoRef.current.muted = activeClip.muted || false;
                videoRef.current.volume = activeClip.volume !== undefined ? activeClip.volume : 1;
            }
        }
    }, [currentVideo]);

    // Sync audio elements
    const syncAudio = useCallback((time) => {
        const audioClips = clips.filter(c => c.type === 'audio');

        // Cleanup removed clips
        Object.keys(audioElementsRef.current).forEach(id => {
            if (!audioClips.find(c => c.id.toString() === id)) {
                audioElementsRef.current[id].pause();
                delete audioElementsRef.current[id];
            }
        });

        audioClips.forEach(clip => {
            let audio = audioElementsRef.current[clip.id];
            if (!audio) {
                audio = new Audio(clip.url);
                audioElementsRef.current[clip.id] = audio;
            }

            // Apply volume
            audio.volume = clip.volume !== undefined ? clip.volume : 1;

            const start = clip.startPosition / 100;
            const end = start + clip.duration;

            if (time >= start && time < end) {
                // Account for split offset
                const relativeTime = (time - start) + (clip.audioOffset || clip.videoOffset || 0);
                
                // Sync time if drifted
                if (Math.abs(audio.currentTime - relativeTime) > 0.2) {
                    audio.currentTime = relativeTime;
                }

                if (isPlaying) {
                    if (audio.paused) {
                        audio.play().catch(() => {
                            // Auto-play policy or loading error
                        });
                    }
                } else {
                    if (!audio.paused) {
                        audio.pause();
                    }
                }
            } else {
                // Should be stopped
                if (!audio.paused) {
                    audio.pause();
                }
            }
        });
    }, [clips, isPlaying]);

    // Main playback loop
    const animate = useCallback(function tick(time) {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = (time - previousTimeRef.current) / 1000;

            setCurrentTime(prevTime => {
                const newTime = prevTime + deltaTime;

                // Check if we reached the end of the timeline
                if (newTime >= duration && duration > 0) {
                    setIsPlaying(false);
                    return prevTime;
                }

                return newTime;
            });
        }
        previousTimeRef.current = time;

        if (isPlaying) {
            requestRef.current = requestAnimationFrame(tick);
        }
    }, [isPlaying, duration]);

    useEffect(() => {
        if (isPlaying) {
            previousTimeRef.current = performance.now();
            requestRef.current = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(requestRef.current);
            previousTimeRef.current = undefined;
            if (videoRef.current) {
                videoRef.current.pause();
            }
            // Pause all audio
            Object.values(audioElementsRef.current).forEach(audio => audio.pause());
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [isPlaying, animate]);

    // Sync video and audio when currentTime changes
    useEffect(() => {
        const activeClip = determineActiveClip(currentTime);
        syncVideo(currentTime, activeClip);
        syncAudio(currentTime);

        // If we are playing, ensure the video element is playing
        if (isPlaying && videoRef.current && activeClip) {
            // We might need to play if it was paused or just loaded
            if (videoRef.current.paused) {
                videoRef.current.play().catch(() => {
                    // Ignore play errors (e.g. if source is loading)
                });
            }
        } else if (!isPlaying && videoRef.current) {
            if (!videoRef.current.paused) {
                videoRef.current.pause();
            }
        }
    }, [currentTime, determineActiveClip, syncVideo, syncAudio, isPlaying]);

    // High-priority property sync (Volume, Opacity) even when paused or animation loop is delayed
    useEffect(() => {
        // Sync active video volume
        if (videoRef.current) {
            const activeClip = determineActiveClip(currentTime);
            if (activeClip && activeClip.type === 'video') {
                videoRef.current.volume = activeClip.volume !== undefined ? activeClip.volume : 1;
            }
        }

        // Sync all audio element volumes
        Object.keys(audioElementsRef.current).forEach(id => {
            const clip = clips.find(c => c.id.toString() === id);
            if (clip && clip.type === 'audio') {
                audioElementsRef.current[id].volume = clip.volume !== undefined ? clip.volume : 1;
            }
        });
    }, [clips, currentTime, determineActiveClip]);

    // Handle video load to seek to correct time immediately
    useEffect(() => {
        if (currentVideo && videoRef.current) {
            const activeClip = determineActiveClip(currentTime);
            if (activeClip && activeClip.id === currentVideo.id) {
                const clipStartSeconds = activeClip.startPosition / 100;
                const relativeTime = currentTime - clipStartSeconds;
                const videoTime = relativeTime + (activeClip.videoOffset || 0);
                videoRef.current.currentTime = videoTime;
                if (isPlaying) videoRef.current.play().catch(() => { });
            }
        }
    }, [currentVideo]); // Depend on currentVideo changing (new source)

    const togglePlayPause = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const seek = useCallback((time) => {
        setCurrentTime(time);
        const activeClip = determineActiveClip(time);
        syncVideo(time, activeClip);
        syncAudio(time);
    }, [determineActiveClip, syncVideo, syncAudio]);

    return {
        isPlaying,
        currentTime,
        currentVideo,
        videoRef,
        togglePlayPause,
        seek,
        setIsPlaying
    };
};
