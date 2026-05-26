import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Crop, Move, X, Check } from 'lucide-react';
import { Rnd } from 'react-rnd';

// ─── Crop Overlay ───────────────────────────────────────────────────
const ASPECTS = [
    { label: 'Original', value: 'free', icon: '⧉' },
    { label: '9:16', value: '9/16', icon: '📱' },
    { label: '1:1', value: '1/1', icon: '📸' },
    { label: '16:9', value: '16/9', icon: '📺' },
    { label: '4:5', value: '4/5', icon: '🖼️' },
    { label: '2:3', value: '2/3', icon: '📄' },
    { label: '4:3', value: '4/3', icon: '🖥️' },
    { label: '3:4', value: '3/4', icon: '📐' },
];

const CropOverlay = ({ clip, onApply, onClose }) => {
    const [aspect, setAspect] = useState(clip?.crop?.aspect || 'free');
    return (
        <div className="absolute inset-0 z-50 bg-black/75 flex items-center justify-center backdrop-blur-sm px-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 w-72 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Crop className="w-4 h-4 text-indigo-400" /> Transform & Style
                    </h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                </div>
                
                <p className="text-[10px] text-gray-500 mb-4 uppercase tracking-widest font-bold">Manual Overlay Controls</p>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <button onClick={() => onApply({ hasBorder: !clip?.hasBorder })}
                            className={`flex-1 py-2 rounded-xl text-xs border transition-all ${clip?.hasBorder ? 'bg-white text-black border-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                            {clip?.hasBorder ? '✅ White Border' : '⬜ Add Border'}
                        </button>
                        <button onClick={() => onApply({ hasPopIn: !clip?.hasPopIn })}
                            className={`flex-1 py-2 rounded-xl text-xs border transition-all ${clip?.hasPopIn ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                            {clip?.hasPopIn ? '✅ Pop-In Hook' : '🚀 Pop-In Effect'}
                        </button>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-[10px] text-gray-500 mb-3 uppercase tracking-widest font-bold">Aspect Ratio (Main Stage)</p>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {ASPECTS.map(a => (
                            <button key={a.value} onClick={() => { setAspect(a.value); onApply({ aspect: a.value }); }}
                                className={`p-1.5 flex flex-col items-center justify-center rounded-lg text-[10px] font-medium border transition-all ${
                                    aspect === a.value
                                        ? 'bg-white text-black border-white'
                                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-white/40'
                                }`}>
                                <span className="text-sm mb-0.5">{a.icon}</span>
                                {a.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { onApply({ aspect: 'free' }); onClose(); }}
                            className="flex-1 py-2 rounded-xl text-xs text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors">Reset</button>
                        <button onClick={onClose}
                            className="flex-1 py-2 rounded-xl text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-1">
                            <Check className="w-3 h-3" /> Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Transform Overlay ─────────────────────────────────────────────
const TransformOverlay = ({ clip, onApply, onClose }) => {
    const t = clip?.transform || {};
    const [rotation, setRotation] = useState(t.rotation ?? 0);
    const [scale, setScale] = useState(t.scale ?? 100);
    const [flipH, setFlipH] = useState(t.flipH ?? false);
    const [flipV, setFlipV] = useState(t.flipV ?? false);

    const apply = (updates) => {
        const next = { rotation, scale, flipH, flipV, ...updates };
        onApply(next);
    };

    return (
        <div className="absolute inset-0 z-50 bg-black/75 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 w-72 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Move className="w-4 h-4 text-indigo-400" /> Transform
                    </h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Rotation</span>
                            <span className="text-indigo-300 font-mono">{rotation}°</span>
                        </div>
                        <input type="range" min="-180" max="180" value={rotation}
                            onChange={e => { const v = Number(e.target.value); setRotation(v); apply({ rotation: v }); }}
                            className="w-full accent-indigo-500 cursor-pointer" />
                        <div className="flex gap-1 mt-1.5">
                            {[-90, 0, 90, 180].map(r => (
                                <button key={r} onClick={() => { setRotation(r); apply({ rotation: r }); }}
                                    className={`flex-1 py-1 rounded-lg text-[10px] border transition-all ${rotation === r ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-indigo-500/60'}`}>
                                    {r}°
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Scale</span>
                            <span className="text-indigo-300 font-mono">{scale}%</span>
                        </div>
                        <input type="range" min="10" max="200" value={scale}
                            onChange={e => { const v = Number(e.target.value); setScale(v); apply({ scale: v }); }}
                            className="w-full accent-indigo-500 cursor-pointer" />
                    </div>
                    <div>
                        <span className="text-xs text-gray-400 block mb-1.5">Flip</span>
                        <div className="flex gap-2">
                            <button onClick={() => { const v = !flipH; setFlipH(v); apply({ flipH: v }); }}
                                className={`flex-1 py-2 rounded-xl text-xs border transition-all ${flipH ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-indigo-500/60'}`}>
                                ↔ Horizontal
                            </button>
                            <button onClick={() => { const v = !flipV; setFlipV(v); apply({ flipV: v }); }}
                                className={`flex-1 py-2 rounded-xl text-xs border transition-all ${flipV ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-indigo-500/60'}`}>
                                ↕ Vertical
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button onClick={() => { const def = { rotation: 0, scale: 100, flipH: false, flipV: false }; setRotation(0); setScale(100); setFlipH(false); setFlipV(false); onApply(def); }}
                        className="flex-1 py-2 rounded-xl text-xs text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors">Reset</button>
                    <button onClick={onClose}
                        className="flex-1 py-2 rounded-xl text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" /> Done
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Overlay Effects Panel ─────────────────────────────────────────
const OVERLAY_EFFECTS = [
    { label: 'None', filter: 'none', icon: '⚪' },
    { label: 'Grayscale', filter: 'grayscale(1)', icon: '🎞️' },
    { label: 'Sepia', filter: 'sepia(0.8)', icon: '🟤' },
    { label: 'Blur', filter: 'blur(4px)', icon: '🌫️' },
    { label: 'Warm', filter: 'sepia(0.4) saturate(1.6) brightness(1.05)', icon: '🌅' },
    { label: 'Cool', filter: 'hue-rotate(180deg) saturate(0.8)', icon: '🧊' },
    { label: 'Vivid', filter: 'saturate(2) contrast(1.1)', icon: '🌈' },
    { label: 'Dark', filter: 'brightness(0.6) contrast(1.3)', icon: '🌑' },
];

const OverlaysPanel = ({ clip, onApply, onClose }) => (
    <div className="absolute inset-0 z-50 bg-black/75 flex items-center justify-center backdrop-blur-sm px-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 w-72 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">🎨 Video Effects</h3>
                <button onClick={onClose} className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {OVERLAY_EFFECTS.map(o => (
                    <button key={o.label}
                        onClick={() => { onApply(o.filter); }}
                        className={`p-3 border rounded-xl text-xs flex items-center gap-2 transition-all ${
                            clip?.cssFilter === o.filter
                                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-500/60 hover:bg-indigo-900/20'
                        }`}>
                        <span>{o.icon}</span>{o.label}
                    </button>
                ))}
            </div>
            <button onClick={onClose} className="w-full mt-3 py-2 rounded-xl text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors">Done</button>
        </div>
    </div>
);

// ─── Transitions Panel ───────────────────────────────────────────
const TRANSITIONS = [
    { label: 'None', value: 'none', icon: '🚫' },
    { label: 'Fade In/Out', value: 'fade', icon: '🌫️' },
    { label: 'Scale Up/Down', value: 'scale', icon: '🔍' },
    { label: 'Slide In/Out', value: 'slide', icon: '⬅️' },
];

const TransitionsPanel = ({ clip, onApply, onClose }) => (
    <div className="absolute inset-0 z-50 bg-black/75 flex items-center justify-center backdrop-blur-sm px-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 w-72 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">🔄 Quick Transitions</h3>
                <button onClick={onClose} className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-[10px] text-gray-500 mb-3 uppercase tracking-widest font-bold">Apply to both IN and OUT</p>
            <div className="grid grid-cols-2 gap-2">
                {TRANSITIONS.map(t => (
                    <button key={t.value}
                        onClick={() => { onApply({ transitionIn: t.value, transitionOut: t.value }); }}
                        className={`p-3 border rounded-xl text-xs flex flex-col items-center gap-1.5 transition-all ${
                            clip?.transitionIn === t.value
                                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-500/60 hover:bg-indigo-900/20'
                        }`}>
                        <span className="text-xl">{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>
            <button onClick={onClose} className="w-full mt-4 py-2 rounded-xl text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg">Done</button>
        </div>
    </div>
);

const VideoElement = ({ url, currentTime, isPlaying, muted, startPosition, videoOffset = 0, aspect, playbackRate = 1.0, hasBorder = false }) => {
    const videoRef = useRef(null);
    const clipTime = (((currentTime * 100 - startPosition) / 100) * playbackRate) + videoOffset;

    useEffect(() => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        
        if (video.playbackRate !== playbackRate) {
            video.playbackRate = Math.max(0.1, playbackRate);
        }

        // Parallel Sync with drift compensation
        if (clipTime >= 0) {
            const drift = Math.abs(video.currentTime - clipTime);
            if (drift > 0.5) {
                video.currentTime = clipTime;
            }
            
            if (isPlaying) {
                if (video.paused) {
                    video.play().catch(err => console.debug("Video play deferred:", err));
                }
            } else {
                if (!video.paused) video.pause();
            }
        } else {
            if (!video.paused) {
                video.pause();
                video.currentTime = 0;
            }
        }
    }, [currentTime, isPlaying, clipTime]);

    return (
        <video 
            ref={videoRef}
            src={url} 
            className={`w-full h-full pointer-events-none ${(aspect && aspect !== 'free') || hasBorder ? 'object-cover' : 'object-contain'}`} 
            muted={muted}
            playsInline
        />
    );
};

// ─── Main VideoPreview ─────────────────────────────────────────────
const VideoPreview = ({
    currentVideo,
    videoRef,
    isPlaying,
    handlePlayPause,
    currentTime,
    duration,
    handleUploadClick,
    clips = [],
    onUpdateClip,
    activeOverlay,
    onCloseOverlay,
    activeClipId,
}) => {
    const playerWrapperRef = useRef(null);
    const [playerSize, setPlayerSize] = useState({ width: 800, height: 450 });
    const [draggedTextId, setDraggedTextId] = useState(null);

    useEffect(() => {
        if (!playerWrapperRef.current) return;
        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setPlayerSize({ width, height });
            }
        });
        observer.observe(playerWrapperRef.current);
        return () => observer.disconnect();
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isClipActive = (clip) => {
        const start = clip.startPosition / 100;
        return start <= currentTime && (start + clip.duration) >= currentTime;
    };

    const activeClips = clips.filter(isClipActive);
    const liveActiveClip = clips.find(c => c.id === activeClipId) || null;

    const getClipStyle = (clip) => {
        const start = clip.startPosition / 100;
        const end = start + clip.duration;
        const transDur = 0.5;
        const clipTime = currentTime - start;

        const baseOpacity = (clip.opacity !== undefined ? clip.opacity : 100) / 100;
        let transOpacity = 1;
        let transTranslateY = 0;
        let transTranslateX = 0;
        let scaleProgress = 1;

        if (currentTime >= start && currentTime < start + transDur && clip.transitionIn && clip.transitionIn !== 'none') {
            const progress = (currentTime - start) / transDur;
            if (clip.transitionIn === 'fade') {
                transOpacity = progress;
            } else if (clip.transitionIn === 'scale') {
                transOpacity = progress;
                scaleProgress = 0.5 + 0.5 * progress;
            } else if (clip.transitionIn === 'slide') {
                transTranslateX = -100 * (1 - progress); // slide in from left side
            }
        } else if (currentTime > end - transDur && currentTime <= end && clip.transitionOut && clip.transitionOut !== 'none') {
            const progress = (end - currentTime) / transDur;
            if (clip.transitionOut === 'fade') {
                transOpacity = progress;
            } else if (clip.transitionOut === 'scale') {
                transOpacity = progress;
                scaleProgress = 0.5 + 0.5 * progress;
            } else if (clip.transitionOut === 'slide') {
                transTranslateX = 100 * (1 - progress); // slide out to right side
            }
        }

        const t = clip.transform || {};
        const rot = t.rotation || 0;
        let scaleX = (t.scale !== undefined ? t.scale : 100) / 100.0;
        let scaleY = scaleX;
        
        if (t.flipH) scaleX *= -1;
        if (t.flipV) scaleY *= -1;

        // Apply scale transitions
        scaleX *= scaleProgress;
        scaleY *= scaleProgress;

        if (clip.hasPopIn && clipTime < 0.5) {
            const progress = clipTime / 0.5;
            const popScale = 0.5 + 0.5 * progress;
            scaleX *= popScale;
            scaleY *= popScale;
        }

        const combinedTransform = `translate(${transTranslateX}%, ${transTranslateY}%) rotate(${rot}deg) scale(${scaleX}, ${scaleY})`;

        return {
            filter: clip.cssFilter || 'none',
            opacity: baseOpacity * transOpacity,
            mixBlendMode: clip.blendMode || 'normal',
            border: clip.hasBorder ? '4px solid white' : 'none',
            boxShadow: clip.hasBorder ? '0 10px 30px rgba(0,0,0,0.5)' : 'none',
            transform: combinedTransform,
            transition: 'filter 0.2s ease',
            pointerEvents: 'none'
        };
    };

    const handleToggleMute = (e) => {
        e.stopPropagation();
        if (liveActiveClip && liveActiveClip.type === 'video' && onUpdateClip) {
            onUpdateClip(liveActiveClip.id, { muted: !liveActiveClip.muted });
        }
    };

    return (
        <div className="flex-1 bg-black/40 flex items-center justify-center p-4 relative overflow-hidden">
            <div
                ref={playerWrapperRef}
                className="relative bg-black shadow-2xl overflow-hidden group border border-white/10"
                style={{ 
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000'
                }}
            >
                <div className="absolute inset-0 bg-black/50" />

                {/* Unified Media Layer (Track 0 to N). Text guaranteed on top. */}
                {activeClips
                    .filter(c => c.type !== 'audio')
                    .sort((a,b) => {
                        const layerA = a.type === 'text' ? 999 : (a.trackIndex || 0);
                        const layerB = b.type === 'text' ? 999 : (b.trackIndex || 0);
                        return layerA - layerB;
                    })
                    .map(clip => {
                    const style = getClipStyle(clip);
                    const isBase = (clip.trackIndex || 0) === 0;
                    
                    const pX = (clip.x ?? 0) / 100 * playerSize.width;
                    const pY = (clip.y ?? 0) / 100 * playerSize.height;
                    const pW = (clip.width ?? 100) / 100 * playerSize.width;
                    const pH = (clip.height ?? 'auto') === 'auto' ? 'auto' : (typeof clip.height === 'string' ? clip.height : (clip.height / 100 * playerSize.height));

                    return (
                        <Rnd
                            key={clip.id}
                            className={`z-10 ${activeClipId === clip.id ? 'outline outline-2 outline-indigo-500 shadow-2xl' : 'hover:outline hover:outline-1 hover:outline-white/20'} flex items-center justify-center group`}
                            size={{ width: pW, height: pH }}
                            position={{ x: pX, y: pY }}
                            lockAspectRatio={clip.crop?.aspect && clip.crop.aspect !== 'free' ? (Number(clip.crop.aspect.split('/')[0]) / Number(clip.crop.aspect.split('/')[1])) : false}
                            onDragStop={(e, d) => {
                                onUpdateClip(clip.id, {
                                    x: (d.x / playerSize.width) * 100,
                                    y: (d.y / playerSize.height) * 100
                                });
                            }}
                            onResizeStop={(e, dir, ref, delta, pos) => {
                                onUpdateClip(clip.id, {
                                    width: (ref.offsetWidth / playerSize.width) * 100,
                                    height: (ref.offsetHeight / playerSize.height) * 100,
                                    x: (pos.x / playerSize.width) * 100,
                                    y: (pos.y / playerSize.height) * 100
                                });
                            }}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (window.confirm(`Delete this ${clip.type}?`)) {
                                    onUpdateClip(clip.id, { isDeleted: true });
                                }
                            }}
                            bounds="parent"
                            onClick={(e) => { e.stopPropagation(); setActiveClipId(clip.id); }}
                            style={{ zIndex: clip.type === 'text' ? 50 : 10 + (clip.trackIndex || 0) }}
                        >
                            <div className="w-full h-full relative overflow-hidden" style={style}>
                                {clip.type === 'text' ? (
                                    <div 
                                        className="w-full h-full flex items-center justify-center p-2 text-center break-words select-none"
                                        style={{ 
                                            fontFamily: clip.fontFamily || 'Inter, sans-serif',
                                            fontSize: `${clip.fontSize || 48}px`,
                                            color: clip.color || '#fff',
                                            fontWeight: clip.fontWeight || 'normal',
                                            fontStyle: clip.fontStyle || 'normal',
                                            textShadow: clip.textShadow || '0 4px 15px rgba(0,0,0,0.8)',
                                            WebkitTextStroke: clip.textStroke || 'none',
                                            backgroundColor: clip.textBgColor || 'transparent',
                                            padding: clip.textBgColor ? '10px 20px' : '0',
                                            borderRadius: clip.textBgColor ? '12px' : '0',
                                            lineHeight: 1.2
                                        }}
                                    >
                                        {clip.text}
                                    </div>
                                ) : clip.type === 'image' ? (
                                    <img src={clip.url} className={`w-full h-full pointer-events-none ${clip.crop?.aspect && clip.crop.aspect !== 'free' ? 'object-cover' : 'object-contain'}`} alt="Clip" />
                                ) : (
                                    <VideoElement 
                                        url={clip.url} 
                                        currentTime={currentTime} 
                                        isPlaying={isPlaying} 
                                        muted={clip.muted}
                                        startPosition={clip.startPosition}
                                        videoOffset={clip.videoOffset || 0}
                                        aspect={clip.crop?.aspect}
                                        playbackRate={clip.playbackRate || 1.0}
                                        hasBorder={clip.hasBorder}
                                    />
                                )}
                            </div>
                        </Rnd>
                    );
                })}

                {activeOverlay === 'crop' && (
                    <CropOverlay
                        clip={liveActiveClip}
                        onApply={(data) => {
                            if (!liveActiveClip) return;
                            const next = { crop: { ...(liveActiveClip.crop || {}), ...data } };
                            
                            // Adjust Rnd boundaries automatically based on the selected aspect ratio
                            if (data.aspect && data.aspect !== 'free') {
                                const [n, d] = data.aspect.split('/').map(Number);
                                const targetRatio = n / d;
                                const screenRatio = playerSize.width / playerSize.height;

                                let wPc = 100;
                                let hPc = 100;

                                if (targetRatio > screenRatio) {
                                    // wider than canvas, bound by width
                                    wPc = 100;
                                    hPc = (playerSize.width / targetRatio) / playerSize.height * 100;
                                } else {
                                    // taller than canvas, bound by height
                                    hPc = 100;
                                    wPc = (playerSize.height * targetRatio) / playerSize.width * 100;
                                }

                                next.width = wPc;
                                next.height = hPc;
                                next.x = (100 - wPc) / 2;
                                next.y = (100 - hPc) / 2;
                            } else if (data.aspect === 'free') {
                                // Default back to matching the canvas perfectly
                                next.width = 100;
                                next.height = 100;
                                next.x = 0;
                                next.y = 0;
                            }
                            
                            onUpdateClip(liveActiveClip.id, next);
                        }}
                        onClose={onCloseOverlay}
                    />
                )}
                {activeOverlay === 'transform' && (
                    <TransformOverlay
                        clip={liveActiveClip}
                        onApply={(data) => liveActiveClip && onUpdateClip(liveActiveClip.id, { transform: data })}
                        onClose={onCloseOverlay}
                    />
                )}
                {activeOverlay === 'overlays' && (
                    <OverlaysPanel
                        clip={liveActiveClip}
                        onApply={(filter) => liveActiveClip && onUpdateClip(liveActiveClip.id, { cssFilter: filter })}
                        onClose={onCloseOverlay}
                    />
                )}
                {activeOverlay === 'transitions' && (
                    <TransitionsPanel
                        clip={liveActiveClip}
                        onApply={(data) => liveActiveClip && onUpdateClip(liveActiveClip.id, data)}
                        onClose={onCloseOverlay}
                    />
                )}

                {clips.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/85 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-40">
                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                                <button onClick={handlePlayPause} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                </button>
                                <span className="font-mono text-xs">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {liveActiveClip && liveActiveClip.type === 'video' && (
                                    <button onClick={handleToggleMute} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                        {liveActiveClip.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                    </button>
                                )}
                                <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                    <Maximize className="w-4 h-4" />
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
