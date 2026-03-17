import React from 'react';
import { Type, Plus, Palette, Type as TypeIcon } from 'lucide-react';

const TextToolbar = ({ onAddText, selectedTextClip, onUpdateTextClip }) => {
    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-full px-4 py-2 flex items-center gap-4 shadow-xl z-40">
            <button
                onClick={() => onAddText('New Text')}
                className="flex items-center gap-2 text-sm font-medium text-white hover:text-indigo-400 transition-colors"
            >
                <Plus className="w-4 h-4" />
                Add Text
            </button>

            {selectedTextClip && (
                <>
                    <div className="w-px h-6 bg-gray-700" />
                    
                    <div className="flex items-center gap-2">
                        <TypeIcon className="w-4 h-4 text-gray-400" />
                        <input
                            type="number"
                            value={selectedTextClip.fontSize || 24}
                            onChange={(e) => onUpdateTextClip(selectedTextClip.id, { fontSize: parseInt(e.target.value) })}
                            className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-gray-400" />
                        <input
                            type="color"
                            value={selectedTextClip.color || '#ffffff'}
                            onChange={(e) => onUpdateTextClip(selectedTextClip.id, { color: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                        />
                    </div>

                    <input
                        type="text"
                        value={selectedTextClip.text}
                        onChange={(e) => onUpdateTextClip(selectedTextClip.id, { text: e.target.value })}
                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500 min-w-[150px]"
                    />
                </>
            )}
        </div>
    );
};

export default TextToolbar;
