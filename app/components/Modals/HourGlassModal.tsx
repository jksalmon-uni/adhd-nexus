"use client";
import { motion, AnimatePresence } from "framer-motion";
import type { Task } from "../../types";

type Properties = {
  focusTask: Task | null;
  focusRemainingSeconds: number;
  focusCompletionRatio: number;
  bgClass: string;
  stencilColorClass: string;
  onClose: () => void;
};

export default function HourGlassModal({ focusTask, focusRemainingSeconds, focusCompletionRatio, bgClass, stencilColorClass, onClose }: Properties) {
  return (
    <AnimatePresence>
      {focusTask && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-60 flex flex-col items-center justify-center p-12 ${bgClass}`}>
          <button onClick={onClose} className="absolute top-12 right-8 px-6 py-3 rounded-full border font-black uppercase text-[10px]">Abort</button>
          <h2 className="text-3xl font-black text-center mb-12">{focusTask.text}</h2>

          <div className="w-full max-w-sm flex items-center justify-center relative aspect-1/1.5 mb-8">
            <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-[0_25px_25px_rgb(0_0_0/0.5)] dark:drop-shadow-[0_25px_25px_rgb(255_255_255/0.3)]">
              {/* Sand Logic using Stencil */}
              <motion.rect x="20" width="60" className="fill-emerald-500" animate={{ y: 20 + (focusCompletionRatio * 75), height: 75 - (focusCompletionRatio * 75) }} transition={{ ease: "linear", duration: 1 }} />
              <motion.rect x="49" y="95" width="2" className="fill-emerald-500" animate={{ height: 85 - (focusCompletionRatio * 75), opacity: focusRemainingSeconds > 0 ? 1 : 0 }} transition={{ ease: "linear", duration: 1 }} />
              <motion.rect x="20" width="60" className="fill-emerald-500" animate={{ y: 180 - (focusCompletionRatio * 75), height: focusCompletionRatio * 75 }} transition={{ ease: "linear", duration: 1 }} />
              <path d="M 0 0 h 100 v 200 h -100 Z M 20 20 C 20 65 43 85 50 95 C 57 85 80 65 80 20 Z M 50 105 C 43 115 20 135 20 180 L 80 180 C 80 135 57 115 50 105 Z" fill="currentColor" className={stencilColorClass} fillRule="evenodd" />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center text-6xl font-mono font-black">
              {Math.floor(focusRemainingSeconds / 60)}:{(focusRemainingSeconds % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
