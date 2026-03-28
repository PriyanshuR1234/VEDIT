import React from 'react';
import { SlidersHorizontal, Settings2, Info, Crop, Move, Box, Sparkles } from 'lucide-react';

const PropertiesPanel = ({ activeClip, onUpdateClip, onUpdateClips, onOpenOverlay }) => {
    if (!activeClip) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="p-4 bg-gray-900 rounded-full">
                    <Info className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-400">No Clip Selected</h3>
                <p className="text-xs text-gray-500 max-w-[200px]">Select a clip on the timeline or preview to edit its properties.</p>
            </div>
        );
    }

    const handleChange = (key, value) => {
        if (onUpdateClip) {
            onUpdateClip(activeClip.id, { [key]: value });
        }
    };

    const opacity = activeClip.opacity !== undefined ? activeClip.opacity : 100;
    const volume = activeClip.volume !== undefined ? Math.round(activeClip.volume * 100) : 100;
    const blendMode = activeClip.blendMode || 'normal';

    // Local state for smooth dragging
    const [localOpacity, setLocalOpacity] = React.useState(opacity);
    const [localVolume, setLocalVolume] = React.useState(volume);

    React.useEffect(() => {
        setLocalOpacity(opacity);
    }, [opacity]);

    React.useEffect(() => {
        setLocalVolume(volume);
    }, [volume]);

    const handleOpacityChange = (e) => {
        const val = parseInt(e.target.value);
        setLocalOpacity(val);
        handleChange('opacity', val);
    };

    const handleVolumeChange = (e) => {
        const val = parseInt(e.target.value);
        setLocalVolume(val);
        handleChange('volume', val / 100);
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold text-white uppercase">
                        {activeClip.type?.[0] || 'C'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white truncate">{activeClip.name}</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{activeClip.type} Clip</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 relative group/prop">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-medium text-gray-300">Opacity</h3>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onUpdateClips && onUpdateClips({ opacity: activeClip.opacity })}
                        className="text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded transition-all opacity-0 group-hover/prop:opacity-100"
                        title="Apply to all clips"
                    >
                        Apply All
                    </button>
                    <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">{opacity}%</span>
                </div>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={localOpacity}
                onChange={handleOpacityChange}
                className="w-full accent-indigo-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer" 
              />
            </div>

            {(activeClip.type === 'video' || activeClip.type === 'audio') && (
                <div className="space-y-4 relative group/prop">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-medium text-gray-300">Volume</h3>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => onUpdateClips && onUpdateClips({ volume: activeClip.volume })}
                            className="text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded transition-all opacity-0 group-hover/prop:opacity-100"
                            title="Apply to all clips"
                        >
                            Apply All
                        </button>
                        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">{volume}%</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={localVolume}
                    onChange={handleVolumeChange}
                    className="w-full accent-indigo-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer" 
                  />
                </div>
            )}

            {(activeClip.type === 'video' || activeClip.type === 'image' || activeClip.type === 'text') && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-300 px-1">Blend Mode</h3>
                  <select 
                    value={blendMode}
                    onChange={(e) => handleChange('blendMode', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 text-sm text-gray-300 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer capitalize"
                  >
                    <option value="normal">Normal</option>
                    <option value="multiply">Multiply</option>
                    <option value="screen">Screen</option>
                    <option value="overlay">Overlay</option>
                    <option value="darken">Darken</option>
                    <option value="lighten">Lighten</option>
                    <option value="color-dodge">Color Dodge</option>
                    <option value="color-burn">Color Burn</option>
                    <option value="hard-light">Hard Light</option>
                    <option value="soft-light">Soft Light</option>
                  </select>
                </div>
            )}

            {(activeClip.type === 'video' || activeClip.type === 'image' || activeClip.type === 'text') && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-1">In Transition</label>
                        <select 
                            value={activeClip.transitionIn || 'none'}
                            onChange={(e) => handleChange('transitionIn', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 text-xs text-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                        >
                            <option value="none">None</option>
                            <option value="fade">Fade In</option>
                            <option value="scale">Scale Up</option>
                            <option value="slide">Slide In</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-1">Out Transition</label>
                        <select 
                            value={activeClip.transitionOut || 'none'}
                            onChange={(e) => handleChange('transitionOut', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 text-xs text-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                        >
                            <option value="none">None</option>
                            <option value="fade">Fade Out</option>
                            <option value="scale">Scale Down</option>
                            <option value="slide">Slide Out</option>
                        </select>
                    </div>
                </div>
            )}

            {(activeClip.type === 'video' || activeClip.type === 'image') && (
                <div className="space-y-3 pt-4 border-t border-gray-800">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold px-1 mb-2">PiP Manual Tools</p>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleChange('hasBorder', !activeClip.hasBorder)}
                            className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${activeClip.hasBorder ? 'bg-white text-black border-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'}`}
                        >
                            <Box className="w-4 h-4" /> Border
                        </button>
                        <button 
                            onClick={() => handleChange('hasPopIn', !activeClip.hasPopIn)}
                            className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${activeClip.hasPopIn ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'}`}
                        >
                            <Sparkles className="w-4 h-4" /> Pop-In
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => onOpenOverlay && onOpenOverlay('crop')}
                            className="flex-1 py-3 bg-gray-900 border border-gray-800 text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                        >
                            <Crop className="w-4 h-4" /> Crop
                        </button>
                        <button 
                            onClick={() => onOpenOverlay && onOpenOverlay('transform')}
                            className="flex-1 py-3 bg-gray-900 border border-gray-800 text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                        >
                            <Move className="w-4 h-4" /> Mesh Transform
                        </button>
                    </div>
                </div>
            )}

            <button className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-gray-800 text-gray-300 text-sm font-medium border border-gray-800 hover:border-gray-700 rounded-xl transition-all group">
              <SlidersHorizontal className="w-4 h-4 text-gray-400 group-hover:text-white" />
              Advanced Color Grading
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-gray-800 text-gray-300 text-sm font-medium border border-gray-800 hover:border-gray-700 rounded-xl transition-all group">
              <Settings2 className="w-4 h-4 text-gray-400 group-hover:text-white" />
              Audio Effects
            </button>
        </div>
    );
};

export default PropertiesPanel;
