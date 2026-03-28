import React, { useState } from 'react';
import { ArrowRight, Settings, Video, FileVideo, Image as ImageIcon, Music } from 'lucide-react';

const ExportPanel = ({ videoEditorRef }) => {
  const [resolution, setResolution] = useState('1080p (1920 x 1080)');
  const [format, setFormat] = useState('MP4 (H.264)');
  const [quality, setQuality] = useState(80);

  const handleExport = () => {
    // Collect settings to pass to backend if needed
    const exportSettings = {
      resolution,
      format,
      quality,
      width: resolution.includes('4K') ? 3840 : resolution.includes('1080p') ? 1920 : 1280,
      height: resolution.includes('4K') ? 2160 : resolution.includes('1080p') ? 1080 : 720
    };
    
    videoEditorRef.current?.handleExport?.(exportSettings);
  };

  return (
    <div className="p-4 space-y-6 overflow-y-auto custom-scrollbar h-full">
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 delay-100 fill-mode-both">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Resolution</label>
        <div className="relative group">
            <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-indigo-400 transition-colors" />
            <select 
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 text-sm text-gray-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer hover:bg-gray-800/50 appearance-none shadow-sm"
            >
                <option>4K (3840 x 2160)</option>
                <option>1080p (1920 x 1080)</option>
                <option>720p (1280 x 720)</option>
                <option>Vertical (1080 x 1920)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                <ArrowRight className="w-3 h-3 rotate-90" />
            </div>
        </div>
      </div>

      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 delay-200 fill-mode-both">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Format</label>
        <div className="relative group">
            <FileVideo className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-indigo-400 transition-colors" />
            <select 
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 text-sm text-gray-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer hover:bg-gray-800/50 appearance-none shadow-sm"
            >
                <option>MP4 (H.264)</option>
                <option>MOV (ProRes)</option>
                <option>GIF</option>
                <option>Audio Only (MP3)</option>
            </select>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                <ArrowRight className="w-3 h-3 rotate-90" />
            </div>
        </div>
      </div>

      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 delay-300 fill-mode-both">
        <div className="flex justify-between items-center px-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quality</label>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">{quality}%</span>
        </div>
        <input 
            type="range" 
            min="10" 
            max="100" 
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all hover:scale-[1.01]" 
        />
        <div className="flex justify-between text-[10px] text-gray-600 font-medium px-1">
          <span>Faster Render</span>
          <span>Maximum Bitrate</span>
        </div>
      </div>

      <div className="pt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400 fill-mode-both">
        <div className="p-4 rounded-2xl bg-indigo-600/5 border border-indigo-500/10 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                <Settings className="w-3 h-3" />
                Export Summary
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed italic">
                Your video will be encoded with high-fidelity AAC audio and H.264 compression. 
                Estimated file size: ~45MB.
            </p>
        </div>
        <button 
          onClick={handleExport}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 overflow-hidden group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          Export Masterpiece
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
            100% { transform: translateX(100%); }
        }
      ` }} />
    </div>
  );
};

export default ExportPanel;
