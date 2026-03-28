import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BreathingModalProps {
  onClose: () => void;
}

const phases = [
    { text: "Inhale (4s)", duration: 4000, scale: 1.5, ease: "easeInOut" },
    { text: "Hold (7s)", duration: 7000, scale: 1.5, ease: "linear" },
    { text: "Exhale (8s)", duration: 8000, scale: 1, ease: "easeInOut" },
];

export default function BreathingModal({ onClose }: BreathingModalProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
        setPhaseIndex((prevIndex) => (prevIndex + 1) % phases.length);
    }, phases[phaseIndex].duration);

    return () => clearTimeout(timer);
  }, [phaseIndex]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-teal-950 flex flex-col items-center justify-center"
      >
        <motion.div
          animate={{
            scale: phases[phaseIndex].scale,
          }}
          transition={{
            duration: phases[phaseIndex].duration / 1000,
            ease: "easeInOut",
          }}
          className="w-48 h-48 rounded-full bg-emerald-400/20 flex items-center justify-center border-2 border-emerald-400/50 shadow-[0_0_30px_0px_rgba(5,150,105,0.5)]"
        >
            <motion.span
                key={phases[phaseIndex].text}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-white font-bold text-2xl text-center"
            >
                {phases[phaseIndex].text}
            </motion.span>
        </motion.div>
        <button
          onClick={onClose}
          className="absolute bottom-16 bg-white/10 text-white font-bold py-3 px-6 rounded-full"
        >
          End Session
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
