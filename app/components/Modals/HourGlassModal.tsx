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
  const mins = Math.floor(focusRemainingSeconds / 60);
  const secs = (focusRemainingSeconds % 60).toString().padStart(2, "0");

  return (
    <AnimatePresence>
      {focusTask && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-60 flex flex-col items-center justify-center gap-8 ${bgClass}`}
        >
          <button
            onClick={onClose}
            className="absolute top-10 right-8 px-5 py-2.5 rounded-full border border-current/20 font-black uppercase text-[10px] tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            Abort
          </button>

          <div className="flex flex-col items-center gap-1 px-8 text-center">
            <p className="text-xs font-bold uppercase tracking-widest opacity-40">Focusing on</p>
            <h2 className="text-2xl font-black">{focusTask.text}</h2>
          </div>

          <div className="w-44 relative">
            <svg viewBox="0 0 100 200" className="w-full drop-shadow-[0_20px_40px_rgba(16,185,129,0.3)]">
              {/* top sand — shrinks down as time elapses */}
              <motion.rect
                x="20" width="60"
                className="fill-emerald-500"
                animate={{ y: 20 + focusCompletionRatio * 75, height: Math.max(0, 75 - focusCompletionRatio * 75) }}
                transition={{ ease: "linear", duration: 1 }}
              />
              {/* trickle — shortens as top empties */}
              <motion.rect
                x="49" y="95" width="2"
                className="fill-emerald-400"
                animate={{ height: Math.max(0, 85 - focusCompletionRatio * 75), opacity: focusRemainingSeconds > 0 ? 1 : 0 }}
                transition={{ ease: "linear", duration: 1 }}
              />
              {/* bottom sand — grows as time elapses */}
              <motion.rect
                x="20" width="60"
                className="fill-emerald-500"
                animate={{ y: 180 - focusCompletionRatio * 75, height: focusCompletionRatio * 75 }}
                transition={{ ease: "linear", duration: 1 }}
              />
              {/* stencil mask — cuts hourglass shape */}
              <path
                d="M 0 0 h 100 v 200 h -100 Z M 20 20 C 20 65 43 85 50 95 C 57 85 80 65 80 20 Z M 50 105 C 43 115 20 135 20 180 L 80 180 C 80 135 57 115 50 105 Z"
                fill="currentColor"
                className={stencilColorClass}
                fillRule="evenodd"
              />
            </svg>
          </div>

          <div className="text-6xl font-mono font-black tabular-nums tracking-tight">
            {mins}:{secs}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
