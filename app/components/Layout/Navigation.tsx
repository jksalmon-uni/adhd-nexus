import { motion, LayoutGroup } from "framer-motion";
import { Target, Calendar as CalIcon, Leaf, Gem } from "lucide-react";
import { PenTool } from "lucide-react";

interface NavigationProps {
  activeTab: "focus" | "calendar" | "scramble" | "recharge" | "rewards" | "scramble";
  setActiveTab: (tab: "focus" | "calendar" | "recharge" | "rewards" | "scramble") => void;
  isDark: boolean;
  colorMap: Record<string, string>;
}

export default function Navigation({
  activeTab,
  setActiveTab,
  isDark,
  colorMap,
}: NavigationProps) {
  return (
    <LayoutGroup>
      <nav
        className={`grid grid-cols-5 gap-1 p-1.5 rounded-2xl mb-8 ${
          isDark ? "bg-zinc-900" : "bg-slate-200"
        }`}
      >
        <button
          onClick={() => setActiveTab("focus")}
          className={`relative py-3.5 rounded-xl text-[10px] font-bold capitalize transition-all flex flex-col items-center gap-1 ${
            activeTab === "focus" ? "text-white" : colorMap.tabInactive
          }`}
        >
          {activeTab === "focus" && (
            <motion.div
              layoutId="tab-pill"
              className={`absolute inset-0 rounded-xl z-0 bg-emerald-600`}
              transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
            />
          )}
          <span className="relative z-10">
            <Target size={16} />
          </span>
          <span className="relative z-10">Focus</span>
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`relative py-3.5 rounded-xl text-[10px] font-bold capitalize transition-all flex flex-col items-center gap-1 ${
            activeTab === "calendar" ? "text-white" : colorMap.tabInactive
          }`}
        >
          {activeTab === "calendar" && (
            <motion.div
              layoutId="tab-pill"
              className={`absolute inset-0 rounded-xl z-0 bg-emerald-600`}
              transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
            />
          )}
          <span className="relative z-10">
            <CalIcon size={16} />
          </span>
          <span className="relative z-10">Calendar</span>
        </button>
        <button
  onClick={() => setActiveTab("scramble")}
  className={`flex flex-col items-center gap-1 p-2 transition-all ${
    activeTab === "scramble"
      ? "text-emerald-500 scale-110 font-black"
      : `${colorMap.textMuted} hover:text-emerald-400`
  }`}
>
  <PenTool size={24} strokeWidth={activeTab === "scramble" ? 2.5 : 2} />
  <span className="text-[10px] font-bold">Scramble</span>
</button>
        <button
          onClick={() => setActiveTab("recharge")}
          className={`relative py-3.5 rounded-xl text-[10px] font-bold capitalize transition-all flex flex-col items-center gap-1 ${
            activeTab === "recharge" ? "text-white" : colorMap.tabInactive
          }`}
        >
          {activeTab === "recharge" && (
            <motion.div
              layoutId="tab-pill"
              className={`absolute inset-0 rounded-xl z-0 bg-emerald-600`}
              transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
            />
          )}
          <span className="relative z-10">
            <Leaf size={16} />
          </span>
          <span className="relative z-10">Recharge</span>
        </button>
        <button
          onClick={() => setActiveTab("rewards")}
          className={`relative py-3.5 rounded-xl text-[10px] font-bold capitalize transition-all flex flex-col items-center gap-1 ${
            activeTab === "rewards" ? "text-white" : colorMap.tabInactive
          }`}
        >
          {activeTab === "rewards" && (
            <motion.div
              layoutId="tab-pill"
              className={`absolute inset-0 rounded-xl z-0 bg-emerald-600`}
              transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
            />
          )}
          <span className="relative z-10">
            <Gem size={16} />
          </span>
          <span className="relative z-10">Rewards</span>
        </button>
      </nav>
    </LayoutGroup>
  );
}
