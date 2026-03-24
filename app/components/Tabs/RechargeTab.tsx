"use client";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Zap, Leaf, Play } from "lucide-react";

const RECHARGE_ITEMS = [
  { 
    title: "2 Minute Meditation",
    icon: <Zap className="text-yellow-400" /> 
  },
  { title: "Step outside for air", 
    icon: <Leaf className="text-emerald-400" /> 
  },
  { title: "Drink a glass of water",
    icon: <Play className="text-blue-400 rotate-90" /> 
  },
  { title: "Quick 1-minute stretch",
    icon: <Zap className="text-purple-400" /> 
  },
];

type Properties = {
  isDark: boolean;
};

export default function RechargeTab({ isDark }: Properties) {
  const card        = isDark ? "bg-zinc-900 border-zinc-800 shadow-xl" : "bg-white border-slate-200 shadow-sm";
  const iconBg      = isDark ? "bg-zinc-800" : "bg-slate-100";
  const labelColor  = isDark ? "text-white" : "text-slate-800";

  return (
    <motion.div key="recharge-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 pt-4">
      {RECHARGE_ITEMS.map((item, i) => (
        <motion.button
          key={`recharge-${i}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => confetti({ colors: ['#60a5fa'] })} 
          className={`w-full flex items-center gap-6 p-7 rounded-[40px] transition-all border ${card}`}
        >
          <span className={`text-3xl p-3 ${iconBg} rounded-2xl`}>{item.icon}</span>
          <span className={`font-bold text-xl ${labelColor}`}>{item.title}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
