"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface UnstuckerChatProps {
  isDark: boolean;
  colorMap: any;
  initialTask?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function UnstuckerChat({ isDark, colorMap, initialTask }: UnstuckerChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "I am the Unstucker. Tell me what task is paralyzing you right now, and I will break it down into microscopic steps.",
    },
  ]);
  
  const [input, setInput] = useState(initialTask ? `I am overwhelmed by: ${initialTask}` : "");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Add the new user message to the array
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    const updatedMessages = [...messages, userMsg]; // Capture the full history!
    
    setMessages(updatedMessages); // Update the UI
    setInput("");
    setIsTyping(true);

    try {
      // 2. Filter out the initial "Welcome" message so we don't confuse the AI, then send the rest!
      const apiMessages = updatedMessages.filter(m => m.id !== "welcome");

      const response = await fetch("/api/unstucker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }), // Sending the array here!
      });

      if (!response.ok) throw new Error("API failed");
      
      const data = await response.json();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.result,
      };
      
      setMessages((prev) => [...prev, botMsg]);
      
      const audio = new Audio("/sounds/bubble_pop.mp3");
      audio.play().catch(() => {});

    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Oops, my brain disconnected for a second. Try asking me again!",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`flex flex-col h-full rounded-[32px] overflow-hidden border shadow-sm ${colorMap.card}`}>
      <div className={`p-4 border-b flex items-center gap-3 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
        <div className="p-2 bg-purple-500 rounded-xl text-white shadow-md">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className={`font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>The Unstucker</h3>
          <p className={`text-xs font-bold ${colorMap.textMuted}`}>Task De-escalation Bot</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={m.id}
            className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              m.role === "user" 
                ? "bg-emerald-500 text-white" 
                : isDark ? "bg-zinc-800 text-purple-400" : "bg-purple-100 text-purple-600"
            }`}>
              {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`p-4 rounded-2xl max-w-[80%] whitespace-pre-wrap text-sm font-medium ${
              m.role === "user"
                ? "bg-emerald-500 text-white rounded-tr-sm"
                : isDark ? "bg-zinc-800 text-zinc-200 rounded-tl-sm" : "bg-slate-100 text-slate-700 rounded-tl-sm"
            }`}>
              {m.content}
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isDark ? "bg-zinc-800 text-purple-400" : "bg-purple-100 text-purple-600"}`}>
                <Bot size={16} />
             </div>
             <div className={`p-4 rounded-2xl flex items-center gap-2 ${isDark ? "bg-zinc-800" : "bg-slate-100"}`}>
               <Loader2 size={16} className="animate-spin text-purple-500" />
               <span className={`text-xs font-bold ${colorMap.textMuted}`}>Thinking...</span>
             </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className={`p-4 border-t ${isDark ? 'border-zinc-800' : 'border-slate-100'}`}>
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="I am overwhelmed by..."
            disabled={isTyping}
            className={`w-full py-4 pl-4 pr-14 rounded-2xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${colorMap.input}`}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:hover:bg-purple-500 text-white rounded-xl transition-all active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}