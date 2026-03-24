"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, CloudRain, Coffee, Headphones } from "lucide-react";
import type { Task } from "../../types";

type AmbientTrack = "none" | "rain" | "cafe" | "lofi";

type Properties = {
    focusTask: Task | null;
    focusRemainingSeconds: number;
    focusCompletionRatio: number;
    bgClass: string;
    cardClass: string;
    textMainClass: string;
    textMutedClass: string;
    hourglassSandClass: string;
    stencilColorClass: string;
    isDark: boolean;
    ambientTrack: AmbientTrack;
    onAmbientTrackChange: (track: AmbientTrack) => void;
    onClose: () => void;
};

const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default function FocusModeModal({
    focusTask,
    focusRemainingSeconds,
    focusCompletionRatio,
    bgClass,
    cardClass,
    textMainClass,
    textMutedClass,
    hourglassSandClass,
    stencilColorClass,
    isDark,
    ambientTrack,
    onAmbientTrackChange,
    onClose,
}: Properties) {
    return (
        <AnimatePresence>
            {focusTask && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`fixed inset-0 z-60 flex flex-col items-center justify-center p-12 ${bgClass}`}
                >
                    <div className="absolute top-12 left-0 right-0 px-8 flex justify-between items-center">
                        <div className={`flex rounded-full p-1 border ${cardClass}`}>
                            {(["none", "rain", "cafe", "lofi"] as const).map((track) => (
                                <button
                                    key={`amb-${track}`}
                                    onClick={() => onAmbientTrackChange(track)}
                                    className={`p-3 rounded-full transition-all ${
                                        ambientTrack === track
                                            ? "bg-emerald-500 text-white shadow-lg"
                                            : `${textMutedClass} hover:opacity-80`
                                    }`}
                                >
                                    {track === "none" && <X size={16} />}
                                    {track === "rain" && <CloudRain size={16} />}
                                    {track === "cafe" && <Coffee size={16} />}
                                    {track === "lofi" && <Headphones size={16} />}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={onClose}
                            className={`px-6 py-3 rounded-full border font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all ${cardClass} ${textMainClass}`}
                        >
                            Abort
                        </button>
                    </div>

                    <h2 className={`text-3xl font-black text-center mb-8 mt-12 ${textMainClass}`}>
                        {focusTask.text}
                    </h2>

                    <div className="w-full max-w-sm flex items-center justify-center relative mb-8" style={{ aspectRatio: "1 / 1.5" }}>
                        <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-2xl" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <linearGradient id="sandGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" className={`${hourglassSandClass} opacity-80`} />
                                    <stop offset="100%" className={`${hourglassSandClass} opacity-50`} />
                                </linearGradient>
                                <mask id="topMask" maskUnits="objectBoundingBox">
                                    <motion.rect
                                        x="0"
                                        y="0"
                                        width="100"
                                        animate={{ height: `${(1 - focusCompletionRatio) * 100}%` }}
                                        transition={{ ease: "linear", duration: 1 }}
                                        fill="white"
                                    />
                                </mask>
                                <mask id="bottomMask" maskUnits="objectBoundingBox">
                                    <motion.rect
                                        x="0"
                                        width="100"
                                        animate={{
                                            height: `${focusCompletionRatio * 100}%`,
                                            y: `${(1 - focusCompletionRatio) * 100}%`,
                                        }}
                                        transition={{ ease: "linear", duration: 1 }}
                                        fill="white"
                                    />
                                </mask>
                            </defs>
                            <path
                                d="M 20 20 C 20 65 43 85 50 95 C 57 85 80 65 80 20 Z"
                                className={isDark ? "fill-white/5" : "fill-black/5"}
                            />
                            <path
                                d="M 50 105 C 43 115 20 135 20 180 L 80 180 C 80 135 57 115 50 105 Z"
                                className={isDark ? "fill-white/5" : "fill-black/5"}
                            />
                            <motion.rect
                                x="20"
                                width="60"
                                className="fill-emerald-500"
                                initial={{ y: 20, height: 75 }}
                                animate={{ y: 20 + focusCompletionRatio * 75, height: 75 - focusCompletionRatio * 75 }}
                                transition={{ ease: "linear", duration: 1 }}
                            />
                            <motion.rect
                                x="49"
                                y="95"
                                width="2"
                                className="fill-emerald-500"
                                initial={{ height: 85, opacity: 0 }}
                                animate={{
                                    height: 85 - focusCompletionRatio * 75,
                                    opacity:
                                        focusRemainingSeconds > 0 && focusCompletionRatio > 0 && focusCompletionRatio < 1
                                            ? 1
                                            : 0,
                                }}
                                transition={{ ease: "linear", duration: 1 }}
                            />
                            <motion.rect
                                x="20"
                                width="60"
                                className="fill-emerald-500"
                                initial={{ y: 180, height: 0 }}
                                animate={{ y: 180 - focusCompletionRatio * 75, height: focusCompletionRatio * 75 }}
                                transition={{ ease: "linear", duration: 1 }}
                            />
                            <path
                                d="M 0 0 h 100 v 200 h -100 Z M 20 20 C 20 65 43 85 50 95 C 57 85 80 65 80 20 Z M 50 105 C 43 115 20 135 20 180 L 80 180 C 80 135 57 115 50 105 Z"
                                fill="currentColor"
                                className={stencilColorClass}
                                fillRule="evenodd"
                            />
                            <path
                                d="M 20 20 C 20 65 43 85 50 95 C 57 85 80 65 80 20 Z"
                                fill="none"
                                className={isDark ? "stroke-white/20" : "stroke-slate-900/20"}
                                strokeWidth="2"
                            />
                            <path
                                d="M 50 105 C 43 115 20 135 20 180 L 80 180 C 80 135 57 115 50 105 Z"
                                fill="none"
                                className={isDark ? "stroke-white/20" : "stroke-slate-900/20"}
                                strokeWidth="2"
                            />
                            <rect x="15" y="10" width="70" height="10" rx="4" className={isDark ? "fill-zinc-800" : "fill-slate-800"} />
                            <rect x="15" y="180" width="70" height="10" rx="4" className={isDark ? "fill-zinc-800" : "fill-slate-800"} />
                        </svg>
                        <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none ${textMainClass}`}>
                            <span className="text-6xl font-mono font-black tabular-nums tracking-tighter drop-shadow-md bg-white/20 dark:bg-black/20 backdrop-blur-sm px-4 py-2 rounded-2xl">
                                {formatTime(focusRemainingSeconds)}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}