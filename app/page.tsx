"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Target, Calendar as CalIcon, Leaf, Gem,
  Settings, Brain, CheckCircle2, X, Plus,
  Zap, History, Play,
  CloudRain, Coffee, Headphones, Timer,
  Gift, TimerReset
} from "lucide-react";

import CalendarTab from "./components/CalendarTab";
import SettingsModal from "./components/SettingsModal";
import WinLogModal from "./components/WinLogModal";

import type { Task, SubTask, Priority } from "./types";

// --- LOCAL TYPES ---
type Reward = { title: string; cost: number; id: string; };
type Ritual = { id: string; text: string; completed: boolean; lastCompletedDate: string; };

export default function Home() {
  // MARK: State & persistence
  // --- 0. DATA ISOLATION ---
  const [isDevMode, setIsDevMode] = useState(false);
  const SAVE_KEY = useMemo(() => isDevMode ? "dev-nexus-" : "prod-nexus-", [isDevMode]);

  // --- 1. CORE STATE ---
  const [activeTab, setActiveTab] = useState<"focus" | "calendar" | "recharge" | "rewards">("focus");
  const [greeting, setGreeting] = useState("Hello!");
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  // --- UI TOGGLES ---
  const [isDumpOpen, setIsDumpOpen] = useState(false); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [overwhelmMode, setOverwhelmMode] = useState(false); 
  const [mysteryPrize, setMysteryPrize] = useState<string | null>(null);

  // --- ECONOMY & GENTLE STREAKS ---
  const [points, setPoints] = useState(0);
  const [totalXp, setTotalXp] = useState(0); 
  const [dailyPointsEarned, setDailyPointsEarned] = useState(0);
  const DAILY_CAP = 250; 
  const [gardenPlants, setGardenPlants] = useState<string[]>([]);
  const [lastPlantedDate, setLastPlantedDate] = useState<string>("");

  // --- DATA LISTS ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [brainDump, setBrainDump] = useState<string[]>([]);
  const [rituals, setRituals] = useState<Ritual[]>([
    { id: 'rit1', text: 'Drink a glass of water', completed: false, lastCompletedDate: '' },
    { id: 'rit2', text: 'Take medication/supplements', completed: false, lastCompletedDate: '' }
  ]);
  const [rewards, setRewards] = useState<Reward[]>([
    { title: "Watch 1 YouTube video", cost: 40, id: "r1" },
    { title: "Gaming Session (30m)", cost: 80, id: "r2" },
  ]);

  // --- INPUTS ---
  const [inputValue, setInputValue] = useState("");
  const [inputDump, setInputDump] = useState("");
  const [inputDuration, setInputDuration] = useState<number>(0);
  const [inputPriority, setInputPriority] = useState<Priority>("med");
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [newRewardTitle, setNewRewardTitle] = useState("");
  const [newRewardCost, setNewRewardCost] = useState<number | "">("");
  const [randomTaskId, setRandomTaskId] = useState<string | null>(null);

  // --- TIMER & AUDIO REFS ---
  const [isVentMode, setIsVentMode] = useState(false);
  const [ventTimer, setVentTimer] = useState(60);
  const ventIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [ambientTrack, setAmbientTrack] = useState<"none" | "rain" | "cafe" | "lofi">("none");
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const focusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [focusRemainingSeconds, setFocusRemainingSeconds] = useState(0);
  const [holdingTaskId, setHoldingTaskId] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- 2. CORE FUNCTIONS (DEFINED BEFORE USE) ---
  // MARK: Task & Ritual Funcs
  const playSound = (s: string) => { if (soundEnabled) { try { new Audio(`/sounds/${s}.mp3`).play(); } catch(e){} } };

  const handleAddDump = (e: React.SubmitEvent) => {
    if (e) e.preventDefault();
    if (!inputDump.trim()) return;
    setBrainDump((prev) => [inputDump, ...prev]);
    setInputDump("");
  };

  const closeDumpMenu = () => {
    setIsDumpOpen(false);
    setIsVentMode(false);
    if(ventIntervalRef.current) clearInterval(ventIntervalRef.current);
  };

  const handleAddTask = (e: React.SubmitEvent) => {
    e.preventDefault(); if (!inputValue.trim()) return; 
    playSound('add_task');
    setTasks([{ 
      text: inputValue, 
      duration: inputDuration, 
      id: `${Date.now()}-${Math.random()}`,
      date: inputDate, 
      subTasks: [], 
      priority: inputPriority 
    }, 
      ...tasks]);
    setInputValue(""); setInputDuration(0); setInputPriority("med"); setShowDurationPicker(false);
  };

  const promoteToTask = (text: string, index: number) => {
    setTasks([{ text, duration: 0, id: `${Date.now()}-${Math.random()}`, date: new Date().toISOString().split('T')[0], subTasks: [], priority: 'med' }, ...tasks]);
    setBrainDump(brainDump.filter((_, i) => i !== index)); closeDumpMenu(); setOverwhelmMode(false); setActiveTab("focus");
    confetti({ particleCount: 40 });
  };

  const completeTask = (taskId: string) => {
    const t = tasks.find(x => x.id === taskId);
    if (!t) return;
    playSound('complete_task');
    setCompletedTasks((prev) => [{...t, date: new Date().toISOString()}, ...prev].slice(0, 50));
    setTotalXp((x) => x + (t.duration || 5));
    if (dailyPointsEarned < DAILY_CAP) {
        const earned = Math.max(1, Math.floor((t.duration || 5)));
        setPoints((p) => p + earned);
        setDailyPointsEarned((d) => d + earned);
    }
    setTasks((prev) => prev.filter(x => x.id !== taskId));
    setRandomTaskId(null);
    setFocusTask(null);
    confetti({ particleCount: 100 });
  };

  const startFocusTimer = (t: Task, overrideMins?: number) => { 
    const finalMins = overrideMins || (t.duration > 0 ? t.duration : 30);
    setFocusTask({ ...t, duration: finalMins }); 
    setFocusRemainingSeconds(finalMins * 60); 
    focusIntervalRef.current = setInterval(() => { 
        setFocusRemainingSeconds(prev => { 
            if (prev <= 1) { 
              if(focusIntervalRef.current) clearInterval(focusIntervalRef.current); 
              completeTask(t.id); 
              return 0; 
            } 
            return prev - 1; 
        }); 
    }, 1000); 
  };

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.href.includes("localhost") || window.location.href.includes("-dev")) {
        setIsDevMode(true);
      }
    }
    const today = new Date().toLocaleDateString();
    const load = (k: string, f: (v: any) => void, parser: (s: string) => any = (s) => JSON.parse(s)) => { 
        const s = localStorage.getItem(SAVE_KEY + k); 
        if(s) { try { f(parser(s)); } catch (e) {} }
    };
    load("tasks", setTasks); load("dump", setBrainDump); load("completed", setCompletedTasks);
    load("rewards", setRewards); load("theme", setTheme, (v) => v);
    load("points", setPoints, (v) => parseInt(v, 10) || 0); 
    load("xp", setTotalXp, (v) => parseInt(v, 10) || 0);
    load("settings-sounds", setSoundEnabled, (v) => v === 'true');
    load("overwhelm", setOverwhelmMode, (v) => v === 'true');
    load("garden", setGardenPlants); load("last-plant", setLastPlantedDate, (v) => v);
    const savedRituals = localStorage.getItem(SAVE_KEY + "rituals");
    if (savedRituals) {
      const parsedRituals: Ritual[] = JSON.parse(savedRituals);
      const checkedRituals = parsedRituals.map(r => r.lastCompletedDate !== today ? { ...r, completed: false } : r);
      setRituals(checkedRituals);
    }
    const rd = localStorage.getItem(SAVE_KEY + "reset-date");
    if (rd !== today) { setDailyPointsEarned(0); localStorage.setItem(SAVE_KEY + "reset-date", today); }
    else { load("daily-points", setDailyPointsEarned, (v) => parseInt(v, 10) || 0); }
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good Morning!" : h < 18 ? "Keep Pushing." : "Good Evening.");
    setIsLoaded(true); 
  }, [SAVE_KEY]);

  useEffect(() => {
    if (isLoaded) {
      const save = (k: string, v: any) => localStorage.setItem(SAVE_KEY + k, typeof v === 'string' ? v : JSON.stringify(v));
      save("tasks", tasks); save("dump", brainDump); save("completed", completedTasks);
      save("rewards", rewards); save("theme", theme);
      save("points", points.toString()); save("xp", totalXp.toString());
      save("daily-points", dailyPointsEarned.toString());
      save("settings-sounds", soundEnabled.toString());
      save("overwhelm", overwhelmMode.toString());
      save("rituals", rituals); save("garden", gardenPlants); save("last-plant", lastPlantedDate);
    }
  }, [tasks, brainDump, points, totalXp, dailyPointsEarned, theme, rewards, soundEnabled, overwhelmMode, rituals, gardenPlants, lastPlantedDate, isLoaded, completedTasks, SAVE_KEY]);

  // --- 4. THEME & MATH ---
  const isDark = theme === "dark";
  const colorMap = {
    bg: overwhelmMode ? (isDark ? "bg-slate-950 text-blue-100" : "bg-blue-50 text-slate-900") : (isDark ? "bg-zinc-950 text-white" : "bg-stone-50 text-slate-900"),
    card: isDark ? "bg-zinc-900 border-zinc-800 shadow-xl" : "bg-white border-slate-200 shadow-sm",
    input: isDark ? "bg-zinc-800 text-white border-zinc-700" : "bg-white text-slate-900 border-slate-300",
    textMain: isDark ? "text-zinc-100" : "text-slate-900",
    tabActive: overwhelmMode ? (isDark ? 'bg-blue-900/40 text-blue-400 border border-blue-400/30' : 'bg-white text-blue-600 shadow-md') : (isDark ? "bg-zinc-800 text-emerald-400 border-emerald-500/20" : "bg-white text-emerald-600 shadow-md"),
    stencilColor: overwhelmMode ? (isDark ? 'text-slate-950' : 'text-blue-50') : (isDark ? 'text-zinc-950' : 'text-stone-50'),
  };

  const focusCompletionRatio = useMemo(() => {
    if (!focusTask || focusTask.duration === 0) return 0;
    const totalSeconds = focusTask.duration * 60;
    return Math.max(0, Math.min(1, 1 - (focusRemainingSeconds / totalSeconds)));
  }, [focusTask, focusRemainingSeconds]);

  if (!isLoaded) return null;

  // MARK: User Interface
  return (
    <main className={`flex min-h-screen flex-col items-center font-sans transition-all duration-700 ${colorMap.bg} relative overflow-x-hidden`}>
      <div className="w-full max-w-md px-6 pb-24 relative z-10">
        
        {/* TOP STATUS BAR */}
        <div className="flex justify-between items-start pt-8 pb-4">
          <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black ${isDark ? 'bg-zinc-900 border border-zinc-800 text-emerald-400' : 'bg-white shadow-sm text-emerald-600'}`}>
                    <span className="text-[8px] opacity-50 -mb-1">LVL</span>{Math.floor(totalXp / 100) + 1}
                </div>
                <div className="flex flex-col gap-1">
                    <div className={`w-24 h-1.5 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-slate-200'} overflow-hidden`}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${totalXp % 100}%` }} className="h-full bg-emerald-500" />
                    </div>
                </div>
              </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsVaultOpen(true)} className={`p-2.5 rounded-xl ${colorMap.card} flex items-center justify-center`}><History size={18}/></button>
            <button onClick={() => setIsSettingsOpen(true)} className={`p-2.5 rounded-xl ${colorMap.card} flex items-center justify-center`}><Settings size={18}/></button>
            <div className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-xl border ${isDark ? 'border-amber-500/20 text-amber-400 bg-zinc-900' : 'border-amber-300 text-amber-600 bg-amber-50'}`}><span>💎</span>{points}</div>
          </div>
        </div>

        <header className="mb-6 text-center mt-2">
          <h1 className={`text-4xl font-black mb-2 tracking-tight ${colorMap.textMain}`}>{overwhelmMode ? 'Focus on Breath.' : greeting}</h1>
          <button onClick={() => setOverwhelmMode(!overwhelmMode)} className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full transition-all ${overwhelmMode ? 'bg-emerald-500 text-white' : 'bg-blue-500/10 text-blue-400'}`}>
            {overwhelmMode ? "I'm Better" : "⚠️ I'm Overwhelmed"}
          </button>
        </header>

        {/* NAVIGATION */}
        <LayoutGroup>
          <nav className={`grid ${overwhelmMode ? 'grid-cols-1 max-w-35 mx-auto' : 'grid-cols-4'} gap-1 p-1.5 rounded-2xl mb-8 ${isDark ? 'bg-zinc-900' : 'bg-slate-200'}`}>
            {!overwhelmMode && (
              <>
                <button onClick={() => setActiveTab("focus")} className={`relative py-3.5 rounded-xl text-[10px] font-bold capitalize transition-all flex flex-col items-center gap-1 ${activeTab === "focus" ? 'text-white' : 'text-zinc-500'}`}>
                    {activeTab === "focus" && <motion.div layoutId="tab-pill" className="absolute inset-0 rounded-xl bg-emerald-600 z-0" />}
                    <span className="relative z-10"><Target size={16}/></span><span className="relative z-10">Focus</span>
                </button>
                <button onClick={() => setActiveTab("calendar")} className={`relative py-3.5 rounded-xl text-[10px] font-bold capitalize transition-all flex flex-col items-center gap-1 ${activeTab === "calendar" ? 'text-white' : 'text-zinc-500'}`}>
                    {activeTab === "calendar" && <motion.div layoutId="tab-pill" className="absolute inset-0 rounded-xl bg-emerald-600 z-0" />}
                    <span className="relative z-10"><CalIcon size={16}/></span><span className="relative z-10">Calendar</span>
                </button>
              </>
            )}
            <button onClick={() => setActiveTab("recharge")} className={`relative py-3.5 rounded-xl text-[10px] font-bold capitalize transition-all flex flex-col items-center gap-1 ${activeTab === "recharge" ? 'text-white' : 'text-zinc-500'}`}>
                {activeTab === "recharge" && <motion.div layoutId="tab-pill" className="absolute inset-0 rounded-xl bg-emerald-600 z-0" />}
                <span className="relative z-10"><Leaf size={16}/></span><span className="relative z-10">Recharge</span>
            </button>
            {!overwhelmMode && (
                <button onClick={() => setActiveTab("rewards")} className={`relative py-3.5 rounded-xl text-[10px] font-bold capitalize transition-all flex flex-col items-center gap-1 ${activeTab === "rewards" ? 'text-white' : 'text-zinc-500'}`}>
                    {activeTab === "rewards" && <motion.div layoutId="tab-pill" className="absolute inset-0 rounded-xl bg-emerald-600 z-0" />}
                    <span className="relative z-10"><Gem size={16}/></span><span className="relative z-10">Prize</span>
                </button>
            )}
          </nav>
        </LayoutGroup>

        <AnimatePresence mode="wait">
          {activeTab === "focus" && !overwhelmMode && (
            <motion.div key="focus-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <form onSubmit={handleAddTask} className={`p-6 rounded-[36px] border ${colorMap.card} flex flex-col gap-4`}>
                  <input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="What's next?" className={`w-full px-4 py-3 rounded-2xl outline-none ${colorMap.input}`} />
                  <div className="flex gap-2">
                    <input type="date" value={inputDate} onChange={e => setInputDate(e.target.value)} className={`flex-1 px-3 py-2 rounded-xl text-xs outline-none ${colorMap.input}`} />
                    <button type="button" onClick={() => setShowDurationPicker(!showDurationPicker)} className={`flex-1 px-3 py-2 rounded-xl text-[10px] font-bold border border-dashed border-zinc-700`}>
                        {inputDuration > 0 ? `⏱️ ${inputDuration}m` : "Estimate?"}
                    </button>
                  </div>
                  {showDurationPicker && <div className="flex gap-2">{[5, 15, 30, 60].map(m => <button key={m} type="button" onClick={() => setInputDuration(m)} className={`flex-1 py-2 rounded-xl text-xs font-black ${inputDuration === m ? 'bg-emerald-500 text-white' : 'bg-zinc-800'}`}>{m}m</button>)}</div>}
                  <button type="submit" className="bg-emerald-600 py-4 rounded-2xl font-black text-white hover:bg-emerald-500 transition-all">Add Task</button>
                </form>

                <div className="space-y-4">
                  {tasks.filter(t => t.date === new Date().toISOString().split('T')[0]).map((t, i) => (
                    <motion.div layout key={`${t.id}-${i}`} className={`p-6 rounded-4xl border-2 ${colorMap.card}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{t.text}</span>
                        <div className="flex gap-2">
                          <button onClick={() => startFocusTimer(t, 5)} className="p-2 rounded-xl bg-blue-500/10 text-blue-400 text-[10px] font-black">5M</button>
                          <button onClick={() => startFocusTimer(t)} className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><Play size={14}/></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
            </motion.div>
          )}

          {activeTab === "calendar" && !overwhelmMode && (
            <CalendarTab tasks={tasks} isDark={isDark} />
          )}
        </AnimatePresence>
      </div>

      {/* BRAIN DUMP BUTTON */}
      <motion.button onClick={() => setIsDumpOpen(true)} className="fixed bottom-8 right-8 w-16 h-16 rounded-3xl shadow-2xl flex items-center justify-center text-3xl z-40 bg-amber-400 text-zinc-900"><Brain /></motion.button>

      {/* BRAIN DUMP DRAWER (WHERE THE ERROR WAS) */}
      <AnimatePresence>
        {isDumpOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDumpMenu} className="fixed inset-0 bg-black/60 backdrop-blur-md z-50" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto rounded-t-[50px] p-10 pb-16 z-50 shadow-2xl ${isDark ? 'bg-zinc-900' : 'bg-amber-50'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black">Notes</h2>
                <button onClick={closeDumpMenu} className="w-10 h-10 rounded-full bg-zinc-900/10 flex items-center justify-center"><X size={20}/></button>
              </div>
              <form onSubmit={handleAddDump} className="flex gap-3 mb-10">
                <input value={inputDump} onChange={e => setInputDump(e.target.value)} placeholder="Get it out of your head..." className="flex-1 bg-white border-2 rounded-3xl px-6 py-4 text-zinc-900" />
                <button type="submit" className="bg-zinc-900 text-white px-8 rounded-3xl font-bold"><Plus /></button>
              </form>
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {brainDump.map((dump, i) => (
                  <div key={`dump-${i}`} className="bg-white/80 p-5 rounded-[28px] flex justify-between items-center">
                    <span className="text-sm font-bold text-zinc-800">{dump}</span>
                    <button onClick={() => promoteToTask(dump, i)} className="bg-zinc-900 text-white text-[10px] font-black px-4 py-2 rounded-xl">TASKIFY</button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* HOURGLASS MODAL */}
      <AnimatePresence>
        {focusTask && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-60 flex flex-col items-center justify-center p-12 ${colorMap.bg}`}>
                <button onClick={() => setFocusTask(null)} className="absolute top-12 right-8 px-6 py-3 rounded-full border font-black uppercase text-[10px]">Abort</button>
                <h2 className="text-3xl font-black text-center mb-12">{focusTask.text}</h2>
                <div className="w-full max-w-sm flex items-center justify-center relative aspect-1/1.5 mb-8">
                    <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-2xl">
                        {/* Sand Logic using Stencil */}
                        <motion.rect x="20" width="60" className="fill-emerald-500" animate={{ y: 20 + (focusCompletionRatio * 75), height: 75 - (focusCompletionRatio * 75) }} transition={{ ease: "linear", duration: 1 }} />
                        <motion.rect x="49" y="95" width="2" className="fill-emerald-500" animate={{ height: 85 - (focusCompletionRatio * 75), opacity: focusRemainingSeconds > 0 ? 1 : 0 }} transition={{ ease: "linear", duration: 1 }} />
                        <motion.rect x="20" width="60" className="fill-emerald-500" animate={{ y: 180 - (focusCompletionRatio * 75), height: focusCompletionRatio * 75 }} transition={{ ease: "linear", duration: 1 }} />
                        <path d="M 0 0 h 100 v 200 h -100 Z M 20 20 C 20 65 43 85 50 95 C 57 85 80 65 80 20 Z M 50 105 C 43 115 20 135 20 180 L 80 180 C 80 135 57 115 50 105 Z" fill="currentColor" className={colorMap.stencilColor} fillRule="evenodd" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-6xl font-mono font-black">
                        {Math.floor(focusRemainingSeconds / 60)}:{(focusRemainingSeconds % 60).toString().padStart(2, '0')}
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
      {/* Modals */}
      <WinLogModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        isDark={isDark}
        completedTasks={completedTasks}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDark={isDark}
        onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />
    </main>
  );
}