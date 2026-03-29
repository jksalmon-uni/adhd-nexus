"use client";
import { motion } from "framer-motion";
import { X, CloudRain, Coffee, Headphones } from "lucide-react";
import { Task } from "../../types";

interface FocusTimerModalProps {
  focusTask: Task;
  isOvertime: boolean;
  overtimeSeconds: number;
  focusRemainingSeconds: number;
  ambientTrack: "none" | "rain" | "cafe" | "lofi";
  setAmbientTrack: (track: "none" | "rain" | "cafe" | "lofi") => void;
  endFocusSession: (completed: boolean) => void;
  colorMap: Record<string, string>;
  isDark: boolean;
  formatTime: (seconds: number) => string;
}

export default function FocusTimerModal({
  focusTask,
  isOvertime,
  overtimeSeconds,
  focusRemainingSeconds,
  ambientTrack,
  setAmbientTrack,
  endFocusSession,
  colorMap,
  isDark,
  formatTime,
}: FocusTimerModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-12 ${
        isOvertime ? (isDark ? "bg-amber-950/95" : "bg-amber-50/95") : colorMap.bg
      } transition-colors duration-500`}
    >
      <div className="absolute top-12 left-0 right-0 px-8 flex justify-between items-center">
        <div className={`flex rounded-full p-1 border ${colorMap.card}`}>
          {(["none", "rain", "cafe", "lofi"] as const).map((a) => (
            <button
              key={`amb-${a}`}
              onClick={() => setAmbientTrack(a)}
              className={`p-3 rounded-full transition-all ${
                ambientTrack === a
                  ? `${isOvertime ? "bg-amber-500" : "bg-emerald-500"} text-white shadow-lg`
                  : `${colorMap.textMuted} hover:opacity-80`
              }`}
            >
              {a === "none" && <X size={16} />}
              {a === "rain" && <CloudRain size={16} />}
              {a === "cafe" && <Coffee size={16} />}
              {a === "lofi" && <Headphones size={16} />}
            </button>
          ))}
        </div>
        <button
          onClick={() => endFocusSession(false)}
          className={`px-6 py-3 rounded-full border font-bold uppercase tracking-widest text-xs active:scale-95 transition-all ${colorMap.card} ${colorMap.textMain}`}
        >
          {isOvertime ? "End Session" : "Abort"}
        </button>
      </div>

      <h2 className={`text-3xl font-black text-center mb-2 transition-colors ${
          isOvertime ? "text-amber-600 dark:text-amber-400" : colorMap.textMain
        }`}
      >
        {isOvertime ? "Flow Zone" : focusTask.text}
      </h2>
      <p className={`text-sm font-bold ${isOvertime ? "text-amber-500" : "text-emerald-500"}`}>
        {isOvertime ? "In the final polish..." : "Focusing..."}
      </p>

      <div className="my-8">
        <div className={`text-7xl font-mono font-black tabular-nums tracking-tighter drop-shadow-md bg-white/20 dark:bg-black/20 backdrop-blur-sm px-6 py-3 rounded-3xl transition-colors ${
            isOvertime ? "text-amber-600 dark:text-amber-400" : colorMap.textMain
          }`}
        >
          {isOvertime ? `+ ${formatTime(overtimeSeconds)}` : formatTime(focusRemainingSeconds)}
        </div>
      </div>

      <button
        onClick={() => endFocusSession(true)}
        className={`${
          isOvertime ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-500 hover:bg-emerald-600"
        } text-white font-bold py-4 px-10 rounded-full text-lg transition-colors`}
      >
        Have you completed it?
      </button>
    </motion.div>
  );
}