"use client";
import { motion } from "framer-motion";
import { Zap, Droplet, RefreshCw, Leaf } from "lucide-react";

interface RechargeTabProps {
  isDark: boolean;
  colorMap: Record<string, string>;
  waterIntake: number;
  handleDrinkWater: () => void;
  bubbleState: boolean[];
  handlePopBubble: (index: number) => void;
  resetBubbles: () => void;
  setIsBreathing: (val: boolean) => void;
  setGroundingStep: (val: number) => void;
}

export default function RechargeTab({
  isDark,
  colorMap,
  waterIntake,
  handleDrinkWater,
  bubbleState,
  handlePopBubble,
  resetBubbles,
  setIsBreathing,
  setGroundingStep,
}: RechargeTabProps) {
  return (
    <div className="space-y-4 pt-4">
      {/* Breathing */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsBreathing(true)}
        className={`w-full flex items-center gap-6 p-7 rounded-[40px] active:scale-95 transition-all ${colorMap.card} shadow-sm`}
      >
        <span className={`text-3xl p-3 ${colorMap.rechargeIconBg} rounded-2xl`}>
          <Zap className="text-yellow-400" />
        </span>
        <span className={`font-bold text-xl ${isDark ? "text-white" : "text-slate-800"}`}>
          4-7-8 Breathing
        </span>
      </motion.button>

      {/* Water Tracker */}
      <div className={`p-7 rounded-[40px] ${colorMap.card} shadow-sm`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-bold text-xl ${isDark ? "text-white" : "text-slate-800"}`}>
            Water Intake
          </h3>
          <span className="font-black text-amber-500">{waterIntake} / 8</span>
        </div>
        <div className="grid grid-cols-8 gap-2 mb-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`water-dot-${i}`}
              className={`h-2 rounded-full ${
                i < waterIntake ? "bg-blue-400" : isDark ? "bg-zinc-800" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDrinkWater}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-blue-500/10 text-blue-500 font-bold"
        >
          <Droplet size={16} />
          <span>Drink Water</span>
        </motion.button>
      </div>

      {/* Bubble Pop */}
      <div className={`p-7 rounded-[40px] ${colorMap.card} shadow-sm`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-bold text-xl ${isDark ? "text-white" : "text-slate-800"}`}>
            Bubble Pop
          </h3>
          <button onClick={resetBubbles}><RefreshCw size={14} className={colorMap.textMuted} /></button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {bubbleState.map((isPopped, i) => (
            <motion.button
              key={`bubble-${i}`}
              onClick={() => handlePopBubble(i)}
              animate={isPopped ? { scale: [1, 0.85, 0.9] } : {}}
              transition={{ duration: 0.2 }}
              className={`w-12 h-12 rounded-full transition-all duration-200 focus:outline-none ${
                isPopped
                  ? "bg-black/5 dark:bg-white/5 border-2 border-black/10 dark:border-white/10 shadow-inner scale-90 opacity-60"
                  : "bg-purple-400 shadow-[0_4px_8px_rgba(0,0,0,0.2),inset_0_-4px_8px_rgba(0,0,0,0.2)] scale-100"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Grounding */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setGroundingStep(1)}
        className={`w-full flex items-center gap-6 p-7 rounded-[40px] active:scale-95 transition-all ${colorMap.card} shadow-sm`}
      >
        <span className={`text-3xl p-3 ${colorMap.rechargeIconBg} rounded-2xl`}>
          <Leaf className="text-emerald-400" />
        </span>
        <span className={`font-bold text-xl ${isDark ? "text-white" : "text-slate-800"}`}>
          5-4-3-2-1 Grounding
        </span>
      </motion.button>
    </div>
  );
}