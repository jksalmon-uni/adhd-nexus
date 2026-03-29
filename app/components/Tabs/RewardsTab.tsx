"use client";
import { X, Gift } from "lucide-react";
import { Reward } from "../../types";

interface RewardsTabProps {
  points: number;
  rewards: Reward[];
  onOpenMysteryBox: () => void;
  onRemoveReward: (id: string) => void;
  onRedeemReward: (reward: Reward) => void;
  isDark: boolean;
  colorMap: Record<string, string>;
}

export default function RewardsTab({ 
  points, rewards, onOpenMysteryBox, onRemoveReward, onRedeemReward, isDark, colorMap 
}: RewardsTabProps) {
  return (
    <div className="space-y-4 pt-4">
      {/* Mystery Box */}
      <button
        onClick={onOpenMysteryBox}
        className={`w-full flex justify-between items-center p-8 rounded-[36px] transition-all border border-purple-500/50 bg-purple-500/10 shadow-lg ${points >= 30 ? 'active:scale-95' : 'opacity-40 pointer-events-none'}`}
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl p-3 bg-purple-500 text-white rounded-2xl"><Gift size={24} /></span>
          <div className="flex flex-col items-start">
            <span className="font-black text-lg text-purple-500">Mystery Box</span>
            <span className="text-xs font-bold opacity-60">A fun gamble!</span>
          </div>
        </div>
        <span className="text-amber-500 font-black">30 💎</span>
      </button>

      {/* Reward List */}
      {rewards.map((r) => (
        <div key={r.id} className="relative group">
          <button
            onClick={() => onRedeemReward(r)}
            className={`w-full flex justify-between items-center p-6 rounded-[32px] border ${points >= r.cost ? colorMap.card : 'opacity-30 pointer-events-none'}`}
          >
            <div className="text-left">
              <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>{r.title}</div>
              <div className={`text-xs ${colorMap.textMuted}`}>Value: {r.duration}m</div>
            </div>
            <span className="text-amber-500 font-black">{r.cost} 💎</span>
          </button>
          <button onClick={() => onRemoveReward(r.id)} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full"><X size={12}/></button>
        </div>
      ))}
    </div>
  );
}
