import React, { useState } from 'react';
import { 
  Scissors, Type, Music, Image as ImageIcon, Video, 
  Layers, SlidersHorizontal, Settings2, LayoutTemplate,
  Wand2, Subtitles, SplitSquareHorizontal, Move
} from 'lucide-react';

const LeftSidebar = () => {
  const [activeTab, setActiveTab] = useState('tools');

  return (
    <aside className="w-80 h-full bg-gray-950 border-r border-gray-800 flex flex-col shrink-0">
      {/* Tabs */}
      <div className="flex p-4 gap-2 border-b border-gray-800 shrink-0">
        <button 
          onClick={() => setActiveTab('tools')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'tools' 
              ? 'bg-gray-800 text-white shadow-sm' 
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
          }`}
        >
          Tools
        </button>
        <button 
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'properties' 
              ? 'bg-gray-800 text-white shadow-sm' 
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
          }`}
        >
          Properties
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {activeTab === 'tools' ? (
          <>
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-1">Basic Edits</h3>
              <div className="grid grid-cols-2 gap-3">
                <ToolButton icon={Scissors} label="Split/Cut" />
                <ToolButton icon={Move} label="Transform" />
                <ToolButton icon={SplitSquareHorizontal} label="Crop" />
                <ToolButton icon={Type} label="Text" />
              </div>
            </div>

            <div className="w-full h-px bg-gray-800 my-6" />

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-1">Media</h3>
              <div className="grid grid-cols-2 gap-3">
                <ToolButton icon={Video} label="Stock Video" />
                <ToolButton icon={ImageIcon} label="Images" />
                <ToolButton icon={Music} label="Audio" />
                <ToolButton icon={Layers} label="Overlays" />
              </div>
            </div>

            <div className="w-full h-px bg-gray-800 my-6" />

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-1">Smart Tools</h3>
              <div className="space-y-2">
                <ActionButton icon={Wand2} label="Auto Remove Background" />
                <ActionButton icon={Subtitles} label="Auto Captions" />
                <ActionButton icon={LayoutTemplate} label="Smart Templates" />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-medium text-gray-300">Opacity</h3>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">100%</span>
              </div>
              <input type="range" className="w-full accent-indigo-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-medium text-gray-300">Volume</h3>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">0 dB</span>
              </div>
              <input type="range" className="w-full accent-indigo-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 px-1">Blend Mode</h3>
              <select className="w-full bg-gray-900 border border-gray-800 text-sm text-gray-300 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer">
                <option>Normal</option>
                <option>Multiply</option>
                <option>Screen</option>
                <option>Overlay</option>
              </select>
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-gray-800 text-gray-300 text-sm font-medium border border-gray-800 hover:border-gray-700 rounded-xl transition-all group">
              <SlidersHorizontal className="w-4 h-4 text-gray-400 group-hover:text-white" />
              Advanced Color Grading
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-gray-800 text-gray-300 text-sm font-medium border border-gray-800 hover:border-gray-700 rounded-xl transition-all group">
              <Settings2 className="w-4 h-4 text-gray-400 group-hover:text-white" />
              Audio Effects
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

const ToolButton = ({ icon, label, variant = 'default' }) => {
  const Icon = icon;
  return (
    <button className={`
      flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all group
      ${variant === 'active' 
        ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' 
        : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white hover:border-gray-700'}
    `}>
      <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

const ActionButton = ({ icon, label }) => {
  const Icon = icon;
  return (
    <button className="w-full flex items-center gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-700 transition-all text-sm font-medium group">
      <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      {label}
    </button>
  );
};

export default LeftSidebar;
