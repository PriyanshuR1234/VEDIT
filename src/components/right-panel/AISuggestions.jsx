import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Wand2, MicVocal, MessageSquare, Loader2, PlayCircle } from 'lucide-react';

const ICON_MAP = {
  Sparkles, Zap, Wand2, MicVocal, MessageSquare, PlayCircle
};

const AISuggestions = ({ clips, onAskAI }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuggestions = async () => {
    if (clips.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/analyze-video-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clips_metadata: clips, prompt: "Suggest improvements" })
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } else {
        throw new Error('Failed to fetch suggestions');
      }
    } catch (err) {
      console.error('Suggestions error:', err);
      setError('Could not load suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 2000); // Debounce initial fetch
    return () => clearTimeout(timer);
  }, [clips.length]); // Re-fetch when clip count changes

  const handleApply = async (prompt) => {
    if (onAskAI) {
      await onAskAI(prompt);
    }
  };

  if (clips.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto border border-gray-800">
          <Sparkles className="w-6 h-6 text-gray-600" />
        </div>
        <p className="text-xs text-gray-500 italic">Import media to see AI suggestions</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Smart Suggestions</h3>
        {isLoading && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}
      </div>
      
      {error && (
        <div className="p-3 rounded-lg bg-red-900/10 border border-red-900/20 text-[10px] text-red-500">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {suggestions.length > 0 ? suggestions.map((s, i) => {
          const Icon = ICON_MAP[s.icon] || Sparkles;
          return (
            <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-800 bg-gray-900/30 hover:bg-gray-900 hover:border-gray-700 transition-all group cursor-pointer animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-800 text-gray-400 group-hover:text-white group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-all shadow-sm">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 pr-2">
                  <h4 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors truncate">{s.title}</h4>
                  <p className="text-[10px] text-gray-500 truncate">{s.description}</p>
                </div>
              </div>
              <button 
                onClick={() => handleApply(s.prompt)}
                className="shrink-0 text-[10px] font-bold text-indigo-400 hover:text-white px-2.5 py-1.5 hover:bg-indigo-600 rounded-lg transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 active:scale-90"
              >
                Apply
              </button>
            </div>
          );
        }) : !isLoading && (
          <div className="p-6 text-center border border-dashed border-gray-800 rounded-2xl">
              <p className="text-[10px] text-gray-600 font-medium">Analyzing timeline for improvements...</p>
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
          <button 
            onClick={fetchSuggestions}
            className="w-full py-2.5 text-[10px] text-gray-500 hover:text-indigo-400 transition-colors flex items-center justify-center gap-2 group"
          >
              <Zap className="w-3 h-3 group-hover:animate-pulse" />
              Refresh Analysis
          </button>
      )}
    </div>
  );
};

export default AISuggestions;
