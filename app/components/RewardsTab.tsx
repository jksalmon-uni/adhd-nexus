"use client";
import { useState } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Gift, Plus, X } from "lucide-react";

import type { Reward } from "../types";

type Properties = {
  isDark: boolean;
  points: number;
  rewards: Reward[];
  onSpendPoints: (amount: number) => void;
  onRewardsChange: (rewards: Reward[]) => void;
  onMysteryWin: (prize: string) => void;
  playSound: (s: string) => void;
};

export default function RewardsTab({ isDark, points, rewards, onSpendPoints, onRewardsChange, onMysteryWin, playSound }: Properties) {
  const [newTitle, setNewTitle] = useState("");
  const [newCost, setNewCost] = useState<number | "">("");

  const card = isDark ? "bg-zinc-900 border-zinc-800 shadow-xl" : "bg-white border-slate-200 shadow-sm";
  const input = isDark ? "bg-zinc-800 text-white border-zinc-700" : "bg-white text-slate-900 border-slate-300";

  const openMysteryBox = () => {
    if (points < 30) return;
    onSpendPoints(30);
    playSound('redeem');
    confetti({ particleCount: 150, spread: 100, colors: ['#a855f7', '#fcd34d', '#3b82f6'] });
    const fallbackPrizes = ["Free Pass on 1 Chore", "Take a 20 min Nap", "Buy a small treat", "Order Takeout tonight"];
    const pool = [...rewards.map(r => r.title), ...fallbackPrizes];
    onMysteryWin(pool[Math.floor(Math.random() * pool.length)]);
  };

  const redeemReward = (reward: Reward) => {
    if (points < reward.cost) return;
    onSpendPoints(reward.cost);
    playSound('redeem');
    confetti();
  };

  const addReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCost || Number(newCost) <= 0) return;
    onRewardsChange([...rewards, { title: newTitle, cost: Number(newCost), id: Date.now().toString() }]);
    setNewTitle("");
    setNewCost("");
  };

  const deleteReward = (id: string) => {
    onRewardsChange(rewards.filter(r => r.id !== id));
  };

  return (
    <motion.div key="rewards-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 pt-4">
      {/* Mystery Box */}
      <button
        onClick={openMysteryBox}
        className={`w-full flex justify-between items-center p-8 rounded-[36px] transition-all border border-purple-500/50 bg-purple-500/10 shadow-lg ${points >= 30 ? 'active:scale-95 hover:bg-purple-500/20' : 'opacity-40 pointer-events-none'}`}
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl p-3 bg-purple-500 text-white rounded-2xl"><Gift size={24} /></span>
          <div className="flex flex-col items-start">
            <span className="font-black text-lg text-purple-500">Mystery Box</span>
            <span className="text-xs font-bold opacity-60">Variable Dopamine</span>
          </div>
        </div>
        <span className="text-amber-500 font-black">30 💎</span>
      </button>

      {/* Add reward form */}
      <form onSubmit={addReward} className={`p-3 rounded-4xl mt-8 mb-6 flex items-center gap-2 border ${card} overflow-hidden`}>
        <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Reward..." className={`flex-1 min-w-0 px-4 py-3 rounded-2xl text-sm border ${input}`} />
        <input type="number" value={newCost} onChange={e => setNewCost(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Cost" min="1" className={`w-24 px-3 py-3 rounded-2xl text-sm border ${input}`} />
        <button type="submit" className="bg-purple-600 w-12 h-12 flex shrink-0 items-center justify-center rounded-2xl font-bold text-white">
          <Plus size={20} />
        </button>
      </form>

      {/* Rewards list */}
      {rewards.map((r, i) => (
        <div key={`reward-${r.id}-${i}`} className="relative group">
          <button
            onClick={() => redeemReward(r)}
            className={`w-full flex justify-between items-center p-8 rounded-[36px] transition-all border ${points >= r.cost ? card + ' active:scale-95' : 'opacity-20 pointer-events-none border-transparent'}`}
          >
            <span className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>{r.title}</span>
            <span className="text-amber-500 font-black">{r.cost} 💎</span>
          </button>
          <button
            onClick={() => deleteReward(r.id)}
            className="absolute -top-3 -right-3 bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black opacity-0 group-hover:opacity-100 shadow-xl transition-all"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </motion.div>
  );
}
