"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Timer, Trash2 } from "lucide-react";

type Properties = {
  isOpen: boolean;
  onClose: () => void;
  overwhelmMode: boolean;
  brainDump: string[];
  onAddNote: (text: string) => void;
  onDeleteNote: (index: number) => void;
  onPromoteToTask: (text: string, index: number) => void;
};

// BrainDumpDrawer component provides a space for users to quickly jot down thoughts, ideas, or worries without the pressure of organizing them
// Features a vent mode with a 60-second timer to encourage free-flowing thoughts, and auto-saves when the timer expires
// Users can also promote notes to tasks or delete them
// Example usage:
// <BrainDumpDrawer
//   isOpen={isBrainDumpOpen}
//   onClose={() => setIsBrainDumpOpen(false)}
//   overwhelmMode={overwhelmMode}
//   brainDump={brainDump}
//   onAddNote={(text) => setBrainDump([...brainDump, text])}
//   onDeleteNote={(index) => setBrainDump(brainDump.filter((_, i) => i !== index))}
//   onPromoteToTask={(text, index) => {
//     setTasks([...tasks, { text, id: Date.now().toString(), duration: 0, date: new Date().toISOString() }]);
//     setBrainDump(brainDump.filter((_, i) => i !== index));
//   }}
// />

export default function BrainDumpDrawer({ isOpen, onClose, overwhelmMode, brainDump, onAddNote, onDeleteNote, onPromoteToTask }: Properties) {
  const [input, setInput] = useState("");
  const [isVentMode, setIsVentMode] = useState(false);
  const [ventTimer, setVentTimer] = useState(60);
  const ventIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save when vent timer expires
  useEffect(() => {
    if (!isVentMode && ventTimer === 0 && input.trim()) {
      onAddNote(input);
      setInput("");
      setVentTimer(60);
    }
  }, [isVentMode, ventTimer, input]);

  // Clean up timer if drawer is closed mid-vent
  useEffect(() => {
    if (!isOpen) {
      setIsVentMode(false);
      setInput("");
      if (ventIntervalRef.current) clearInterval(ventIntervalRef.current);
    }
  }, [isOpen]);

  const triggerVentMode = () => {
    setIsVentMode(true);
    setVentTimer(60);
    setInput("");
    ventIntervalRef.current = setInterval(() => {
      setVentTimer(prev => {
        if (prev <= 1) {
          clearInterval(ventIntervalRef.current!);
          setIsVentMode(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onAddNote(input);
    setInput("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto rounded-t-[50px] p-10 pb-16 z-50 shadow-2xl bg-amber-50 dark:bg-zinc-900"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black text-zinc-900 dark:text-white">Notes</h2>
              <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-900/10 text-zinc-900 dark:bg-white/10 dark:text-white">
                <X size={20} />
              </button>
            </div>

            {!isVentMode ? (
              <>
                <button
                  onClick={triggerVentMode}
                  className="w-full mb-6 p-4 rounded-2xl bg-amber-500 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Timer size={16} /> 60s Impulse Vent
                </button>

                <form onSubmit={handleSubmit} className="flex gap-3 mb-10">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Get it out of your head..."
                    className="flex-1 border-2 rounded-3xl px-6 py-4 outline-none focus:ring-4 focus:ring-amber-500/20 bg-white border-zinc-900/5 text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  />
                  <button type="submit" className={`text-white px-8 flex items-center justify-center rounded-3xl font-bold text-2xl ${overwhelmMode ? 'bg-blue-600' : 'bg-zinc-900'}`}>
                    <Plus />
                  </button>
                </form>

                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                  {brainDump.map((note, i) => (
                    <motion.div layout key={`dump-${i}`} className="p-5 rounded-[28px] flex justify-between items-center shadow-sm border bg-white border-zinc-900/5 dark:bg-zinc-800 dark:border-zinc-700">
                      <span className="text-sm font-bold leading-tight pr-6 text-zinc-800 dark:text-white">{note}</span>
                      <div className="flex gap-2">
                        <button onClick={() => onPromoteToTask(note, i)} className="bg-zinc-900 text-white text-[10px] font-black px-5 py-3 rounded-2xl shrink-0">
                          TASKIFY
                        </button>
                        <button onClick={() => onDeleteNote(i)} className="p-2 text-zinc-400 hover:text-rose-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="animate-in fade-in flex flex-col items-center">
                <h3 className="text-5xl font-mono font-black text-rose-500 mb-6">{ventTimer}s</h3>
                <textarea
                  autoFocus
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type fast! Don't overthink it..."
                  className="w-full h-48 border-2 rounded-3xl p-6 outline-none resize-none bg-white border-zinc-900/5 text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                />
                <p className="text-xs opacity-50 mt-4 font-bold uppercase tracking-widest">Will auto-save when timer hits 0</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
