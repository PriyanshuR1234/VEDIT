import React, { useState, useRef, useCallback } from 'react';
import {
    Scissors, Type, Music, Image as ImageIcon, Video,
    Layers, LayoutTemplate, Wand2, Subtitles,
    SplitSquareHorizontal, Move, Crop, ChevronRight,
    Upload, X, Check, Plus, Minus, RotateCw, FlipHorizontal, FlipVertical,
    ArrowRightLeft, Sparkles
} from 'lucide-react';

// ─── Crop Overlay Panel ─────────────────────────────
const CropPanel = ({ onClose, onApply }) => {
    const [aspect, setAspect] = useState('free');
    const ASPECTS = [
        { label: 'Free', value: 'free' },
        { label: '16:9', value: '16/9' },
        { label: '9:16', value: '9/16' },
        { label: '1:1', value: '1/1' },
        { label: '4:3', value: '4/3' },
        { label: '3:4', value: '3/4' },
    ];

    return (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-6">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-xs shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Crop className="w-4 h-4 text-indigo-400" /> Crop Video
                    </h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-xs text-gray-400 mb-4">Select aspect ratio to crop this clip.</p>
                <div className="grid grid-cols-3 gap-2 mb-5">
                    {ASPECTS.map(a => (
                        <button
                            key={a.value}
                            onClick={() => setAspect(a.value)}
                            className={`p-2 rounded-lg text-xs font-medium transition-all border ${
                                aspect === a.value
                                    ? 'bg-indigo-600 border-indigo-500 text-white'
                                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-600/60 hover:bg-indigo-900/20'
                            }`}
                        >
                            {a.label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2 rounded-xl text-xs text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors">Cancel</button>
                    <button
                        onClick={() => { onApply(aspect); onClose(); }}
                        className="flex-1 py-2 rounded-xl text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-1"
                    >
                        <Check className="w-3 h-3" /> Apply Crop
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Transform Panel ─────────────────────────────────
const TransformPanel = ({ onClose, onApply }) => {
    const [rotation, setRotation] = useState(0);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
    const [scale, setScale] = useState(100);

    return (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-6">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-xs shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Move className="w-4 h-4 text-indigo-400" /> Transform
                    </h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">Rotation: {rotation}°</label>
                        <input
                            type="range" min="-180" max="180" value={rotation}
                            onChange={e => setRotation(Number(e.target.value))}
                            className="w-full accent-indigo-500"
                        />
                        <div className="flex gap-2 mt-2">
                            {[-90, 0, 90, 180].map(r => (
                                <button key={r} onClick={() => setRotation(r)}
                                    className={`flex-1 py-1 rounded-lg text-xs border transition-all ${rotation === r ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-600/60'}`}>
                                    {r}°
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">Scale: {scale}%</label>
                        <input
                            type="range" min="10" max="200" value={scale}
                            onChange={e => setScale(Number(e.target.value))}
                            className="w-full accent-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">Flip</label>
                        <div className="flex gap-2">
                            <button onClick={() => setFlipH(h => !h)}
                                className={`flex-1 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 border transition-all ${flipH ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-600/60'}`}>
                                <FlipHorizontal className="w-3 h-3" /> Horizontal
                            </button>
                            <button onClick={() => setFlipV(v => !v)}
                                className={`flex-1 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 border transition-all ${flipV ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-600/60'}`}>
                                <FlipVertical className="w-3 h-3" /> Vertical
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 mt-5">
                    <button onClick={onClose} className="flex-1 py-2 rounded-xl text-xs text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors">Cancel</button>
                    <button
                        onClick={() => { onApply({ rotation, scale, flipH, flipV }); onClose(); }}
                        className="flex-1 py-2 rounded-xl text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-1"
                    >
                        <Check className="w-3 h-3" /> Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Overlays Panel ─────────────────────────────────
const OVERLAY_EFFECTS = [
    { label: 'Blur', style: 'blur(6px)', icon: '🌫️' },
    { label: 'Grayscale', style: 'grayscale(1)', icon: '🎞️' },
    { label: 'Sepia', style: 'sepia(0.8)', icon: '🟤' },
    { label: 'Vignette', style: 'none', icon: '🕶️' },
    { label: 'Warm', style: 'sepia(0.3) saturate(1.5)', icon: '🌅' },
    { label: 'Cool', style: 'hue-rotate(180deg)', icon: '🧊' },
];

const OverlaysPanel = ({ onClose, onApply }) => (
    <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-6">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-xs shadow-2xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" /> Video Overlays
                </h3>
                <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {OVERLAY_EFFECTS.map(o => (
                    <button key={o.label}
                        onClick={() => { onApply(o); onClose(); }}
                        className="p-3 bg-gray-800 border border-gray-700 hover:border-indigo-600/60 hover:bg-indigo-900/20 rounded-xl text-xs text-gray-300 flex items-center gap-2 transition-all"
                    >
                        <span>{o.icon}</span>{o.label}
                    </button>
                ))}
            </div>
            <button onClick={onClose} className="w-full mt-4 py-2 rounded-xl text-xs text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors">Close</button>
        </div>
    </div>
);

// ─── ToolButton Component ─────────────────────────────
const ToolButton = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all group ${
            active
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-indigo-600/60 hover:bg-indigo-900/10 hover:text-white'
        }`}
    >
        <Icon className={`w-5 h-5 transition-colors ${active ? 'text-indigo-300' : 'group-hover:text-indigo-400'}`} />
        <span className="text-xs font-medium">{label}</span>
    </button>
);

// ─── ActionButton Component ─────────────────────────────
const ActionButton = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group ${
            active
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-gray-900/50 border-gray-800 text-gray-300 hover:border-indigo-600/60 hover:bg-indigo-900/10 hover:text-white'
        }`}
    >
        <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-indigo-300' : 'text-gray-400 group-hover:text-indigo-400'}`} />
        <span className="text-sm font-medium">{label}</span>
        {!active && <ChevronRight className="w-4 h-4 ml-auto text-gray-600 group-hover:text-gray-400 transition-colors" />}
    </button>
);

// ─── Main ToolsPanel ─────────────────────────────────
const ToolsPanel = ({ onToolAction, activeTool }) => {
    const audioInputRef = useRef(null);
    const imageInputRef = useRef(null);

    return (
        <div className="space-y-1 relative">
            {/* Basic Edits */}
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider pt-1 pb-3 px-1">Basic Edits</h3>
            <div className="grid grid-cols-2 gap-2.5">
                <ToolButton icon={Scissors} label="Split/Cut"
                    onClick={() => onToolAction?.('split')} />
                <ToolButton icon={Move} label="Transform"
                    onClick={() => onToolAction?.('transform')} />
                <ToolButton icon={SplitSquareHorizontal} label="Crop"
                    onClick={() => onToolAction?.('crop')} />
                <ToolButton icon={ArrowRightLeft} label="Transitions"
                    onClick={() => onToolAction?.('transitions')} />
                <ToolButton icon={Type} label="Text"
                    active={activeTool === 'text'}
                    onClick={() => onToolAction?.('text')} />
            </div>

            <div className="w-full h-px bg-gray-800 my-4" />

            {/* Media */}
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider pb-3 px-1">Media</h3>
            <div className="grid grid-cols-2 gap-2.5">
                <ToolButton icon={Video} label="Import Video"
                    onClick={() => onToolAction?.('import-video')} />
                <ToolButton icon={ImageIcon} label="Images"
                    onClick={() => imageInputRef.current?.click()} />
                <ToolButton icon={Music} label="Audio"
                    onClick={() => audioInputRef.current?.click()} />
                <ToolButton icon={Plus} label="Overlay Area"
                    onClick={() => onToolAction?.('import-overlay')} />
                <ToolButton icon={Layers} label="Overlays"
                    onClick={() => onToolAction?.('overlays')} />
            </div>

            {/* Hidden file inputs */}
            <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onToolAction?.('import-audio', file);
                    e.target.value = '';
                }}
            />
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onToolAction?.('import-image', file);
                    e.target.value = '';
                }}
            />

            <div className="w-full h-px bg-gray-800 my-4" />

            {/* Smart Tools */}
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider pb-3 px-1">Smart Tools</h3>
            <div className="space-y-2">
                <ActionButton icon={Wand2} label="Auto Remove BG"
                    onClick={() => onToolAction?.('remove-bg')} />
                <ActionButton icon={Subtitles} label="Auto Captions"
                    onClick={() => onToolAction?.('auto-captions')} />
                <ActionButton icon={LayoutTemplate} label="Smart Templates"
                    onClick={() => onToolAction?.('templates')} />
            </div>
        </div>
    );
};

export default ToolsPanel;
