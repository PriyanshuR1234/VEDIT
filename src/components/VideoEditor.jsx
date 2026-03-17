import React, { useRef, forwardRef, useImperativeHandle, useState, useCallback, useEffect } from 'react';
import { Upload, Play, Pause, SkipBack, SkipForward, Loader2 } from 'lucide-react';
import Timeline from './Timeline';
import VideoPreview from './VideoPreview';
import TextToolbar from './TextToolbar';
import { useTimeline } from '../hooks/useTimeline';
import { usePlayer } from '../hooks/usePlayer';
import { useDragDrop } from '../hooks/useDragDrop';

const VideoEditor = forwardRef((props, ref) => {
    const {
        clips,
        setClips,
        zoom,
        setZoom,
        addClips,
        splitClip,
        deleteClip,
        undo,
        redo,
        canUndo,
        canRedo
    } = useTimeline();

    const [timelineHeight, setTimelineHeight] = useState(320);
    const isDraggingTimeline = useRef(false);

    const handleMouseMoveResize = useCallback((e) => {
        if (isDraggingTimeline.current) {
            const newHeight = window.innerHeight - e.clientY;
            setTimelineHeight(Math.max(150, Math.min(newHeight, window.innerHeight * 0.8)));
        }
    }, []);

    const handleMouseUpResize = useCallback(() => {
        if (isDraggingTimeline.current) {
            isDraggingTimeline.current = false;
            document.body.style.cursor = 'default';
        }
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMoveResize);
        window.addEventListener('mouseup', handleMouseUpResize);
        return () => {
            window.removeEventListener('mousemove', handleMouseMoveResize);
            window.removeEventListener('mouseup', handleMouseUpResize);
        };
    }, [handleMouseMoveResize, handleMouseUpResize]);

    // calculate duration
    const duration = clips.length > 0 ? Math.max(...clips.map(c => (c.startPosition / 100) + c.duration)) : 0;

    const {
        isPlaying,
        currentTime,
        currentVideo,
        videoRef,
        togglePlayPause,
        seek,
        setIsPlaying
    } = usePlayer(clips, duration);

    const timelineRef = useRef(null);
    const fileInputRef = useRef(null);
    const audioInputRef = useRef(null);

    const { handleClipMouseDown, handleResizeMouseDown } = useDragDrop(clips, setClips, zoom, timelineRef);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        const videoFiles = files.filter(file => file.type.startsWith('video/'));
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (videoFiles.length === 0 && imageFiles.length === 0) return;

        let lastEndPosition = clips.reduce((max, clip) => Math.max(max, clip.startPosition + (clip.duration * 100)), 0);
        const newClips = [];

        for (const file of [...videoFiles, ...imageFiles]) {
            const url = URL.createObjectURL(file);
            const loadMetadata = new Promise((resolve) => {
                if (file.type.startsWith('video/')) {
                    const video = document.createElement('video');
                    video.src = url;
                    video.onloadedmetadata = () => resolve({ duration: video.duration, url: url });
                    video.onerror = () => resolve({ duration: 5, url: url });
                } else {
                    const img = new Image();
                    img.src = url;
                    img.onload = () => resolve({ duration: 5, url: url });
                    img.onerror = () => resolve({ duration: 5, url: url });
                }
            });
            const metadata = await loadMetadata;
            const isVideo = file.type.startsWith('video/');
            
            newClips.push({
                id: Date.now() + Math.random(),
                name: file.name,
                url: metadata.url,
                duration: metadata.duration,
                startPosition: lastEndPosition,
                trackIndex: 0,
                videoOffset: 0,
                type: isVideo ? 'video' : 'image',
                muted: isVideo ? true : false,
                isHidden: false
            });

            if (isVideo) {
                newClips.push({
                    id: Date.now() + Math.random(),
                    name: `${file.name.substring(0, 15)} Audio`,
                    url: metadata.url,
                    duration: metadata.duration,
                    startPosition: lastEndPosition,
                    trackIndex: -1,
                    type: 'audio',
                    volume: 1,
                    isHidden: false
                });
            }

            lastEndPosition += metadata.duration * 100;
        }

        addClips(newClips);
        e.target.value = '';
    };

    const handleAudioSelect = async (e) => {
        const files = Array.from(e.target.files);
        const audioFiles = files.filter(file => file.type.startsWith('audio/'));
        if (audioFiles.length === 0) return;
        const newClips = [];
        for (const file of audioFiles) {
            const url = URL.createObjectURL(file);
            const loadMetadata = new Promise((resolve) => {
                const audio = document.createElement('audio');
                audio.src = url;
                audio.onloadedmetadata = () => {
                    resolve({ duration: audio.duration, url: url });
                };
            });
            const metadata = await loadMetadata;
            newClips.push({
                id: Date.now() + Math.random(),
                name: file.name,
                url: metadata.url,
                duration: metadata.duration,
                startPosition: Math.max(0, currentTime * 100),
                trackIndex: -1, // Audio track
                type: 'audio',
                volume: 1,
                isHidden: false,
            });
        }
        addClips(newClips);
        e.target.value = '';
    };

    const [selectedTextClip, setSelectedTextClip] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleAudioUploadClick = () => {
        audioInputRef.current?.click();
    };

    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDraggingOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDraggingOver(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        const videoFiles = files.filter(f => f.type.startsWith('video/') || f.type.startsWith('image/'));
        const audioFiles = files.filter(f => f.type.startsWith('audio/'));

        const newClips = [];

        for (const file of audioFiles) {
            const url = URL.createObjectURL(file);
            const loadMetadata = new Promise((resolve) => {
                const audio = document.createElement('audio');
                audio.src = url;
                audio.onloadedmetadata = () => resolve({ duration: audio.duration, url: url });
                audio.onerror = () => resolve({ duration: 5, url: url });
            });
            const metadata = await loadMetadata;
            newClips.push({
                id: Date.now() + Math.random(),
                name: file.name,
                url: metadata.url,
                duration: metadata.duration,
                startPosition: Math.max(0, currentTime * 100),
                trackIndex: -1,
                type: 'audio',
                volume: 1,
                isHidden: false,
            });
        }

        let lastEndPosition = clips.length > 0 
            ? Math.max(...clips.map(c => c.startPosition + (c.duration * 100))) 
            : 0;

        for (const file of videoFiles) {
            const url = URL.createObjectURL(file);
            const loadMetadata = new Promise((resolve) => {
                if (file.type.startsWith('video/')) {
                    const video = document.createElement('video');
                    video.src = url;
                    video.onloadedmetadata = () => resolve({ duration: video.duration, url: url });
                    video.onerror = () => resolve({ duration: 5, url: url });
                } else {
                    const img = new Image();
                    img.src = url;
                    img.onload = () => resolve({ duration: 5, url: url }); // Default 5s for images
                    img.onerror = () => resolve({ duration: 5, url: url });
                }
            });
            const metadata = await loadMetadata;
            const isVideo = file.type.startsWith('video/');
            newClips.push({
                id: Date.now() + Math.random(),
                name: file.name,
                url: metadata.url,
                duration: metadata.duration,
                startPosition: lastEndPosition,
                trackIndex: 0,
                videoOffset: 0,
                type: isVideo ? 'video' : 'image',
                muted: isVideo ? true : false,
                isHidden: false
            });

            if (isVideo) {
                newClips.push({
                    id: Date.now() + Math.random(),
                    name: `${file.name.substring(0, 15)} Audio`,
                    url: metadata.url,
                    duration: metadata.duration,
                    startPosition: lastEndPosition,
                    trackIndex: -1,
                    type: 'audio',
                    volume: 1,
                    isHidden: false
                });
            }

            lastEndPosition += metadata.duration * 100;
        }

        addClips(newClips);
    };

    const handleAddText = (text) => {
        const newClip = {
            id: Date.now() + Math.random(),
            name: `Text: ${text.substring(0, 10)}...`,
            text: text,
            duration: 5,
            startPosition: Math.max(0, currentTime * 100),
            trackIndex: -2,
            type: 'text',
            fontSize: 48,
            color: '#ffffff',
            x: 50,
            y: 50,
            isHidden: false
        };
        addClips([newClip]);
        setSelectedTextClip(newClip);
    };

    const handleUpdateTextClip = (id, updates) => {
        const updatedClips = clips.map(c => 
            c.id === id ? { ...c, ...updates } : c
        );
        updateClips(updatedClips);
        
        if (selectedTextClip?.id === id) {
            setSelectedTextClip(prev => ({ ...prev, ...updates }));
        }
    };

    const handleUpdateClip = (id, updates) => {
        const updatedClips = clips.map(c => 
            c.id === id ? { ...c, ...updates } : c
        );
        updateClips(updatedClips);
    };

    const handleExport = async () => {
        if (clips.length === 0) return;
        setIsExporting(true);
        seek(0);
        
        // Wait a bit for seek to complete and first frame to load
        await new Promise(r => setTimeout(r, 500));
        
        const canvas = document.createElement('canvas');
        // Standard export resolution
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        
        const stream = canvas.captureStream(30); // 30 FPS
        
        // Audio handling
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const dest = audioContext.createMediaStreamDestination();
        
        // We need to keep references to created elements to clean them up and manage playback
        const mediaElements = [];
        
        // The most complicated part of a frontend export is managing time and drawing frames
        // accurately. This simplified version will draw the master <video> element
        // from the UI directly to the canvas in real-time.
        const masterVideo = videoRef.current;
        
        if (masterVideo) {
            // Check if it has an audio track and is not muted
            if (!masterVideo.muted && masterVideo.mozHasAudio || Boolean(masterVideo.webkitAudioDecodedByteCount) || Boolean(masterVideo.audioTracks && masterVideo.audioTracks.length)) {
                 try {
                     const source = audioContext.createMediaElementSource(masterVideo);
                     source.connect(dest);
                 } catch (e) {
                     console.warn("Could not capture audio from video element", e);
                 }
            }
        }
        
        // Note: For a robust export, we'd need to create silent AudioContext sources for audio clips,
        // synchronize their playback with the video recording, and pipe them into `dest`.
        // Given constraints, this basic implementation focuses on visual export + main video audio.
        
        // Add captured audio tracks to the video stream
        dest.stream.getAudioTracks().forEach(track => stream.addTrack(track));

        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        const recordedChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style = 'display: none';
            a.href = url;
            a.download = 'vedit-export.webm';
            a.click();
            URL.revokeObjectURL(url);
            setIsExporting(false);
            audioContext.close();
        };

        // Render loop
        const drawFrame = () => {
             // Clear background (black)
             ctx.fillStyle = '#000000';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             
             if (masterVideo && !masterVideo.paused && !masterVideo.ended) {
                 // Calculate aspect ratio preserving draw
                 const vRatio = canvas.width / masterVideo.videoWidth;
                 const hRatio = canvas.height / masterVideo.videoHeight;
                 const ratio  = Math.min(vRatio, hRatio);
                 const centerShift_x = (canvas.width - masterVideo.videoWidth*ratio) / 2;
                 const centerShift_y = (canvas.height - masterVideo.videoHeight*ratio) / 2;  
                 
                 ctx.drawImage(masterVideo, 0,0, masterVideo.videoWidth, masterVideo.videoHeight,
                                    centerShift_x,centerShift_y,masterVideo.videoWidth*ratio, masterVideo.videoHeight*ratio);
             }
             
             // Draw text overlays if they exist for current time
             const visibleTexts = clips.filter(clip => 
                clip.type === 'text' && 
                (clip.startPosition / 100) <= currentTime && 
                ((clip.startPosition / 100) + clip.duration) >= currentTime
             );
             
             visibleTexts.forEach(clip => {
                 ctx.font = `${clip.fontSize || 48}px sans-serif`;
                 ctx.fillStyle = clip.color || '#ffffff';
                 ctx.textAlign = 'center';
                 ctx.textBaseline = 'middle';
                 
                 // Apply shadow
                 ctx.shadowColor = 'rgba(0,0,0,0.8)';
                 ctx.shadowBlur = 4;
                 ctx.shadowOffsetX = 2;
                 ctx.shadowOffsetY = 2;
                 
                 const x = (clip.x || 50) / 100 * canvas.width;
                 const y = (clip.y || 50) / 100 * canvas.height;
                 
                 ctx.fillText(clip.text, x, y);
                 
                 // Reset shadow for next draw
                 ctx.shadowColor = 'transparent';
             });

             if (isExportingRef.current) {
                 requestAnimationFrame(drawFrame);
             }
        };

        // Start recording and playback
        mediaRecorder.start();
        setIsPlaying(true);
        const isExportingRef = { current: true };
        drawFrame();
        
        // Stop logic will be handled by a useEffect watching `isPlaying` to stop when it reaches the end
        // For simplicity in this replacement chunk, we attach it to the window or set a timeout based on duration
        setTimeout(() => {
            isExportingRef.current = false;
            mediaRecorder.stop();
            setIsPlaying(false);
        }, duration * 1000 + 500); // add half a second buffer
    };

    useImperativeHandle(ref, () => ({
        handleImportClick: handleUploadClick,
        handleExport: handleExport,
        undo,
        redo,
        canUndo,
        canRedo
    }));

    // Keyboard shortcuts for Undo/Redo
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                if (e.shiftKey) {
                    e.preventDefault();
                    if (canRedo) redo();
                } else {
                    e.preventDefault();
                    if (canUndo) undo();
                }
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
                e.preventDefault();
                if (canRedo) redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, canUndo, canRedo]);

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '00:00:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleClipClick = (clip) => {
        seek(clip.startPosition / 100);
        setIsPlaying(false);
    };

    return (
        <div 
            className="flex-1 flex flex-col h-full bg-gray-950 overflow-hidden relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isDraggingOver && (
                <div className="absolute inset-0 z-[100] bg-indigo-500/20 border-4 border-dashed border-indigo-500 rounded-lg flex items-center justify-center p-8 backdrop-blur-sm pointer-events-none">
                    <div className="bg-gray-900 px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center">
                        <Upload className="w-16 h-16 text-indigo-400 mb-4 animate-bounce" />
                        <h2 className="text-2xl font-bold text-white mb-2">Drop Media Here</h2>
                        <p className="text-gray-400 text-center">Videos, audio, and images are supported.</p>
                    </div>
                </div>
            )}
            
            {isExporting && (
                <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Exporting Video...</h3>
                    <p className="text-gray-400">Please wait while we render your masterpiece. Do not close this tab.</p>
                </div>
            )}
            
            <input
                ref={fileInputRef}
                type="file"
                accept="video/*,image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
            />
            <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                onChange={handleAudioSelect}
            />

            <div className="flex-1 flex flex-col min-h-0 relative">
                <TextToolbar
                    onAddText={handleAddText}
                    selectedTextClip={selectedTextClip}
                    onUpdateTextClip={handleUpdateTextClip}
                />

                <VideoPreview
                    currentVideo={currentVideo}
                    videoRef={videoRef}
                    isPlaying={isPlaying}
                    handlePlayPause={togglePlayPause}
                    currentTime={currentTime}
                    duration={duration}
                    handleUploadClick={handleUploadClick}
                    seek={seek}
                    clips={clips}
                    onUpdateTextClip={handleUpdateTextClip}
                    onUpdateClip={handleUpdateClip}
                />

                <div className="h-16 border-t border-gray-800 bg-gray-950 flex items-center justify-center gap-8 px-4 relative z-20 flex-shrink-0">
                    <button
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50"
                        disabled={clips.length === 0}
                        onClick={() => seek(Math.max(0, currentTime - 5))}
                    >
                        <SkipBack className="w-5 h-5" />
                    </button>
                    <button
                        className="p-4 bg-white text-black rounded-full hover:bg-gray-200 hover:scale-105 transition-all shadow-lg shadow-white/10 active:scale-95 disabled:opacity-50"
                        onClick={togglePlayPause}
                        disabled={clips.length === 0}
                    >
                        {isPlaying ? (
                            <Pause className="w-6 h-6 fill-current" />
                        ) : (
                            <Play className="w-6 h-6 fill-current ml-1" />
                        )}
                    </button>
                    <button
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50"
                        disabled={clips.length === 0}
                        onClick={() => seek(Math.min(duration, currentTime + 5))}
                    >
                        <SkipForward className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Timeline Resizer Handle */}
            <div 
                className="h-1.5 flex-shrink-0 cursor-row-resize hover:bg-indigo-500 bg-gray-800 transition-colors z-30"
                onMouseDown={() => {
                    isDraggingTimeline.current = true;
                    document.body.style.cursor = 'row-resize';
                }}
            />

            {/* Timeline Area */}
            <div 
                style={{ 
                    height: `${timelineHeight}px`,
                    transition: isDraggingTimeline.current ? 'none' : 'height 300ms ease-in-out'
                }} 
                className="flex-shrink-0 flex flex-col bg-gray-950 relative z-20"
            >
                <Timeline 
                    zoom={zoom}
                    setZoom={setZoom}
                    clips={clips}
                    currentVideo={currentVideo}
                    currentTime={currentTime}
                    duration={duration}
                    onClipClick={handleClipClick}
                    onClipMouseDown={handleClipMouseDown}
                    onClipResizeMouseDown={handleResizeMouseDown}
                    onSeek={seek}
                    timelineRef={timelineRef}
                    handleUploadClick={handleUploadClick}
                    handleAudioUpload={handleAudioUploadClick}
                    onSplit={() => splitClip(currentTime)}
                    onDelete={() => {
                        if (currentVideo) deleteClip(currentVideo.id);
                    }}
                />
            </div>
        </div>
    );
});

export default VideoEditor;
