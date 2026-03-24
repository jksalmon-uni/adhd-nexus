"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckSquare } from "lucide-react";

import type { Task } from "../../types";

type Properties = {
  isOpen: boolean;
  onClose: () => void;
  completedTasks: Task[];
};

// WinLogModal component displays a log of completed tasks as proof of wins, with a date stamp for each entry
// Props defined above
// Example usage:
// <WinLogModal
//   isOpen={isWinLogOpen}
//   onClose={() => setIsWinLogOpen(false)}
//   completedTasks={[{ text: "Completed Task", id: "1", date: "2024-06-01" }]}
// />

export default function WinLogModal({ isOpen, onClose, completedTasks }: Properties) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm rounded-[48px] p-8 border shadow-2xl max-h-[80vh] flex flex-col bg-white border-slate-200 dark:bg-zinc-900 dark:border-zinc-800"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-black text-amber-500">Win Log</h2>
                <p className="text-xs opacity-50 font-bold uppercase tracking-widest">Proof you did things.</p>
              </div>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full shrink-0 bg-zinc-100 dark:bg-zinc-800">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 flex-1">
              {completedTasks.length === 0
                ? <p className="opacity-40 italic text-center py-10">Empty for now. Go get a win.</p>
                : completedTasks.map((t, idx) => (
                  <div key={`comp-${t.id}-${idx}`} className="p-4 rounded-2xl border bg-slate-50 border-slate-100 dark:bg-zinc-800/30 dark:border-zinc-800">
                    <div className="flex items-start gap-3">
                      <CheckSquare size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold opacity-80 line-through">{t.text}</span>
                        <span className="text-[10px] opacity-40 font-mono mt-1">{new Date(t.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
