import { motion } from "framer-motion";
import { History, Settings } from "lucide-react";

interface StatusBarProps {
  totalXp: number;
  points: number;
  colorMap: Record<string, string>;
  setIsVaultOpen: (isOpen: boolean) => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
}

export default function StatusBar({
  totalXp,
  points,
  colorMap,
  setIsVaultOpen,
  setIsSettingsOpen,
}: StatusBarProps) {
  return (
    <div className="flex justify-between items-start pt-8 pb-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black bg-white shadow-sm text-emerald-600 dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:text-emerald-400">
            <span className="text-[8px] opacity-50 -mb-1">LVL</span>
            {Math.floor(totalXp / 100) + 1}
          </div>
          <div className="flex flex-col gap-1">
            <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totalXp % 100}%` }}
                className="h-full bg-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsVaultOpen(true)}
          className={`p-2.5 rounded-xl ${colorMap.card} flex items-center justify-center`}
        >
          <History size={18} />
        </button>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`p-2.5 rounded-xl ${colorMap.card} flex items-center justify-center`}
        >
          <Settings size={18} />
        </button>
        <div className="px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-xl border border-amber-300 text-amber-600 bg-amber-50 dark:border-amber-500/20 dark:text-amber-400 dark:bg-zinc-900">
          <span>💎</span>
          {points}
        </div>
      </div>
    </div>
  );
}
