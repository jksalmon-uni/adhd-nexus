"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Properties = {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
};

// Settings modal — controls theme and sound preferences
// Usage:
// <SettingsModal
//   isOpen={isSettingsOpen}
//   onClose={() => setIsSettingsOpen(false)}
//   isDark={isDark}
//   onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
//   soundEnabled={soundEnabled}
//   onToggleSound={() => setSoundEnabled(!soundEnabled)}
// />

export default function SettingsModal({ isOpen, onClose, isDark, onToggleTheme, soundEnabled, onToggleSound }: Properties) {
  const card = isDark ? "bg-zinc-900 border-zinc-800 shadow-xl" : "bg-white border-slate-200 shadow-sm";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`w-full max-w-sm rounded-[48px] p-10 border shadow-2xl ${card}`}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black">Control</h2>
              <button onClick={onClose} className={`w-10 h-10 flex items-center justify-center rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <button onClick={onToggleTheme} className={`w-full p-6 rounded-3xl text-left border-2 font-bold ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
                {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              <button onClick={onToggleSound} className={`w-full p-6 rounded-3xl text-left border-2 font-bold ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
                {soundEnabled ? '🔊 Sounds On' : '🔇 Sounds Muted'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
