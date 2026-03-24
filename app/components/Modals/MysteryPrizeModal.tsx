"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Gift } from "lucide-react";

type Properties = {
  prize: string | null;
  onClaim: () => void;
};

export default function MysteryPrizeModal({ prize, onClaim }: Properties) {
  return (
    <AnimatePresence>
      {prize && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-70 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="w-full max-w-sm rounded-[48px] p-10 bg-purple-600 text-white text-center shadow-2xl"
          >
            <Gift size={64} className="mx-auto mb-6 text-amber-300" />
            <h2 className="text-xl font-black mb-2 opacity-80 uppercase tracking-widest">You Won:</h2>
            <h3 className="text-4xl font-black mb-8 text-amber-300 drop-shadow-md">{prize}</h3>
            <button onClick={onClaim} className="w-full p-4 rounded-3xl bg-white text-purple-600 font-black text-lg shadow-lg active:scale-95 transition-all">
              Claim Reward
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
