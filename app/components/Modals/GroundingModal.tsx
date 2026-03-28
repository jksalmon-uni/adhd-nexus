import { motion, AnimatePresence } from "framer-motion";

interface GroundingModalProps {
  step: number;
  onAdvance: () => void;
  onClose: () => void;
}

const groundingSteps = [
  "", // Index 0 is unused
  "Tap 5 things you can SEE around you.",
  "Tap 4 things you can TOUCH.",
  "Tap 3 things you can HEAR.",
  "Tap 2 things you can SMELL.",
  "Tap 1 thing you can TASTE (or your favorite taste).",
];

export default function GroundingModal({ step, onAdvance, onClose }: GroundingModalProps) {
  if (step === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-zinc-900/90 backdrop-blur-md flex flex-col items-center justify-center p-8"
      >
        <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
        >
          <h2 className="text-5xl font-black text-white mb-8">{6 - step}</h2>
          <p className="text-2xl text-white/80 mb-12">{groundingSteps[step]}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAdvance}
            className="bg-white/20 text-white font-bold py-4 px-10 rounded-full text-xl"
          >
            Next
          </motion.button>
        </motion.div>
        <button onClick={onClose} className="absolute top-8 right-8 text-white/50">Close</button>
      </motion.div>
    </AnimatePresence>
  );
}
