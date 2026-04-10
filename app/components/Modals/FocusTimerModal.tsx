"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, CloudRain, Coffee, Headphones, CheckCircle2, Circle, CircleDashed, Hourglass, Gift } from "lucide-react";
import { Task, SubTask } from "../../types";

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
  toggleSubTask?: (taskId: string, subTaskId: string) => void;
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
  toggleSubTask,
}: FocusTimerModalProps) {
  const [timerStyle, setTimerStyle] = useState<'circle' | 'sand'>('circle');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const totalSeconds = focusTask.duration * 60;
  const progress = totalSeconds > 0 ? focusRemainingSeconds / totalSeconds : 0;
  
  const circumference = 879.6459; // 2 * Math.PI * 140
  const strokeDashoffset = isOvertime ? 0 : circumference - progress * circumference;

  const completedSubtasksCount = focusTask.subTasks?.filter(s => s.completed).length || 0;
  const totalSubtasksCount = focusTask.subTasks?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-start p-6 md:p-12 ${
        isOvertime ? (isDark ? "bg-amber-950 text-amber-50" : "bg-amber-50 text-amber-900") : colorMap.bg
      } transition-colors duration-500 overflow-y-auto`}
    >
      <div className="fixed top-8 md:top-12 left-0 right-0 px-8 flex justify-between items-center z-10 pointer-events-none">
        <div className={`flex rounded-full p-1 border pointer-events-auto bg-white/50 dark:bg-black/50 backdrop-blur-md ${colorMap.card}`}>
          {(["none", "rain", "cafe", "lofi"] as const).map((a) => (
            <button
              key={`amb-${a}`}
              onClick={() => setAmbientTrack(a)}
              className={`p-2 md:p-3 rounded-full transition-all ${
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
          className={`pointer-events-auto px-4 md:px-6 py-2 md:py-3 rounded-full border font-bold uppercase tracking-widest text-xs active:scale-95 transition-all bg-white/50 dark:bg-black/50 backdrop-blur-md ${colorMap.card} ${colorMap.textMain}`}
        >
          {isOvertime ? "End Session" : "Abort"}
        </button>
      </div>

      <div className="w-full max-w-4xl flex flex-col items-center justify-start pt-24 pb-12">
        
        <div className="text-center mb-6 shrink-0 flex flex-col items-center">
          <h2 className={`text-3xl md:text-5xl font-black mb-2 transition-colors ${
              isOvertime ? (isDark ? "text-amber-400" : "text-amber-600") : colorMap.textMain
            }`}
          >
            {isOvertime ? "Flow Zone" : focusTask.text}
          </h2>
          <p className={`text-sm md:text-base font-bold mb-4 ${isOvertime ? "text-amber-500" : "text-emerald-500"}`}>
            {isOvertime ? "In the final polish..." : "Focusing..."}
          </p>
          
          <div className="flex gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-full mb-2">
            <button onClick={() => setTimerStyle('circle')} className={`p-2 rounded-full transition-all ${timerStyle === 'circle' ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'opacity-50 hover:opacity-100'}`} title="Circular Timer">
              <CircleDashed size={16} className={timerStyle === 'circle' ? (isOvertime ? "text-amber-500" : "text-emerald-500") : colorMap.textMuted} />
            </button>
            <button onClick={() => setTimerStyle('sand')} className={`p-2 rounded-full transition-all ${timerStyle === 'sand' ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'opacity-50 hover:opacity-100'}`} title="Sand Timer">
              <Hourglass size={16} className={timerStyle === 'sand' ? (isOvertime ? "text-amber-500" : "text-emerald-500") : colorMap.textMuted} />
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center mb-8 shrink-0 min-h-[16rem] md:min-h-[20rem]">
          {timerStyle === 'circle' ? (
            <svg className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90" viewBox="0 0 320 320">
              {/* Background Circle */}
              <circle
                cx="160"
                cy="160"
                r="140"
                fill="transparent"
                stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                strokeWidth="12"
              />
              {/* Progress Circle */}
              <circle
                cx="160"
                cy="160"
                r="140"
                fill="transparent"
                stroke={isOvertime ? (isDark ? "#fbbf24" : "#f59e0b") : (isDark ? "#10b981" : "#10b981")}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
          ) : (
            <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
              <svg viewBox="0 0 100 200" className="w-32 h-64 md:w-40 md:h-80 drop-shadow-2xl">
                <defs>
                  <clipPath id="topSandClip">
                     <path d="M 10 10 L 90 10 C 90 40 60 80 55 95 L 45 95 C 40 80 10 40 10 10 Z" />
                  </clipPath>
                  <clipPath id="bottomSandClip">
                     <path d="M 45 105 L 55 105 C 60 120 90 160 90 190 L 10 190 C 10 160 40 120 45 105 Z" />
                  </clipPath>
                </defs>
                <path d="M 10 10 L 90 10 C 90 40 60 80 55 95 L 45 95 C 40 80 10 40 10 10 Z M 45 105 L 55 105 C 60 120 90 160 90 190 L 10 190 C 10 160 40 120 45 105 Z" 
                      fill={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 
                      stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"} strokeWidth="2" />
                
                <g clipPath="url(#topSandClip)">
                   <rect x="0" y={10 + (1 - progress) * 85} width="100" height={85 * progress} fill={isOvertime ? (isDark ? "#fbbf24" : "#f59e0b") : "#10b981"} className="transition-all duration-1000 ease-linear" />
                </g>
                
                <g clipPath="url(#bottomSandClip)">
                   <rect x="0" y={190 - (1 - progress) * 85} width="100" height={85 * (1 - progress)} fill={isOvertime ? (isDark ? "#fbbf24" : "#f59e0b") : "#10b981"} className="transition-all duration-1000 ease-linear" />
                </g>
                
                {progress > 0 && progress < 1 && (
                  <rect x="49" y="95" width="2" height="95" fill={isOvertime ? (isDark ? "#fbbf24" : "#f59e0b") : "#10b981"} opacity="0.5" />
                )}
              </svg>
            </div>
          )}
          
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <div className={`font-mono font-black tabular-nums tracking-tighter transition-colors ${
                timerStyle === 'sand'
                  ? `text-4xl md:text-5xl ${isDark ? 'text-zinc-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-zinc-900 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]'}`
                  : `text-5xl md:text-7xl ${isOvertime ? (isDark ? "text-amber-400" : "text-amber-600") : colorMap.textMain}`
              }`}
            >
              {isOvertime ? `+${formatTime(overtimeSeconds)}` : formatTime(focusRemainingSeconds)}
            </div>
            {totalSubtasksCount > 0 && (
              <div className={`mt-1 md:mt-2 font-bold ${
                timerStyle === 'sand'
                  ? `text-xs md:text-sm opacity-90 ${isDark ? 'text-zinc-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'text-zinc-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]'}`
                  : `text-sm ${isOvertime ? "text-amber-500/80" : "text-emerald-500/80"}`
                }`}>
                {completedSubtasksCount} / {totalSubtasksCount} Subtasks
              </div>
            )}
            {focusTask.bounty && (
              <div className={`mt-2 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-black text-xs md:text-sm shadow-xl backdrop-blur-sm ${
                isOvertime ? "bg-amber-500 text-amber-50 border border-amber-400" : "bg-amber-400 text-amber-950 border border-amber-300"
              }`}>
                <Gift size={14} /> {focusTask.bounty}
              </div>
            )}
          </div>
        </div>

        {totalSubtasksCount > 0 && (
          <div className="w-full max-w-md flex-1 overflow-y-auto min-h-0 mb-6 px-4">
            <div className="space-y-3">
              {focusTask.subTasks
                .filter(s => !s.completed)
                .slice(0, 2)
                .map((subTask: SubTask, index: number) => {
                  const isActive = index === 0;
                  const isUpNext = index === 1;

                  let subTaskClasses = "";
                  let iconColor = "";

                  if (isActive) {
                    subTaskClasses = isOvertime 
                      ? (isDark ? "bg-amber-900/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50 text-amber-100" : "bg-amber-50 border-amber-400 shadow-md ring-1 ring-amber-400 text-amber-900")
                      : (isDark ? "bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50 text-emerald-100" : "bg-emerald-50 border-emerald-400 shadow-md ring-1 ring-emerald-400 text-emerald-900");
                    iconColor = isOvertime ? "text-amber-500" : "text-emerald-500";
                  } else if (isUpNext) {
                    subTaskClasses = (isDark ? "bg-zinc-900/40 border-zinc-800 text-zinc-400 opacity-60" : "bg-slate-50 border-slate-200 text-slate-500 opacity-60") + " scale-[0.98]";
                    iconColor = colorMap.textMuted;
                  }

                  return (
                    <button
                      key={subTask.id}
                      onClick={() => toggleSubTask && toggleSubTask(focusTask.id, subTask.id)}
                      className={`w-full text-left flex items-start gap-4 p-5 rounded-[24px] transition-all active:scale-[0.98] border ${subTaskClasses}`}
                    >
                      <div className={`mt-0.5 shrink-0 transition-colors ${iconColor}`}>
                        <Circle size={24} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        {isActive && <span className={`text-[10px] font-black uppercase mb-1 tracking-wider ${iconColor}`}>Active Step</span>}
                        {isUpNext && <span className={`text-[10px] font-black uppercase mb-1 tracking-wider ${iconColor}`}>Up Next</span>}
                        <span className={`text-sm md:text-base font-bold leading-relaxed break-words whitespace-normal ${isActive ? '' : 'font-medium'}`}>
                          {subTask.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        <button
          onClick={() => endFocusSession(true)}
          className={`shrink-0 mt-4 mb-8 ${
            isOvertime ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
          } text-white font-bold py-4 px-10 rounded-full text-lg shadow-xl transition-all active:scale-95`}
        >
          Have you completed it?
        </button>

      </div>
    </motion.div>
  );
}