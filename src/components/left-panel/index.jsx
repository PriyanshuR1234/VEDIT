import React, { useState, useCallback } from 'react';
import ToolsPanel from './ToolsPanel';
import PropertiesPanel from './PropertiesPanel';
import AIPanel from './AIPanel';

const LeftSidebar = ({ videoEditorRef }) => {
  const [activeTab, setActiveTab] = useState('tools');
  const [activeTool, setActiveTool] = useState(null);
  const [clips, setClipsState] = useState([]);
  const [activeClipId, setActiveClipId] = useState(null);

  const activeClip = clips.find(c => c.id === activeClipId);

  // Pull clips and active selection from VideoEditor ref
  const getLatestState = useCallback(() => {
      if (videoEditorRef?.current) {
          const editor = videoEditorRef.current;
          const latestClips = editor.getClips();
          if (latestClips) setClipsState(latestClips);
          
          // If the editor exposes its internal activeClipId via the ref
          if (editor.getActiveClipId) {
              setActiveClipId(editor.getActiveClipId());
          }
      }
  }, [videoEditorRef]);

  // Poll state every 1 second to keep UI in sync (selection, upload status)
  React.useEffect(() => {
      const t = setInterval(() => {
          getLatestState();
      }, 1000);
      return () => clearInterval(t);
  }, [getLatestState]);

    const onUpdateClip = videoEditorRef?.current?.onUpdateClip;
    const onUpdateClips = videoEditorRef?.current?.onUpdateClips;

    const handleAskAI = async (prompt) => {
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

  // Route each tool action to the VideoEditor
  const handleToolAction = useCallback((tool, data) => {
      if (!videoEditorRef?.current) return;
      const editor = videoEditorRef.current;

      switch (tool) {
          case 'split':
              editor.splitAtPlayhead?.();
              break;

          case 'text':
              setActiveTool('text');
              editor.setActiveTool?.('text');
              editor.addTextClip?.();
              break;

          case 'import-video':
              editor.handleImportClick?.();
              break;

          case 'import-overlay':
              editor.handleImportOverlay?.();
              break;

          case 'import-audio':
              editor.handleImportAudio?.(data);
              break;

          case 'import-image':
              editor.handleImportImage?.(data);
              break;

          // These open overlay panels inside the video preview (live preview)
          case 'crop':
              editor.setActiveOverlay?.('crop');
              break;

          case 'transform':
              editor.setActiveOverlay?.('transform');
              break;

          case 'overlays':
              editor.setActiveOverlay?.('overlays');
              break;
              
          case 'transitions':
              editor.setActiveOverlay?.('transitions');
              break;

          case 'auto-captions':
              setActiveTab('ai');
              break;

          case 'remove-bg':
              alert('🔮 Auto Remove Background: Make sure backend is running, then use the AI panel to request background removal.');
              break;

          case 'templates':
              alert('📐 Smart Templates coming soon!');
              break;

          default:
              break;
      }
  }, [activeTool, videoEditorRef]);

  return (
    <aside className="w-full h-full bg-gray-950 border-r border-gray-800 flex flex-col">
      {/* Tabs */}
      <div className="flex p-3 gap-1.5 border-b border-gray-800 shrink-0">
        <button 
          onClick={() => setActiveTab('tools')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'tools' 
              ? 'bg-gray-800 text-white shadow-sm' 
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
          }`}
        >
          Tools
        </button>
        <button 
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'properties' 
              ? 'bg-gray-800 text-white shadow-sm' 
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
          }`}
        >
          Props
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'ai' 
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20' 
              : 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20'
          }`}
        >
          ✨ AI
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'tools' && (
            <div className="p-4 relative">
                <ToolsPanel onToolAction={handleToolAction} activeTool={activeTool} />
            </div>
        )}
        {activeTab === 'properties' && (
            <div className="p-4">
                <PropertiesPanel 
                    activeClip={activeClip} 
                    onUpdateClip={onUpdateClip} 
                    onUpdateClips={onUpdateClips}
                    onOpenOverlay={(overlay) => handleToolAction(overlay)}
                />
            </div>
        )}
        {activeTab === 'ai' && <AIPanel onAskAI={handleAskAI} clips={clips} />}
      </div>
    </aside>
  );
};

export default LeftSidebar;
