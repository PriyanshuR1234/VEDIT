import React, { useRef, forwardRef, useImperativeHandle, useState, useCallback, useEffect } from 'react';
import { Upload, Play, Pause, SkipBack, SkipForward, Loader2, Type, Download } from 'lucide-react';
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
    const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isImportingOverlay, setIsImportingOverlay] = useState(false);

    const handleMouseMoveResize = useCallback((e) => {
        if (isDraggingTimeline) {
            const newHeight = window.innerHeight - e.clientY;
            setTimelineHeight(Math.max(150, Math.min(newHeight, window.innerHeight * 0.8)));
        }
    }, [isDraggingTimeline]);

    const handleMouseUpResize = useCallback(() => {
        if (isDraggingTimeline) {
            setIsDraggingTimeline(false);
            document.body.style.cursor = 'default';
        }
    }, [isDraggingTimeline]);

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

    const handleUploadToAI = async (file, clipId) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('http://localhost:8000/api/upload-media', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                const data = await response.json();
                if (data.geminiFileId) {
                    setClips(prev => prev.map(c => c.id === clipId ? { 
                        ...c, 
                        geminiFileId: data.geminiFileId,
                        name: data.filename || c.name 
                    } : c));
                }
            }
        } catch (error) {
            console.error('Failed AI background upload:', error);
        }
    };

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        const videoFiles = files.filter(file => file.type.startsWith('video/'));
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (videoFiles.length === 0 && imageFiles.length === 0) return;

        let lastEndPosition = clips.reduce((max, clip) => Math.max(max, clip.startPosition + (clip.duration * 100)), 0);
        const startPos = isImportingOverlay ? currentTime * 100 : lastEndPosition;
        let currentMaxTrack = 0;
        const newClips = [];
        if (isImportingOverlay) {
            // Simple logic: find highest track and go +1, or find first empty slot
            const tracksAtTime = clips.filter(c => 
                (c.startPosition < startPos + 500) && 
                (c.startPosition + c.duration * 100 > startPos)
            ).map(c => c.trackIndex);
            currentMaxTrack = tracksAtTime.length > 0 ? Math.max(...tracksAtTime) + 1 : 1;
        }

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
            const primaryId = `clip_${Math.random().toString(36).substr(2, 9)}`;
            
            const trackIndex = isImportingOverlay ? currentMaxTrack : 0;
            const initialX = isImportingOverlay ? 35 : 0;
            const initialY = isImportingOverlay ? 35 : 0;
            const initialWidth = isImportingOverlay ? 30 : 100;
            const initialHeight = isImportingOverlay ? 30 : 100;

            newClips.push({
                id: primaryId,
                name: file.name,
                url: metadata.url,
                duration: metadata.duration,
                startPosition: startPos,
                trackIndex: trackIndex,
                videoOffset: 0,
                type: isVideo ? 'video' : 'image',
                muted: isVideo, // Mute the video clip if we add a separate audio track below
                isHidden: false,
                x: initialX, y: initialY, width: initialWidth, height: initialHeight,
                hasPopIn: isImportingOverlay,
                hasBorder: isImportingOverlay
            });

            if (isVideo) {
                newClips.push({
                    id: `audio_${Math.random().toString(36).substr(2, 9)}`,
                    name: `${file.name.substring(0, 15)} Audio`,
                    url: metadata.url,
                    duration: metadata.duration,
                    startPosition: startPos,
                    trackIndex: -1,
                    type: 'audio',
                    volume: 1,
                    isHidden: false
                });
            }

            handleUploadToAI(file, primaryId);
            if (!isImportingOverlay) {
                lastEndPosition += metadata.duration * 100;
            } else {
                currentMaxTrack++; // Stack next overlay higher if multiple
            }
        }

        addClips(newClips);
        if (newClips.length > 0) setActiveClipId(newClips[0].id);
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
                audio.onloadedmetadata = () => resolve({ duration: audio.duration, url: url });
            });
            const metadata = await loadMetadata;
            const primaryId = `clip_${Math.random().toString(36).substr(2, 9)}`;
            newClips.push({
                id: primaryId,
                name: file.name,
                url: metadata.url,
                duration: metadata.duration,
                startPosition: Math.max(0, currentTime * 100),
                trackIndex: -1,
                type: 'audio',
                volume: 1,
                isHidden: false,
            });
            handleUploadToAI(file, primaryId);
        }
        addClips(newClips);
        if (newClips.length > 0) setActiveClipId(newClips[0].id);
        e.target.value = '';
    };

    const [selectedTextClip, setSelectedTextClip] = useState(null);
    const [activeTool, setActiveToolState] = useState(null);
    const [activeOverlay, setActiveOverlay] = useState(null); // 'crop' | 'transform' | 'overlays' | null
    const [textPromptOpen, setTextPromptOpen] = useState(false);
    const [showTextToolbar, setShowTextToolbar] = useState(true);
    const [activeClipId, setActiveClipId] = useState(null);

    // Global Paste Listener for Media
    useEffect(() => {
        const handlePaste = async (e) => {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1 || items[i].type.indexOf('video') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) {
                        const url = URL.createObjectURL(file);
                        const newClip = {
                            id: `clip_${Math.random().toString(36).substr(2, 9)}`,
                            url: url,
                            type: file.type.startsWith('image') ? 'image' : 'video',
                            duration: file.type.startsWith('image') ? 5 : 0, 
                            startPosition: currentTime * 100,
                            name: file.name,
                            x: 25, y: 25, width: 50, height: 50,
                            hasPopIn: true,
                            hasBorder: true,
                            muted: false,
                            trackIndex: 0
                        };
                        addClips([newClip]);
                        setActiveClipId(newClip.id);
                        handleUploadToAI(file, newClip.id);
                    }
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [currentTime, addClips]);

    const handleUploadClick = () => {
        setIsImportingOverlay(false);
        fileInputRef.current?.click();
    };
    const handleImportOverlayClick = () => {
        setIsImportingOverlay(true);
        fileInputRef.current?.click();
    };
    const handleAudioUploadClick = () => audioInputRef.current?.click();

    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const handleDragOver = (e) => { e.preventDefault(); setIsDraggingOver(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDraggingOver(false); };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        const mediaFiles = files.filter(f => f.type.startsWith('video/') || f.type.startsWith('image/'));
        const audioFiles = files.filter(f => f.type.startsWith('audio/'));

        const newClips = [];
        for (const file of audioFiles) {
            const url = URL.createObjectURL(file);
            const metadata = await new Promise(r => {
                const a = document.createElement('audio');
                a.src = url; a.onloadedmetadata = () => r({ duration: a.duration });
            });
            newClips.push({
                id: `audio_${Math.random().toString(36).substr(2, 9)}`,
                name: file.name, url, duration: metadata.duration,
                startPosition: currentTime * 100, trackIndex: -1, type: 'audio', volume: 1
            });
        }
        for (const file of mediaFiles) {
            const url = URL.createObjectURL(file);
            const isVideo = file.type.startsWith('video/');
            const primaryId = `clip_${Math.random().toString(36).substr(2, 9)}`;
            const clip = {
                id: primaryId, url, type: isVideo ? 'video' : 'image',
                duration: 5, startPosition: currentTime * 100, name: file.name,
                x: 10, y: 10, width: 80, height: 80, hasPopIn: true, muted: isVideo,
                trackIndex: 0 // Default to first track
            };
            newClips.push(clip);

            if (isVideo) {
                newClips.push({
                    id: `audio_${Math.random().toString(36).substr(2, 9)}`,
                    name: `${file.name.substring(0, 15)} Audio`,
                    url, duration: 5,
                    startPosition: currentTime * 100, trackIndex: -1, type: 'audio', volume: 1
                });
            }
            handleUploadToAI(file, primaryId);
        }
        addClips(newClips);
        if (newClips.length > 0) setActiveClipId(newClips[0].id);
    };

    const handleAddText = (text) => {
        const id = `text_${Math.random().toString(36).substr(2, 9)}`;
        
        // Smart tracking for text too
        const startPos = Math.max(0, currentTime * 100);
        const tracksAtTime = clips.filter(c => 
            (c.startPosition < startPos + 500) && 
            (c.startPosition + c.duration * 100 > startPos)
        ).map(c => c.trackIndex);
        const nextTrack = tracksAtTime.length > 0 ? Math.max(...tracksAtTime) + 1 : 1;

        const newClip = {
            id,
            name: 'Text',
            type: 'text',
            text: text || 'New Text',
            startPosition: startPos,
            duration: 5,
            trackIndex: -2, // Text Track
            opacity: 100,
            cssFilter: '',
            fontSize: 48, color: '#ffffff',
            fontFamily: 'Inter', fontWeight: 'bold',
            x: 10, y: 70, width: 80, height: 20
        };
        addClips([newClip]);
        setActiveClipId(id);
        setSelectedTextClip(newClip);
        setTextPromptOpen(false);
    };

    const splitAtPlayhead = () => {
        const activeClip = clips.find(c => c.id === activeClipId);
        if (activeClip) splitClip(activeClip.id, currentTime);
        else alert('Select a clip first to split it.');
    };


    const handleUpdateClip = (id, updates) => {
        if (updates.isDeleted) {
            deleteClip(id);
            if (activeClipId === id) setActiveClipId(null);
            if (selectedTextClip?.id === id) setSelectedTextClip(null);
            return;
        }
        setClips(prev => {
            const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
            const updated = next.find(c => c.id === id);
            if (updated?.type === 'text' && selectedTextClip?.id === id) {
                setSelectedTextClip(updated);
            }
            return next;
        });
        setActiveClipId(id);
    };

    const handleUpdateClips = (updates) => {
        setClips(prev => prev.map(c => ({ ...c, ...updates })));
    };

    const handleExport = async () => {
        if (clips.length === 0) { alert("No clips on timeline to export!"); return; }
        setIsExporting(true);
        
        let isLandscape = true;
        const baseVideo = clips.find(c => c.type === 'video' && c.trackIndex <= 0);
        const baseImage = clips.find(c => c.type === 'image' && c.trackIndex <= 0);
        
        try {
            if (baseVideo) {
                const videoEl = document.createElement('video');
                videoEl.src = baseVideo.url;
                await new Promise((resolve) => {
                    videoEl.onloadedmetadata = () => resolve();
                    videoEl.onerror = () => resolve();
                });
                if (videoEl.videoWidth && videoEl.videoHeight) {
                    isLandscape = videoEl.videoWidth >= videoEl.videoHeight;
                }
            } else if (baseImage) {
                const imgEl = new Image();
                imgEl.src = baseImage.url;
                await new Promise((resolve) => {
                    imgEl.onload = () => resolve();
                    imgEl.onerror = () => resolve();
                });
                if (imgEl.naturalWidth && imgEl.naturalHeight) {
                    isLandscape = imgEl.naturalWidth >= imgEl.naturalHeight;
                }
            } else {
                isLandscape = window.innerWidth > window.innerHeight;
            }
        } catch(e) { console.warn('Could not determine media aspect ratio', e); }

        const exportWidth = isLandscape ? 1920 : 1080;
        const exportHeight = isLandscape ? 1080 : 1920;

        try {
            const response = await fetch('http://localhost:8000/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clips: clips.map(c => ({
                        id: c.id, type: c.type, name: c.name,
                        startPosition: c.startPosition, duration: c.duration,
                        x: c.x || 0, y: c.y || 0, width: c.width || 100, height: c.height || 100,
                        muted: c.muted, hasPopIn: c.hasPopIn, hasBorder: c.hasBorder,
                        cssFilter: c.cssFilter, opacity: c.opacity || 100, text: c.text,
                        videoOffset: c.videoOffset || 0, volume: c.volume || 100,
                        trackIndex: c.trackIndex || 0,
                        transform: c.transform, crop: c.crop
                    })),
                    settings: { width: exportWidth, height: exportHeight, fps: 30 }
                })
            });
            if (response.ok) {
                const data = await response.json();
                const filename = data.url.split('/').pop() || 'vedit_export.mp4';
                const downloadUrl = `http://localhost:8000/api/download/${filename}`;
                
                // Open natively pointing to the explicit download API
                window.open(downloadUrl, '_blank');
                
            } else {
                const err = await response.json(); alert(`Export failed: ${err.detail}`);
            }
        } catch (e) { alert(`Export failed: ${e.message}`); }
        finally { setIsExporting(false); }
    };

    useImperativeHandle(ref, () => ({
        handleImportClick: handleUploadClick,
        handleImportOverlay: handleImportOverlayClick,
        handleExport, undo, redo, canUndo, canRedo,
        setActiveOverlay, setActiveClipId, onUpdateClip: handleUpdateClip,
        onUpdateClips: handleUpdateClips,
        getClips: () => clips,
        setClips: (c) => setClips(c),
        getActiveClipId: () => activeClipId,
        splitAtPlayhead, addTextClip: handleAddText,
        handleImportImage: handleUploadClick,
        handleImportAudio: handleAudioUploadClick,
    }));

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault(); e.shiftKey ? redo() : undo();
            }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (activeClipId) {
                    deleteClip(activeClipId);
                    setActiveClipId(null);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    const handleClipClick = (clipId) => {
        setActiveClipId(clipId);
        const clip = clips.find(c => c.id === clipId);
        if (clip) {
            seek(clip.startPosition / 100);
            if (clip.type === 'text') setSelectedTextClip(clip);
            else setSelectedTextClip(null);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-950 overflow-hidden relative"
             onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            
            {isExporting && (
                <div className="fixed inset-0 bg-black/80 z-[1000] flex flex-col items-center justify-center backdrop-blur-md">
                    <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mb-4" />
                    <h2 className="text-2xl font-bold text-white">Exporting Video...</h2>
                    <p className="text-gray-400 mt-2">Hold tight, we're rendering your masterpiece in the cloud.</p>
                </div>
            )}

            {isDraggingOver && (
                <div className="absolute inset-0 z-[100] bg-indigo-500/20 border-4 border-dashed border-indigo-500 flex items-center justify-center pointer-events-none">
                    <h2 className="text-2xl font-bold text-white">Drop Media Here</h2>
                </div>
            )}

            <input ref={fileInputRef} type="file" accept="video/*,image/*" multiple className="hidden" onChange={handleFileSelect} />
            <input ref={audioInputRef} type="file" accept="audio/*" multiple className="hidden" onChange={handleAudioSelect} />

            <div className="flex-1 flex flex-col min-h-0 relative">
                {showTextToolbar && (
                    <TextToolbar onAddText={handleAddText} selectedTextClip={selectedTextClip} onUpdateTextClip={handleUpdateClip} />
                )}
                
                <button 
                    onClick={() => setShowTextToolbar(!showTextToolbar)}
                    className="absolute top-4 right-4 z-[50] p-2 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-xl text-gray-400 hover:text-white transition-all shadow-lg"
                    title={showTextToolbar ? "Hide Toolbar" : "Show Toolbar"}
                >
                    <Type size={18} />
                </button>

                <VideoPreview
                    currentVideo={currentVideo} videoRef={videoRef} isPlaying={isPlaying}
                    handlePlayPause={togglePlayPause} currentTime={currentTime} duration={duration}
                    handleUploadClick={handleUploadClick} clips={clips}
                    onUpdateClip={handleUpdateClip}
                    onUpdateClips={handleUpdateClips}
                    activeClipId={activeClipId} activeOverlay={activeOverlay}
                    onCloseOverlay={() => setActiveOverlay(null)}
                />

                {textPromptOpen && (
                    <div className="absolute inset-0 z-[60] bg-black/70 flex items-center justify-center p-6">
                        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-72 shadow-2xl">
                            <h3 className="text-sm font-bold text-white mb-4">Add Text</h3>
                            <input autoFocus type="text" id="text-input" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white mb-4" />
                            <div className="flex gap-2">
                                <button onClick={() => setTextPromptOpen(false)} className="flex-1 py-2 text-gray-400">Cancel</button>
                                <button onClick={() => { handleAddText(document.getElementById('text-input').value); setTextPromptOpen(false); }} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl">Add</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="h-16 border-t border-gray-800 bg-gray-950 flex items-center justify-center gap-8 px-4 flex-shrink-0">
                    <button className="text-gray-400 hover:text-white" onClick={() => seek(Math.max(0, currentTime - 5))}><SkipBack /></button>
                    <button className="p-4 bg-white text-black rounded-full" onClick={togglePlayPause}>
                        {isPlaying ? <Pause /> : <Play className="ml-1" />}
                    </button>
                    <button className="text-gray-400 hover:text-white" onClick={() => seek(Math.min(duration, currentTime + 5))}><SkipForward /></button>
                </div>
            </div>

            <div className="h-1.5 flex-shrink-0 cursor-row-resize hover:bg-indigo-500 bg-gray-800" onMouseDown={() => setIsDraggingTimeline(true)} />

            <div style={{ height: `${timelineHeight}px` }} className="flex-shrink-0 flex flex-col bg-gray-950 relative overflow-hidden">
                <Timeline 
                    zoom={zoom} setZoom={setZoom} clips={clips} currentVideo={currentVideo}
                    activeClip={clips.find(c => c.id === activeClipId)} 
                    activeClipId={activeClipId}
                    currentTime={currentTime} duration={duration}
                    onClipClick={handleClipClick} onClipMouseDown={handleClipMouseDown}
                    onClipResizeMouseDown={handleResizeMouseDown} onSeek={seek} timelineRef={timelineRef}
                    handleUploadClick={handleUploadClick} handleAudioUpload={handleAudioUploadClick}
                    onSplit={splitAtPlayhead}
                    onDelete={() => {
                        const activeClip = clips.find(c => c.id === activeClipId);
                        if (activeClip) deleteClip(activeClip.id);
                    }}
                />
            </div>
        </div>
    );
});

export default VideoEditor;
