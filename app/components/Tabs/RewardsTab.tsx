import { Gift, Plus, X } from "lucide-react";
import type { Reward } from "../../types";
import confetti from "canvas-confetti";

interface RewardsTabProps {
  points: number;
  setPoints: (points: number | ((p: number) => number)) => void;
  openMysteryBox: () => void;
  newRewardTitle: string;
  setNewRewardTitle: (title: string) => void;
  newRewardCost: number | "";
  setNewRewardCost: (cost: number | "") => void;
  rewards: Reward[];
  setRewards: (rewards: Reward[]) => void;
  colorMap: any;
  isDark: boolean;
  playSound: (sound: string) => void;
}

export default function RewardsTab({
  points,
  setPoints,
  openMysteryBox,
  newRewardTitle,
  setNewRewardTitle,
  newRewardCost,
  setNewRewardCost,
  rewards,
  setRewards,
  colorMap,
  isDark,
  playSound,
}: RewardsTabProps) {
  return (
    <div className="space-y-4 pt-4">
      <button
        onClick={openMysteryBox}
        className={`w-full flex justify-between items-center p-8 rounded-[36px] transition-all border border-purple-500/50 bg-purple-500/10 shadow-lg ${
          points >= 30
            ? "active:scale-95 hover:bg-purple-500/20"
            : "opacity-40 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl p-3 bg-purple-500 text-white rounded-2xl">
            <Gift size={24} />
          </span>
          <div className="flex flex-col items-start">
            <span className="font-black text-lg text-purple-500">
              Mystery Box
            </span>
            <span className="text-xs font-bold opacity-60">
              Variable Dopamine
            </span>
          </div>
        </div>
        <span className="text-amber-500 font-black">30 💎</span>
      </button>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newRewardTitle || !newRewardCost || Number(newRewardCost) <= 0)
            return;
          setRewards([
            ...rewards,
            {
              title: newRewardTitle,
              cost: Number(newRewardCost),
              id: Date.now().toString(),
            },
          ]);
          setNewRewardTitle("");
          setNewRewardCost("");
        }}
        className={`p-3 rounded-4xl mt-8 mb-6 flex items-center gap-2 ${colorMap.card} overflow-hidden`}
      >
        <input
          value={newRewardTitle}
          onChange={(e) => setNewRewardTitle(e.target.value)}
          placeholder="Reward..."
          className={`flex-1 min-w-0 px-4 py-3 rounded-2xl text-sm ${colorMap.input}`}
        />
        <input
          type="number"
          value={newRewardCost}
          onChange={(e) =>
            setNewRewardCost(e.target.value ? Number(e.target.value) : "")
          }
          placeholder="Cost"
          min="1"
          className={`w-24 px-3 py-3 rounded-2xl text-sm ${colorMap.input}`}
        />
        <button
          type="submit"
          className="bg-purple-600 w-12 h-12 flex shrink-0 items-center justify-center rounded-2xl font-bold text-white"
        >
          <Plus size={20} />
        </button>
      </form>
      {rewards.map((r, i) => (
        <div key={`reward-${r.id}-${i}`} className="relative group">
          <button
            onClick={() => {
              if (points >= r.cost) {
                setPoints((p) => p - r.cost);
                playSound("redeem");
                confetti();
              }
            }}
            className={`w-full flex justify-between items-center p-8 rounded-[36px] transition-all border ${
              points >= r.cost
                ? colorMap.card + " active:scale-95"
                : "opacity-20 pointer-events-none border-transparent"
            }`}
          >
            <span
              className={`font-black text-lg ${
                isDark ? "text-white" : "text-slate-800"
              }`}
            >
              {r.title}
            </span>
            <span className="text-amber-500 font-black">{r.cost} 💎</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRewards(rewards.filter((x) => x.id !== r.id));
            }}
            className="absolute -top-3 -right-3 bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black opacity-0 group-hover:opacity-100 shadow-xl transition-all"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
