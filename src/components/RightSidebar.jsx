import React, { useState } from 'react';
import { 
  Sparkles, MessageSquare, ListTree, Wand2, 
  Settings, Zap, ArrowRight, PlayCircle
} from 'lucide-react';

const RightSidebar = () => {
  const [activeTab, setActiveTab] = useState('assistant');

  return (
    <aside className="w-80 h-full bg-gray-950 border-l border-gray-800 flex flex-col shrink-0">
      {/* Tabs */}
      <div className="flex p-4 gap-2 border-b border-gray-800 shrink-0">
        <button 
          onClick={() => setActiveTab('assistant')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'assistant' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Assistant
        </button>
        <button 
          onClick={() => setActiveTab('export')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'export' 
              ? 'bg-gray-800 text-white shadow-sm' 
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
          }`}
        >
          Export
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'assistant' ? (
          <>
            {/* AI Actions Grid */}
            <div className="p-4 grid grid-cols-2 gap-3 shrink-0">
              <AIActionButton icon={Wand2} label="Auto Edit" />
              <AIActionButton icon={Zap} label="Enhance" />
              <AIActionButton icon={ListTree} label="Storyline" />
              <AIActionButton icon={PlayCircle} label="Highlights" />
            </div>

            <div className="w-full h-px bg-gray-800 shrink-0" />

            {/* Smart Suggestions */}
            <div className="p-4 shrink-0">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-1">Smart Suggestions</h3>
              <div className="space-y-3">
                <SuggestionCard 
                  icon={Sparkles}
                  title="Color Correction"
                  description="Fix white balance in Clip 2"
                />
                <SuggestionCard 
                  icon={MessageSquare}
                  title="Silence Removal"
                  description="Remove 12s of dead air"
                />
              </div>
            </div>

            <div className="w-full h-px bg-gray-800 shrink-0" />

            {/* AI Chat Interface */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-1 shrink-0">Director Chat</h3>
              
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 custom-scrollbar pr-2">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-900 rounded-2xl rounded-tl-sm p-3 border border-gray-800 text-sm text-gray-300">
                    I noticed your audio levels are a bit low in the second half. Want me to normalize them?
                  </div>
                </div>
              </div>

              <div className="relative shrink-0 mt-auto">
                <input 
                  type="text" 
                  placeholder="Ask the AI director..." 
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-4 pr-12 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-4 space-y-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 px-1">Resolution</h3>
              <select className="w-full bg-gray-900 border border-gray-800 text-sm text-gray-300 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer">
                <option>4K (3840 x 2160)</option>
                <option>1080p (1920 x 1080)</option>
                <option>720p (1280 x 720)</option>
                <option>Vertical (1080 x 1920)</option>
              </select>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 px-1">Format</h3>
              <select className="w-full bg-gray-900 border border-gray-800 text-sm text-gray-300 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer">
                <option>MP4 (H.264)</option>
                <option>MOV (ProRes)</option>
                <option>GIF</option>
                <option>Audio Only (MP3)</option>
              </select>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 px-1">Quality</h3>
              <input type="range" className="w-full accent-indigo-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-xs text-gray-500 px-1">
                <span>Smaller File</span>
                <span>Best Quality</span>
              </div>
            </div>

            <div className="pt-4">
              <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Export Video
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

const AIActionButton = ({ icon, label }) => {
  const Icon = icon;
  return (
    <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border border-gray-800 bg-gray-900/50 text-gray-400 hover:bg-gray-800 hover:border-indigo-500/50 hover:text-white hover:shadow-lg hover:shadow-indigo-500/10 transition-all group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Icon className="w-6 h-6 group-hover:text-indigo-400 transition-colors relative z-10" />
      <span className="text-xs font-medium text-center relative z-10">{label}</span>
    </button>
  );
};

const SuggestionCard = ({ icon, title, description }) => {
  const Icon = icon;
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-gray-900/30 hover:bg-gray-900 hover:border-gray-700 transition-all group cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gray-800 text-gray-400 group-hover:text-white group-hover:bg-gray-700 transition-all">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{title}</h4>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300 px-3 py-1.5 hover:bg-indigo-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
        Apply
      </button>
    </div>
  );
};

export default RightSidebar;
