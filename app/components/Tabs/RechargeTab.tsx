import { motion } from "framer-motion";
import confetti from "canvas-confetti";

interface RechargeTabProps {
  rechargeMenu: { title: string; icon: JSX.Element }[];
  colorMap: any;
  isDark: boolean;
}

export default function RechargeTab({
  rechargeMenu,
  colorMap,
  isDark,
}: RechargeTabProps) {
  return (
    <div className="space-y-4 pt-4">
      {rechargeMenu.map((item, i) => (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          key={`recharge-${i}`}
          onClick={() => confetti({ colors: ["#60a5fa"] })}
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
