import React, { useState } from 'react';
import { Sparkles, MessageSquare, Settings, Zap } from 'lucide-react';
import AISuggestions from './AISuggestions';
import DirectorChat from './DirectorChat';
import ExportPanel from './ExportPanel';

const RightPanel = ({ videoEditorRef }) => {
  const [activeTab, setActiveTab] = useState('assistant');
  const [clips, setClips] = useState([]);

  const getLatestState = React.useCallback(() => {
    if (videoEditorRef?.current) {
        const latestClips = videoEditorRef.current.getClips?.();
        if (latestClips) setClips(latestClips);
    }
  }, [videoEditorRef]);

  React.useEffect(() => {
      const t = setInterval(getLatestState, 1000);
      return () => clearInterval(t);
  }, [getLatestState]);

  const onAskAI = async (prompt) => {
      if (!videoEditorRef?.current) return;
      const currentClips = videoEditorRef.current.getClips();
      
      const res = await fetch("http://localhost:8000/api/analyze-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, clips_metadata: currentClips })
      });
      const data = await res.json();
      if (data.status === "success" && data.new_clips) {
          videoEditorRef.current.setClips(data.new_clips);
      } else {
          throw new Error(JSON.stringify(data));
      }
  };

  return (
    <aside className="w-84 h-full bg-gray-950 border-l border-gray-800/60 flex flex-col shrink-0 overflow-hidden relative">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600/5 blur-[100px] pointer-events-none" />

      {/* Modern Tab Navigation */}
      <div className="flex p-4 pb-2 gap-1 border-b border-gray-900 shrink-0 bg-gray-950/40 backdrop-blur-md z-10">
        <TabButton 
          active={activeTab === 'assistant'} 
          onClick={() => setActiveTab('assistant')}
          icon={Sparkles}
          label="Director"
        />
        <TabButton 
          active={activeTab === 'export'} 
          onClick={() => setActiveTab('export')}
          icon={Settings}
          label="Export"
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-950/20 backdrop-blur-sm relative z-0">
        {activeTab === 'assistant' ? (
          <>
            {/* Dynamic Suggestions Section */}
            <div className="shrink-0 border-b border-gray-900/50">
                <AISuggestions clips={clips} onAskAI={onAskAI} />
            </div>
            
            {/* Chat Section filler/container */}
            <div className="flex-1 flex flex-col min-h-0">
                <DirectorChat clips={clips} onAskAI={onAskAI} />
            </div>
          </>
        ) : (
          <ExportPanel videoEditorRef={videoEditorRef} />
        )}
      </div>
    </aside>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 relative group overflow-hidden ${
      active 
        ? 'text-white' 
        : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50'
    }`}
  >
    {active && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-700 animate-in fade-in zoom-in-95 duration-300" />
    )}
    <Icon className={`w-3.5 h-3.5 relative z-10 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    <span className="relative z-10 tracking-tight">{label}</span>
  </button>
);

export default RightPanel;
