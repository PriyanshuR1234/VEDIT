import React from 'react';
import { Plus, Music, Scissors, Trash2, ZoomOut, ZoomIn, RotateCcw } from 'lucide-react';

const TimelineHeader = ({
    zoom,
    setZoom,
    currentVideo,
    onSplit,
    onDelete,
    handleUploadClick,
    handleAudioUpload
}) => {
    return (
        <div className="h-12 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-4 flex-shrink-0 z-30">
            <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-gray-400">TIMELINE</span>
                <div className="h-4 w-px bg-gray-700" />
                <button
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 hover:bg-indigo-500/10 rounded-lg"
                    onClick={handleUploadClick}
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Clip
                </button>
                <button
                    className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1 hover:bg-emerald-500/10 rounded-lg"
                    onClick={handleAudioUpload}
                >
                    <Music className="w-3.5 h-3.5" />
                    Add Audio
                </button>
                <button 
                    onClick={onSplit}
                    disabled={!currentVideo}
                    className={`p-1.5 rounded-lg transition-colors flex items-center gap-2 ${currentVideo ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 cursor-not-allowed'}`}
                    title="Split Clip at Playhead"
                >
                    <Scissors className="w-4 h-4" />
                    <span className="text-xs font-medium">Split</span>
                </button>
                <button 
                    onClick={onDelete}
                    disabled={!currentVideo}
                    className={`p-1.5 rounded-lg transition-colors flex items-center gap-2 ${currentVideo ? 'text-gray-300 hover:text-red-400 hover:bg-gray-800' : 'text-gray-600 cursor-not-allowed'}`}
                    title="Delete Selected Clip"
                >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-xs font-medium">Delete</span>
                </button>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <button 
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                        onClick={() => setZoom(z => Math.max(z - 0.2, 0.1))}
                        title="Zoom Out (Cmd/Ctrl + -)"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    
                    <input
                        type="range"
                        min="0.1"
                        max="20"
                        step="0.1"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-24 md:w-32 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer custom-range"
                        style={{
                            backgroundImage: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(zoom / 20) * 100}%, transparent ${(zoom / 20) * 100}%, transparent 100%)`
                        }}
                    />
                    
                    <button 
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                        onClick={() => setZoom(z => Math.min(z + 0.2, 20))}
                        title="Zoom In (Cmd/Ctrl + +)"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                </div>

                <div className="h-4 w-px bg-gray-700" />
                
                <button 
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                    onClick={() => setZoom(1)}
                    title="Reset Zoom (Cmd/Ctrl + 0)"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
                
                <span className="text-xs text-gray-500 font-mono hidden md:inline-block">Cmd + Scroll</span>
            </div>
        </div>
    );
};

export default TimelineHeader;
