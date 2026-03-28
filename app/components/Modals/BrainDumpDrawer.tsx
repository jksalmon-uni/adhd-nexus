import { motion, AnimatePresence } from "framer-motion";
import { Brain, Plus, Timer, Trash2, X } from "lucide-react";

interface BrainDumpDrawerProps {
    isDumpOpen: boolean;
    closeDumpMenu: () => void;
    colorMap: any;
    isDark: boolean;
    isVentMode: boolean;
    triggerVentMode: () => void;
    handleAddDump: (e?: React.FormEvent) => void;
    inputDump: string;
    setInputDump: (dump: string) => void;
    overwhelmMode: boolean;
    brainDump: string[];
    promoteToTask: (text: string, index: number) => void;
    setBrainDump: (dump: string[]) => void;
    ventTimer: number;
}

export default function BrainDumpDrawer({
    isDumpOpen,
    closeDumpMenu,
    colorMap,
    isDark,
    isVentMode,
    triggerVentMode,
    handleAddDump,
    inputDump,
    setInputDump,
    overwhelmMode,
    brainDump,
    promoteToTask,
    setBrainDump,
    ventTimer,
}: BrainDumpDrawerProps) {
    return (
        <AnimatePresence>
        {isDumpOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDumpMenu} className="fixed inset-0 bg-black/60 backdrop-blur-md z-50" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto rounded-t-[50px] p-10 pb-16 z-50 shadow-2xl ${colorMap.dumpBg}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>Notes</h2>
                <button onClick={closeDumpMenu} className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10 text-white' : 'bg-zinc-900/10 text-zinc-900'}`}><X size={20}/></button>
              </div>

              {!isVentMode ? (
                <>
                  <button onClick={triggerVentMode} className="w-full mb-6 p-4 rounded-2xl bg-amber-500 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"><Timer size={16}/> 60s Impulse Vent</button>
                  <form onSubmit={handleAddDump} className="flex gap-3 mb-10">
                    <input value={inputDump} onChange={e => setInputDump(e.target.value)} placeholder="Get it out of your head..." className={`flex-1 border-2 rounded-3xl px-6 py-4 outline-none focus:ring-4 focus:ring-amber-500/20 ${colorMap.dumpCard} ${isDark ? 'text-white' : 'text-zinc-900'}`} />
                    <button type="submit" className={`text-white px-8 flex items-center justify-center rounded-3xl font-bold text-2xl ${overwhelmMode ? 'bg-blue-600' : 'bg-zinc-900'}`}><Plus /></button>
                  </form>
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {brainDump.map((dump, i) => (<motion.div layout key={`dump-${i}`} className={`p-5 rounded-[28px] flex justify-between items-center shadow-sm ${colorMap.dumpCard}`}><span className={`text-sm font-bold leading-tight pr-6 ${isDark ? 'text-white' : 'text-zinc-800'}`}>{dump}</span><div className="flex gap-2"><button onClick={() => promoteToTask(dump, i)} className="bg-zinc-900 text-white text-[10px] font-black px-5 py-3 rounded-2xl shrink-0">TASKIFY</button><button onClick={()=>setBrainDump(brainDump.filter((_, idx)=>idx!==i))} className="p-2 text-zinc-400 hover:text-rose-500"><Trash2 size={16}/></button></div></motion.div>))}
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in flex flex-col items-center">
                    <h3 className="text-5xl font-mono font-black text-rose-500 mb-6">{ventTimer}s</h3>
                    <textarea autoFocus value={inputDump} onChange={e => setInputDump(e.target.value)} placeholder="Type fast! Don't overthink it..." className={`w-full h-48 border-2 rounded-3xl p-6 outline-none resize-none ${colorMap.dumpCard} ${isDark ? 'text-white' : 'text-zinc-900'}`} />
                    <p className="text-xs opacity-50 mt-4 font-bold uppercase tracking-widest">Will auto-save when timer hits 0</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
}
