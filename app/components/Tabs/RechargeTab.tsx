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

// RechargeTab component provides quick self-care activities to help users reset and refocus
// Each activity is represented as a button with an icon and title, and triggers a confetti animation when clicked
// Example usage:
// <RechargeTab />

export default function RechargeTab() {
  return (
    <motion.div key="recharge-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 pt-4">
      {RECHARGE_ITEMS.map((item, i) => (
        <motion.button
          key={`recharge-${i}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => confetti({ colors: ['#60a5fa'] })}
          className="w-full flex items-center gap-6 p-7 rounded-[40px] transition-all border bg-white border-slate-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-xl"
        >
          <span className="text-3xl p-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl">{item.icon}</span>
          <span className="font-bold text-xl text-slate-800 dark:text-white">{item.title}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
