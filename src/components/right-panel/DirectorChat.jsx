import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, Wand2, Zap, MicVocal, Loader2, PlayCircle } from 'lucide-react';

const DirectorChat = ({ clips, onAskAI }) => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: "I've analyzed your video. Need help with transitions or syncing the audio?" }
    ]);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isGenerating]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        const text = prompt.trim();
        if (!text || isGenerating) return;

        setPrompt('');
        setIsGenerating(true);
        setMessages(prev => [...prev, { type: 'user', text }]);

        if (onAskAI) {
            try {
                await onAskAI(text);
                setMessages(prev => [...prev, { 
                    type: 'bot', 
                    text: "Got it! I've updated your timeline with those changes.",
                    success: true
                }]);
            } catch (err) {
                setMessages(prev => [...prev, { 
                    type: 'bot', 
                    text: "Sorry, I hit a snag while editing. Is the backend running?",
                    error: true
                }]);
            }
        }
        setIsGenerating(false);
    };

    const handleQuickAction = (actionPrompt) => {
        setPrompt(actionPrompt);
    };

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="p-4 py-2 border-b border-gray-900 bg-gray-950/50 flex items-center justify-between shrink-0">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Director Chat</h3>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-gray-500 font-medium">Ready</span>
                </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                            msg.type === 'user' ? 'bg-indigo-600 shadow-indigo-500/10' : 'bg-gray-800 border border-gray-700'
                        }`}>
                            {msg.type === 'user' ? <MessageSquare className="w-3.5 h-3.5 text-white" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                            msg.type === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : msg.success 
                                    ? 'bg-emerald-900/20 text-emerald-300 border border-emerald-800/50 rounded-tl-none'
                                    : msg.error
                                        ? 'bg-red-900/20 text-red-300 border border-red-800/50 rounded-tl-none'
                                        : 'bg-gray-900 border border-gray-800 text-gray-300 rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isGenerating && (
                    <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                           <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                        </div>
                        <div className="bg-gray-900 border border-gray-800 text-gray-500 rounded-2xl rounded-tl-none px-4 py-2 text-xs flex items-center gap-2">
                            <span>Developing your vision...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Actions Bar (Suggested Buttons) */}
            <div className="px-4 pb-2 space-y-2 shrink-0">
                <div className="flex gap-2 flex-wrap">
                    <ChatQuickAction icon={Zap} label="Sync Audio" onClick={() => handleQuickAction("Analyze audio beats and align video cuts to the rhythm.")} />
                    <ChatQuickAction icon={MicVocal} label="Auto Captions" onClick={() => handleQuickAction("Generate vibecoded captions for the video.")} />
                    <ChatQuickAction icon={Wand2} label="Vibe Edit" onClick={() => handleQuickAction("Apply energetic edits and transitions matching the mood.")} />
                </div>
            </div>

            {/* Input Box */}
            <div className="p-4 pt-2 shrink-0">
                <form onSubmit={handleSend} className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition-opacity duration-500 pointer-events-none" />
                    <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask the director..." 
                        className="relative w-full bg-gray-900 border border-gray-800 rounded-2xl py-3.5 pl-4 pr-12 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                    />
                    <button 
                        type="submit"
                        disabled={!prompt.trim() || isGenerating}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-indigo-600 rounded-xl transition-all active:scale-90"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

const ChatQuickAction = ({ icon: Icon, label, onClick }) => (
    <button 
        onClick={onClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-[10px] text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-700 transition-all active:scale-95"
    >
        <Icon className="w-3 h-3" />
        {label}
    </button>
);

export default DirectorChat;
