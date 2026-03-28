import { motion } from "framer-motion";
import { Zap, Leaf, Droplet } from "lucide-react";

interface RechargeTabProps {
  colorMap: any;
  isDark: boolean;
  setIsBreathing: (isBreathing: boolean) => void;
  waterIntake: number;
  handleDrinkWater: () => void;
}

export default function RechargeTab({
  colorMap,
  isDark,
  setIsBreathing,
  waterIntake,
  handleDrinkWater,
}: RechargeTabProps) {
  const staticItems = [
    {
      title: "Step outside for air",
      icon: <Leaf className="text-emerald-400" />,
      action: () => {},
    },
    {
      title: "Quick 1-minute stretch",
      icon: <Zap className="text-purple-400" />,
      action: () => {},
    },
  ];

  return (
    <div className="space-y-4 pt-4">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsBreathing(true)}
        className={`w-full flex items-center gap-6 p-7 rounded-[40px] active:scale-95 transition-all ${colorMap.card} shadow-sm`}
      >
        <span
          className={`text-3xl p-3 ${colorMap.rechargeIconBg} rounded-2xl`}
        >
          <Zap className="text-yellow-400" />
        </span>
        <span
          className={`font-bold text-xl ${
            isDark ? "text-white" : "text-slate-800"
          }`}
        >
          4-7-8 Breathing
        </span>
      </motion.button>

      <div className={`p-7 rounded-[40px] ${colorMap.card} shadow-sm`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-slate-800'}`}>Water Intake</h3>
          <span className="font-black text-amber-500">{waterIntake} / 8</span>
        </div>
        <div className="grid grid-cols-8 gap-2 mb-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`water-dot-${i}`} className={`h-2 rounded-full ${i < waterIntake ? 'bg-blue-400' : isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />
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

      {staticItems.map((item, i) => (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          key={`recharge-${i}`}
          onClick={item.action}
          className={`w-full flex items-center gap-6 p-7 rounded-[40px] active:scale-95 transition-all ${colorMap.card} shadow-sm`}
        >
          <span
            className={`text-3xl p-3 ${colorMap.rechargeIconBg} rounded-2xl`}
          >
            {item.icon}
          </span>
          <span
            className={`font-bold text-xl ${
              isDark ? "text-white" : "text-slate-800"
            }`}
          >
            {item.title}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
