import React from 'react';
import { Film, Undo2, Redo2, Upload, Download, Wand2, Settings, PanelLeft, PanelRight } from 'lucide-react';

const Header = ({ isLeftSidebarOpen, setIsLeftSidebarOpen, isRightSidebarOpen, setIsRightSidebarOpen, videoEditorRef }) => {
  const handleImport = () => {
    videoEditorRef.current?.handleImportClick?.();
  };

  return (
    <header className="h-16 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-4 shrink-0 z-30 relative">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
          className={`p-2 rounded-lg transition-colors ${isLeftSidebarOpen ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          title="Toggle Left Sidebar"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2 text-white font-bold text-xl">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
            <Film className="w-6 h-6" />
          </div>
          <span className="tracking-tight">VEDIT</span>
        </div>
        <span className="text-gray-500 text-sm border-l border-gray-800 pl-4">Untitled Project</span>
      </div>
      
      <div className="flex items-center gap-1">
        <button 
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          onClick={() => videoEditorRef.current?.undo?.()}
          title="Undo (Cmd/Ctrl + Z)"
        >
          <Undo2 className="w-5 h-5" />
        </button>
        <button 
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          onClick={() => videoEditorRef.current?.redo?.()}
          title="Redo (Cmd/Ctrl + Y or Cmd/Ctrl + Shift + Z)"
        >
          <Redo2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button 
          className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg border border-gray-700 text-sm font-medium transition-colors"
          onClick={handleImport}
        >
          <Upload className="w-4 h-4" />
          Import
        </button>
        <button className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg border border-gray-700 text-sm font-medium transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all">
          <Wand2 className="w-4 h-4" />
          AI Edit
        </button>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        
        <div className="w-px h-6 bg-gray-800 mx-1" />
        
        <button 
          onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          className={`p-2 rounded-lg transition-colors ${isRightSidebarOpen ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          title="Toggle Right Sidebar"
        >
          <PanelRight className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
