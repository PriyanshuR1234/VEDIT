import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, Bot, Zap, MicVocal, Captions, Wand2 } from 'lucide-react';

const QUICK_ACTIONS = [
    { 
        icon: Sparkles, 
        label: 'Insta Reel', 
        prompt: 'Create a professional 45s Instagram Reel. Extract 5-10 cinematic highlight segments (3-6s each). **Place them sequentially end-to-end on track 0**. Use Timeline Units (Seconds * 100) for all startPositions so they don\'t overlap. Add fade transitions to every segment. Add a text overlay "Enjoy the moments!" at the start.' 
    },
    { icon: Captions, label: 'Auto-Captions', prompt: 'Analyze the audio and generate perfectly timed captions with vibecoded colors and transitions matching the beat. Keep all existing video/audio clips.' },
    { icon: MicVocal, label: 'Lyrics Overlay', prompt: 'Detect and transcribe any song lyrics or spoken words in the video, then place stylized text overlays synced to the music beats with matching vibes.' },
    { icon: Zap, label: 'Vibe Edit', prompt: 'Analyze the mood and energy of the audio. Apply energetic text overlays that match the tempo and feel of the music with fitting colors and animations.' },
    { icon: Wand2, label: 'Auto Trim', prompt: 'Remove any silent or low-energy sections from the timeline, keeping only the best moments.' },
];

const AIPanel = ({ onAskAI, clips = [] }) => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [history, setHistory] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const bottomRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            
            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setPrompt(transcript);
            };

            recognitionRef.current.onend = () => setIsListening(false);
            recognitionRef.current.onerror = () => setIsListening(false);
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setPrompt('');
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    // Check if any clips are uploading to the AI
    const uploadingClips = clips.filter(c => c.type !== 'text' && !c.geminiFileId);
    const uploadedClips = clips.filter(c => c.geminiFileId);
    const hasMedia = clips.some(c => c.type === 'video' || c.type === 'audio');

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isGenerating]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim() || isGenerating) return;
        
        const currentPrompt = prompt.trim();
        setPrompt('');
        setIsGenerating(true);
        setHistory(prev => [...prev, { type: 'user', text: currentPrompt }]);
        
        if (onAskAI) {
            try {
                await onAskAI(currentPrompt);
                setHistory(prev => [...prev, { 
                    type: 'bot', 
                    text: '✅ Done! Your timeline has been updated with AI edits.',
                    highlight: true
                }]);
            } catch {
                setHistory(prev => [...prev, { type: 'bot', text: '❌ Failed to apply edits. Make sure the backend is running.' }]);
            }
        }
        setIsGenerating(false);
    };

    const handleQuickAction = (quickPrompt) => {
        setPrompt(quickPrompt);
    };

    return (
        <div className="flex flex-col h-full bg-gray-950 relative">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-gray-800/60 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-white leading-none">AI Assistant</h2>
                    <p className="text-[10px] text-gray-500 mt-0.5">Vibecoding & Auto-Captions</p>
                </div>
            </div>

            {/* Media Upload Status */}
            {hasMedia && (
                <div className={`mx-3 mt-3 px-3 py-2 rounded-lg text-xs flex items-center gap-2 shrink-0 transition-colors ${
                    uploadedClips.length > 0 
                        ? 'bg-emerald-900/30 border border-emerald-700/40 text-emerald-400' 
                        : 'bg-amber-900/30 border border-amber-700/40 text-amber-400'
                }`}>
                    {uploadedClips.length > 0 ? (
                        <>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                            <span>{uploadedClips.length} media file{uploadedClips.length > 1 ? 's' : ''} analyzed by AI — ready for captions!</span>
                        </>
                    ) : (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                            <span>Uploading media to AI... ({uploadingClips.length} pending)</span>
                        </>
                    )}
                </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
                {history.length === 0 && (
                    <div className="space-y-3">
                        <p className="text-xs text-gray-500 text-center py-1">Quick Actions</p>
                        <div className="grid grid-cols-2 gap-2">
                            {QUICK_ACTIONS.map(({ icon: Icon, label, prompt: qPrompt }) => (
                                <button
                                    key={label}
                                    onClick={() => handleQuickAction(qPrompt)}
                                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-indigo-600/60 hover:bg-indigo-900/20 transition-all text-left group"
                                >
                                    <Icon className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                                    <span className="text-xs text-gray-300 group-hover:text-white font-medium transition-colors text-center leading-tight">{label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-3 text-xs text-gray-500 leading-relaxed">
                            💡 Import a video first, then click a quick action or type a custom prompt. The AI will analyze your audio and generate perfectly synced captions & effects!
                        </div>
                    </div>
                )}

                {history.map((msg, idx) => (
                    <div key={idx} className={`flex gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.type === 'bot' && (
                            <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                                <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                            </div>
                        )}
                        <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                            msg.type === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : msg.highlight
                                    ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40 rounded-bl-none'
                                    : 'bg-gray-800/80 text-gray-200 border border-gray-700/50 rounded-bl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {isGenerating && (
                    <div className="flex justify-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                            <Bot className="w-2.5 h-2.5 text-indigo-400" />
                        </div>
                        <div className="bg-gray-800/80 border border-gray-700/50 rounded-xl rounded-bl-none px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400 shrink-0" />
                            <span>Analyzing audio & generating captions...</span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-800/60 shrink-0">
                {history.length > 0 && (
                    <div className="flex gap-1 mb-2 flex-wrap">
                        {QUICK_ACTIONS.map(({ icon: Icon, label, prompt: qPrompt }) => (
                            <button
                                key={label}
                                onClick={() => handleQuickAction(qPrompt)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-900 border border-gray-800 text-[10px] text-gray-400 hover:text-indigo-300 hover:border-indigo-700/60 transition-all"
                            >
                                <Icon className="w-2.5 h-2.5" />
                                {label}
                            </button>
                        ))}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500/80 resize-none h-16 placeholder-gray-600 transition-all custom-scrollbar"
                        placeholder="Ask AI anything... (Enter to send)"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!prompt.trim() || isGenerating}
                        className="absolute bottom-2.5 right-2.5 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-all shadow-lg"
                    >
                        {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </button>
                    <button
                        type="button"
                        onClick={toggleListening}
                        className={`absolute bottom-2.5 right-11 p-1.5 rounded-lg transition-all shadow-lg ${
                            isListening 
                                ? 'bg-red-500 text-white animate-pulse' 
                                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700'
                        }`}
                        title={isListening ? "Stop listening" : "Voice input"}
                    >
                        <MicVocal className="w-3.5 h-3.5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIPanel;
