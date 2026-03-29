import { motion } from "framer-motion";

interface OverwhelmModalProps {
  setOverwhelmMode: (mode: boolean) => void;
  setIsDumpOpen: (isOpen: boolean) => void;
  triggerVentMode: () => void;
}

export default function OverwhelmModal({
  setOverwhelmMode,
  setIsDumpOpen,
  triggerVentMode,
}: OverwhelmModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] animate-pulse" />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 8,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="w-64 h-64 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50"
      >
        <motion.div
            animate={{
                scale: [1.1, 1, 1.1],
                opacity: [1, 0.8, 1],
            }}
            transition={{
                duration: 8,
                ease: "easeInOut",
                repeat: Infinity,
            }}
            className="w-48 h-48 rounded-full bg-emerald-500/30 flex items-center justify-center border border-emerald-500/60"
        >
            <span className="text-white font-bold text-3xl">Breathe</span>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-24 flex flex-col gap-4 items-center">
        <button
          onClick={() => {
            setOverwhelmMode(false);
            setIsDumpOpen(true);
            triggerVentMode();
          }}
          className="bg-rose-500 text-white font-bold py-3 px-6 rounded-full text-lg"
        >
          I need to vent (60s)
        </button>
        <button
          onClick={() => setOverwhelmMode(false)}
          className="text-slate-400 text-sm"
        >
          I&apos;m ready to go back
        </button>
      </div>
    </motion.div>
  );
}
