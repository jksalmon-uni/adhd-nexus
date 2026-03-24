"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Target, Calendar as CalIcon, Leaf, Gem,
  Settings, Brain, CheckCircle2,
  Zap, History, Play, X,
  CloudRain, Coffee, Headphones, Timer,
  Gift, TimerReset, Plus, ArrowLeft, ArrowRight,
  Trash2, CheckSquare
} from "lucide-react";

import SettingsModal from "./components/Modals/SettingsModal";
import WinLogModal from "./components/Modals/WinLogModal";
import MysteryPrizeModal from "./components/Modals/MysteryPrizeModal";

import type { Task, Priority, Reward } from "./types";

// --- LOCAL TYPES ---
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
  const [viewDate, setViewDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">("month");
  const [isVentMode, setIsVentMode] = useState(false);
  const [ventTimer, setVentTimer] = useState(60);

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

  const rechargeMenu = [
    { title: "2 Minute Meditation", icon: <Zap className="text-yellow-400"/> },
    { title: "Step outside for air", icon: <Leaf className="text-emerald-400"/> },
    { title: "Drink a glass of water", icon: <Play className="text-blue-400 rotate-90"/> },
    { title: "Quick 1-minute stretch", icon: <Zap className="text-purple-400"/> },
  ];

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
  const [ambientTrack, setAmbientTrack] = useState<"none" | "rain" | "cafe" | "lofi">("none");
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const focusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const ventIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [focusRemainingSeconds, setFocusRemainingSeconds] = useState(0);
  const [holdingTaskId, setHoldingTaskId] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- 2. CORE FUNCTIONS (DEFINED BEFORE USE) ---
  // MARK: Task & Ritual Funcs
  const playSound = (s: string) => { if (soundEnabled) { try { new Audio(`/sounds/${s}.mp3`).play(); } catch(e){} } };


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
    const subScaling = t.subTasks.length > 0 ? (t.subTasks.filter(s=>s.completed).length / t.subTasks.length) : 1;
    const priorityBonus = t.priority === 'urgent' ? 1.5 : t.priority === 'high' ? 1.2 : 1;
    const earned = Math.max(1, Math.floor((t.duration || 5) * subScaling * priorityBonus));
    setTotalXp((x) => x + (t.duration || 5));
    if (dailyPointsEarned < DAILY_CAP) {
        const allowed = Math.min(earned, DAILY_CAP - dailyPointsEarned);
        setPoints((p) => p + allowed);
        setDailyPointsEarned((d) => d + allowed);
    }
    setTasks((prev) => prev.filter(x => x.id !== taskId));
    setRandomTaskId(null);
    setFocusTask(null);
    triggerGardenGrowth();
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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark]);

  const colorMap = {
    bg: overwhelmMode
      ? "bg-blue-50 text-slate-900 dark:bg-slate-950 dark:text-blue-100"
      : "bg-stone-50 text-slate-900 dark:bg-zinc-950 dark:text-white",
    card: "bg-white border-slate-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-xl",
    input: "bg-white text-slate-900 border-slate-300 dark:bg-zinc-800 dark:text-white dark:border-zinc-700",
    textMain: "text-slate-900 dark:text-zinc-100",
    tabActive: overwhelmMode
      ? "bg-white text-blue-600 shadow-md dark:bg-blue-900/40 dark:text-blue-400 dark:border dark:border-blue-400/30"
      : "bg-white text-emerald-600 shadow-md dark:bg-zinc-800 dark:text-emerald-400 dark:border-emerald-500/20",
    stencilColor: overwhelmMode
      ? "text-blue-50 dark:text-slate-950"
      : "text-stone-50 dark:text-zinc-950",
    btnEst: isDark ? "bg-zinc-800 text-zinc-400" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
    textMuted: isDark ? "text-zinc-500" : "text-slate-400",
    tabInactive: isDark ? "text-zinc-500" : "text-slate-400",
    rechargeIconBg: isDark ? "bg-zinc-800" : "bg-slate-100",
    gemCounter: overwhelmMode ? (isDark ? 'border-blue-400 text-blue-400 bg-zinc-900' : 'border-blue-300 text-blue-600 bg-blue-50') : (isDark ? 'border-amber-500/20 text-amber-400 bg-zinc-900' : 'border-amber-300 text-amber-600 bg-amber-50'),
    taskBullet: isDark ? 'bg-zinc-700 border-zinc-700' : 'bg-slate-200 border-slate-300',
    dumpBg: isDark ? 'bg-zinc-900' : 'bg-amber-50',
    dumpCard: isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-900/5',
    hourglassSand: isDark ? 'text-zinc-400' : 'text-zinc-500',
  };

  const LEVEL_MAP = useMemo(() => {
    const xpReqs = [0]; for (let i = 1; i <= 100; i++) xpReqs.push(xpReqs[i - 1] + (i * 25));
    let level = 1; for (let i = xpReqs.length - 1; i >= 0; i--) { if (totalXp >= xpReqs[i]) { level = i + 1; break; } }
    const currentReq = xpReqs[level - 1], nextReq = xpReqs[level];
    return { level, progress: nextReq ? ((totalXp - currentReq) / (nextReq - currentReq)) * 100 : 100 };
  }, [totalXp]);

  const focusCompletionRatio = useMemo(() => {
    if (!focusTask || focusTask.duration === 0) return 0;
    const totalSeconds = focusTask.duration * 60;
    return Math.max(0, Math.min(1, 1 - (focusRemainingSeconds / totalSeconds)));
  }, [focusTask, focusRemainingSeconds]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const triggerGardenGrowth = () => {
    const today = new Date().toLocaleDateString();
    if (lastPlantedDate !== today) {
      const plants = ['🌱', '🌿', '🪴', '🌲', '🌸', '🌺', '🌻', '🍄', '🌵'];
      const randomPlant = plants[Math.floor(Math.random() * plants.length)];
      setGardenPlants(prev => [...prev, randomPlant].slice(-14));
      setLastPlantedDate(today);
    }
  };

  const completeRitual = (id: string) => {
    playSound('add_task'); confetti({ particleCount: 30, origin: { y: 0.8 } });
    setRituals(rituals.map(r => r.id === id ? { ...r, completed: true, lastCompletedDate: new Date().toLocaleDateString() } : r));
    setTotalXp(x => x + 5);
    if (dailyPointsEarned < DAILY_CAP) { setPoints(p => p + 5); setDailyPointsEarned(d => d + 5); }
    triggerGardenGrowth();
  };

  const getTaskStyles = (p: Priority) => {
    switch(p) {
      case 'urgent': return `border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)] scale-[1.02] ${isDark ? 'bg-rose-950/10' : 'bg-rose-50/30'}`;
      case 'high': return `border-amber-500/40 shadow-sm ${isDark ? 'bg-amber-900/5' : 'bg-amber-50/20'}`;
      case 'med': return `border-transparent`;
      case 'low': return `border-transparent opacity-70 scale-[0.98]`;
    }
  };

  const handleAddDump = (e?: React.FormEvent) => {
    if (e) e.preventDefault(); if (!inputDump.trim()) return;
    setBrainDump([inputDump, ...brainDump]); setInputDump("");
  };

  const triggerVentMode = () => {
    setIsVentMode(true); setVentTimer(60); setInputDump("");
    ventIntervalRef.current = setInterval(() => {
      setVentTimer((prev) => {
        if (prev <= 1) { 
            clearInterval(ventIntervalRef.current!); 
            setIsVentMode(false); setIsDumpOpen(false); 
            return 0; 
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (!isVentMode && ventTimer === 0 && inputDump.trim()) { handleAddDump(); setVentTimer(60); }
  }, [isVentMode, ventTimer, inputDump]);

  const closeDumpMenu = () => {
    setIsDumpOpen(false); setIsVentMode(false);
    if(ventIntervalRef.current) clearInterval(ventIntervalRef.current);
  };

  const openMysteryBox = () => {
    if (points < 30) return;
    setPoints(p => p - 30);
    playSound('redeem');
    confetti({ particleCount: 150, spread: 100, colors: ['#a855f7', '#fcd34d', '#3b82f6'] });
    const fallbackPrizes = ["Free Pass on 1 Chore", "Take a 20 min Nap", "Buy a small treat", "Order Takeout tonight"];
    const won = [...rewards.map(r => r.title), ...fallbackPrizes][Math.floor(Math.random() * (rewards.length + 4))];
    setMysteryPrize(won);
  };

  const renderMonthView = () => {
    const year = viewDate.getFullYear(), month = viewDate.getMonth(), days = [], daysInMonth = new Date(year, month + 1, 0).getDate(), firstDay = new Date(year, month, 1).getDay();
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-12" />);
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`, dt = tasks.filter(x => x.date === ds), isToday = new Date().toISOString().split('T')[0] === ds;
      days.push(<button key={`day-${d}`} onClick={() => { setViewDate(new Date(ds)); setCalendarView("day"); }} className={`h-12 border ${isDark ? 'border-zinc-800' : 'border-slate-100'} flex flex-col items-center p-1 rounded-lg transition-colors hover:bg-emerald-500/10`}><span className={`text-[9px] font-bold ${isToday ? 'bg-emerald-500 text-white rounded-full w-4 h-4 flex items-center justify-center' : colorMap.textMuted}`}>{d}</span><div className="flex gap-0.5 mt-1">{dt.slice(0, 3).map((_, i) => <div key={`dot-${d}-${i}`} className="w-1 h-1 rounded-full bg-emerald-400" />)}</div></button>);
    }
    return <div className={`grid grid-cols-7 gap-1`}>{['S','M','T','W','T','F','S'].map((d,i)=><div key={`head-${d}-${i}`} className={`text-center py-2 text-[9px] font-black opacity-30`}>{d}</div>)}{days}</div>;
  };

  const renderWeekView = () => {
    const sow = new Date(viewDate); sow.setDate(viewDate.getDate() - viewDate.getDay()); const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sow); d.setDate(sow.getDate() + i); const ds = d.toISOString().split('T')[0], dt = tasks.filter(x => x.date === ds), isT = new Date().toISOString().split('T')[0] === ds;
      days.push(<button key={`week-${i}`} onClick={() => { setViewDate(d); setCalendarView("day"); }} className={`p-4 rounded-2xl border flex flex-col items-center gap-1 transition-all ${isT ? 'bg-emerald-500/10 border-emerald-500' : colorMap.card}`}><span className="text-[10px] font-black opacity-40 uppercase">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i]}</span><span className={`text-xl font-bold ${isT ? 'text-emerald-500' : colorMap.textMain}`}>{d.getDate()}</span><span className="text-[10px] font-bold text-amber-500">{dt.length} tasks</span></button>);
    }
    return <div className="grid grid-cols-1 gap-2 animate-in slide-in-from-right-4">{days}</div>;
  };

  const renderDayView = () => {
    const ds = viewDate.toISOString().split('T')[0], dt = tasks.filter(x => x.date === ds);
    return (<div className="animate-in zoom-in-95 duration-300"><div className={`p-8 rounded-[40px] text-center mb-6 ${colorMap.card}`}><p className="text-xs font-black uppercase opacity-40 mb-1">{viewDate.toLocaleDateString('default', { weekday: 'long' })}</p><h3 className="text-4xl font-black">{viewDate.getDate()}</h3><p className="text-sm opacity-60">{viewDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</p></div><div className="space-y-3">{dt.length === 0 ? <p className="text-center py-10 opacity-40 italic">No tasks today.</p> : dt.map(t => (<div key={t.id} className={`p-5 rounded-2xl flex justify-between items-center ${colorMap.card}`}><span className="font-bold text-sm">{t.text}</span><span className="text-[10px] opacity-40 font-bold">{t.duration || 5}m</span></div>))}</div></div>);
  };

  const startHolding = (id: string) => {
    setHoldingTaskId(id); setHoldProgress(0);
    progressIntervalRef.current = setInterval(() => setHoldProgress(p => Math.min(p + 5, 100)), 100);
    holdTimerRef.current = setTimeout(() => { completeTask(id); stopHolding(); }, 2000);
  };
  const stopHolding = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setHoldingTaskId(null); setHoldProgress(0);
  };

  // --- AMBIENT AUDIO ---
  useEffect(() => {
    if (ambientTrack === "none") {
      if (ambientAudioRef.current) { ambientAudioRef.current.pause(); ambientAudioRef.current = null; }
      return;
    }
    if (ambientAudioRef.current) ambientAudioRef.current.pause();
    const audio = new Audio(`/sounds/${ambientTrack}.mp3`);
    audio.loop = true; audio.volume = 0.4;
    audio.play().catch(e => console.log("Audio play failed:", e));
    ambientAudioRef.current = audio;
    return () => { if (ambientAudioRef.current) ambientAudioRef.current.pause(); }
  }, [ambientTrack]);

  useEffect(() => { if (!focusTask && ambientTrack !== "none") setAmbientTrack("none"); }, [focusTask]);

  if (!isLoaded) return null;

  // MARK: User Interface
  return (
    <main className={`flex min-h-screen flex-col items-center font-sans transition-all duration-700 ${colorMap.bg} relative overflow-x-hidden`}>
      <div className="w-full max-w-md px-6 pb-24 relative z-10">
        
        {/* TOP STATUS BAR */}
        <div className="flex justify-between items-start pt-8 pb-4">
          <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black bg-white shadow-sm text-emerald-600 dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:text-emerald-400">
                    <span className="text-[8px] opacity-50 -mb-1">LVL</span>{Math.floor(totalXp / 100) + 1}
                </div>
                <div className="flex flex-col gap-1">
                    <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${totalXp % 100}%` }} className="h-full bg-emerald-500" />
                    </div>
                </div>
              </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsVaultOpen(true)} className={`p-2.5 rounded-xl ${colorMap.card} flex items-center justify-center`}><History size={18}/></button>
            <button onClick={() => setIsSettingsOpen(true)} className={`p-2.5 rounded-xl ${colorMap.card} flex items-center justify-center`}><Settings size={18}/></button>
            <div className="px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-xl border border-amber-300 text-amber-600 bg-amber-50 dark:border-amber-500/20 dark:text-amber-400 dark:bg-zinc-900"><span>💎</span>{points}</div>
          </div>
        </div>

        <header className="mb-6 text-center mt-2">
          <h1 className={`text-4xl font-black mb-2 tracking-tight ${colorMap.textMain}`}>{overwhelmMode ? 'Focus on Breath.' : greeting}</h1>
          <button onClick={() => { setOverwhelmMode(!overwhelmMode); if(!overwhelmMode) setActiveTab("recharge"); }} className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full transition-all ${overwhelmMode ? 'bg-emerald-500 text-white shadow-emerald-500/20 shadow-lg' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 active:scale-95'}`}>
            {overwhelmMode ? "I'm Feeling Better" : "⚠️ I'm Overwhelmed"}
          </button>
        </header>

        {/* NAVIGATION */}
        <LayoutGroup>
          <nav className={`grid ${overwhelmMode ? 'grid-cols-1 max-w-35 mx-auto' : 'grid-cols-4'} gap-1 p-1.5 rounded-2xl mb-8 ${isDark ? 'bg-zinc-900' : 'bg-slate-200'}`}>
            {!overwhelmMode && (<><button onClick={() => setActiveTab("focus")} className={`relative py-3.5 rounded-xl text-[10px] font-bold capitalize transition-all flex flex-col items-center gap-1 ${activeTab === "focus" ? 'text-white' : colorMap.tabInactive}`}>
              {activeTab === "focus" && <motion.div layoutId="tab-pill" className={`absolute inset-0 rounded-xl z-0 ${overwhelmMode ? 'bg-blue-500' : 'bg-emerald-600'}`} transition={{ type: "spring", bounce: 0.1, duration: 0.5 }} />}
              <span className="relative z-10"><Target size={16}/></span><span className="relative z-10">Focus</span></button>
            <button onClick={() => setActiveTab("calendar")} className={`relative py-3.5 rounded-xl text-[10px] font-bold capitalize transition-all flex flex-col items-center gap-1 ${activeTab === "calendar" ? 'text-white' : colorMap.tabInactive}`}>
              {activeTab === "calendar" && <motion.div layoutId="tab-pill" className={`absolute inset-0 rounded-xl z-0 ${overwhelmMode ? 'bg-blue-500' : 'bg-emerald-600'}`} transition={{ type: "spring", bounce: 0.1, duration: 0.5 }} />}
              <span className="relative z-10"><CalIcon size={16}/></span><span className="relative z-10">Calendar</span></button></>)}
            <button onClick={() => setActiveTab("recharge")} className={`relative py-3.5 rounded-xl text-[10px] font-bold capitalize transition-all flex flex-col items-center gap-1 ${activeTab === "recharge" ? 'text-white' : colorMap.tabInactive}`}>
              {activeTab === "recharge" && <motion.div layoutId="tab-pill" className={`absolute inset-0 rounded-xl z-0 ${overwhelmMode ? 'bg-blue-500' : 'bg-emerald-600'}`} transition={{ type: "spring", bounce: 0.1, duration: 0.5 }} />}
              <span className="relative z-10"><Leaf size={16}/></span><span className="relative z-10">{overwhelmMode ? 'RECOVERY' : 'Recharge'}</span></button>
            {!overwhelmMode && (<button onClick={() => setActiveTab("rewards")} className={`relative py-3.5 rounded-xl text-[10px] font-bold capitalize transition-all flex flex-col items-center gap-1 ${activeTab === "rewards" ? 'text-white' : colorMap.tabInactive}`}>
              {activeTab === "rewards" && <motion.div layoutId="tab-pill" className={`absolute inset-0 rounded-xl z-0 ${overwhelmMode ? 'bg-blue-500' : 'bg-emerald-600'}`} transition={{ type: "spring", bounce: 0.1, duration: 0.5 }} />}
              <span className="relative z-10"><Gem size={16}/></span><span className="relative z-10">Rewards</span></button>)}
          </nav>
        </LayoutGroup>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab + overwhelmMode} initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} transition={{ duration: 0.2 }}>
            {/* FOCUS TAB */}
            {activeTab === "focus" && !overwhelmMode && (
              <div className="space-y-6">
                {rituals.some(r => !r.completed) && (
                    <div className={`p-5 rounded-4xl border ${colorMap.card} shadow-sm`}>
                        <h3 className="text-[10px] font-black uppercase opacity-40 mb-3 px-2 flex items-center gap-2"><Leaf size={12}/> Morning Rituals</h3>
                        <div className="space-y-2">
                            {rituals.filter(r => !r.completed).map((r, i) => (
                                <button key={`ritual-${r.id}-${i}`} onClick={() => completeRitual(r.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-all ${isDark ? 'bg-zinc-800/50 hover:bg-zinc-800 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'} text-left`}>
                                    <div className="w-5 h-5 rounded-full border-2 border-emerald-500/50 shrink-0" />
                                    <span className="flex-1 font-semibold">{r.text}</span>
                                    <span className="text-[10px] font-black text-amber-500">+5💎</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <form onSubmit={handleAddTask} className={`p-6 rounded-[36px] border ${colorMap.card} flex flex-col gap-4 shadow-sm`}>
                  <input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="What needs doing?" className={`w-full px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 ${colorMap.input}`} />
                  <div className="flex gap-2">
                    <input type="date" value={inputDate} onChange={e => setInputDate(e.target.value)} className={`flex-1 px-3 py-2 rounded-xl text-xs outline-none ${colorMap.input}`} />
                    <button type="button" onClick={() => setShowDurationPicker(!showDurationPicker)} className={`flex-1 text-left px-3 py-2 rounded-xl text-[10px] font-bold border border-dashed ${isDark ? 'border-zinc-700' : 'border-slate-300'} ${colorMap.btnEst}`}>{inputDuration > 0 ? `⏱️ ${inputDuration}m` : "⏱️ Estimate?"}</button>
                  </div>
                  <div className={`flex justify-around items-center py-2.5 rounded-2xl ${isDark ? 'bg-black/20' : 'bg-slate-50'}`}>
                    {(['low', 'med', 'high', 'urgent'] as Priority[]).map(p => (<button key={`pri-${p}`} type="button" onClick={() => setInputPriority(p)} className={`w-8 h-8 rounded-full border-2 transition-all ${inputPriority === p ? 'scale-110 border-white ring-4 ring-white/10' : 'border-transparent opacity-30'} ${p==='low' ? 'bg-blue-400' : p==='med' ? 'bg-emerald-500' : p==='high' ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'}`}/>))}
                  </div>
                  {showDurationPicker && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="flex gap-2 pt-1">{[5, 15, 30, 60].map(m => <button key={`dur-${m}`} type="button" onClick={() => setInputDuration(m)} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${inputDuration === m ? 'bg-emerald-500 text-white shadow-md' : colorMap.btnEst}`}>{m}m</button>)}</motion.div>}
                  <button type="submit" className="bg-emerald-600 py-4 rounded-2xl font-black text-white hover:bg-emerald-500 active:scale-[0.98] transition-all">Add Task</button>
                </form>

                <div className="flex justify-between items-center mb-4 px-2 mt-8">
                  <h2 className={`text-xl font-bold ${colorMap.textMain}`}>Your Day</h2>
                  {tasks.filter(t => t.date === new Date().toISOString().split('T')[0]).length > 1 && (
                    <button onClick={() => { const today = tasks.filter(t => t.date === new Date().toISOString().split('T')[0]); setRandomTaskId(today[Math.floor(Math.random()*today.length)].id); }} className="text-[10px] font-black uppercase px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">🎲 Choice Helper</button>
                  )}
                </div>

                <div className="space-y-4">
                  {tasks.filter(t => t.date === new Date().toISOString().split('T')[0]).map((t, index) => (
                    <motion.div layout key={`task-${t.id}-${index}`} className={`rounded-4xl border-2 transition-all ${colorMap.card} ${getTaskStyles(t.priority)}`}>
                      {holdingTaskId === t.id && <motion.div className="absolute bottom-0 left-0 h-1.5 bg-emerald-500" initial={{ width: 0 }} animate={{ width: `${holdProgress}%` }} />}
                      <div onMouseDown={() => startHolding(t.id)} onMouseUp={stopHolding} onTouchStart={() => startHolding(t.id)} onTouchEnd={stopHolding} className="w-full flex justify-between items-center p-6 text-left relative group select-none cursor-pointer">
                        <div className="flex flex-col gap-1">
                            <span className={`font-bold flex items-center gap-3 ${t.priority === 'urgent' ? 'text-lg text-rose-400' : 'text-sm'}`}><div className={`w-3.5 h-3.5 rounded-full border-2 shex-shrink-0 ${holdingTaskId === t.id ? 'border-emerald-500' : t.priority === 'urgent' ? 'bg-rose-500 border-rose-500' : t.priority === 'high' ? 'border-amber-500' : colorMap.taskBullet}`}/> {t.text}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="text-amber-500 font-black text-xs pr-2">+{t.duration || 5}💎</span>
                            <button onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); startFocusTimer(t, 5); }} className={`p-2 rounded-xl text-[10px] font-black uppercase transition-colors ${isDark ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}>
                                5m <TimerReset size={12} className="inline ml-1 mb-0.5"/>
                            </button>
                            <button onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); startFocusTimer(t); }} className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors">
                                <Play size={14} fill="currentColor"/>
                            </button>
                        </div>
                      </div>
                      <div className={`p-5 pt-0 border-t ${isDark ? 'border-zinc-800' : 'border-slate-50'}`}>
                        <input type="text" placeholder="+ Break it down?" onKeyDown={(e) => { if(e.key === 'Enter') { setTasks(tasks.map(x=>x.id===t.id?{...x,subTasks:[...x.subTasks,{text:e.currentTarget.value,completed:false,id:Date.now().toString()}]}:x)); e.currentTarget.value=''; } }} className={`w-full text-xs p-2 mt-4 rounded-xl bg-transparent border border-dashed ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-slate-200 text-slate-500'} focus:opacity-100 outline-none`} />
                        <div className="space-y-2 mt-4">{t.subTasks.map((s, i) => (<button key={`sub-${s.id}-${i}`} onClick={() => setTasks(tasks.map(x=>x.id===t.id?{...x,subTasks:x.subTasks.map(y=>y.id===s.id?{...y,completed:!y.completed}:y)}:x))} className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs transition-all ${s.completed ? 'opacity-30 line-through' : 'bg-black/5 dark:bg-black/20'}`}><div className={`w-4 h-4 rounded border ${s.completed ? 'bg-emerald-500 border-emerald-500 text-white flex items-center justify-center text-[10px]' : 'border-zinc-500 dark:border-zinc-700'}`}>{s.completed && "✓"}</div>{s.text}</button>))}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* RECHARGE TAB */}
            {activeTab === "recharge" && (
              <div className="space-y-4 pt-4">
                 {rechargeMenu.map((item, i) => (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={`recharge-${i}`} onClick={() => confetti({ colors: ['#60a5fa'] })} className={`w-full flex items-center gap-6 p-7 rounded-[40px] active:scale-95 transition-all ${colorMap.card} shadow-sm`}>
                      <span className={`text-3xl p-3 ${colorMap.rechargeIconBg} rounded-2xl`}>{item.icon}</span><span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.title}</span>
                    </motion.button>
                  ))}
              </div>
            )}

            {/* CALENDAR TAB */}
            {activeTab === "calendar" && !overwhelmMode && (
              <div className="space-y-6 pt-4">
                <div className={`flex p-1 rounded-2xl ${isDark ? 'bg-zinc-900' : 'bg-slate-200'}`}>{(['month', 'week', 'day'] as const).map(v => (<button key={`cal-toggle-${v}`} onClick={() => setCalendarView(v)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${calendarView === v ? (isDark ? 'bg-zinc-800 text-emerald-400 shadow-sm' : 'bg-white text-emerald-600 shadow-sm') : 'opacity-40'}`}>{v}</button>))}</div>
                <div className="flex justify-between items-center mb-4 px-1">
                  <h2 className="text-2xl font-black capitalize">{calendarView === 'month' && viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}{calendarView === 'week' && `Week of ${viewDate.getDate()}`}{calendarView === 'day' && viewDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}</h2>
                  <div className="flex gap-2">
                    <button onClick={() => { const d = new Date(viewDate); if (calendarView === 'month') d.setMonth(d.getMonth() - 1); else if (calendarView === 'week') d.setDate(d.getDate() - 7); else d.setDate(d.getDate() - 1); setViewDate(d); }} className={`p-2 rounded-lg ${colorMap.card}`}><ArrowLeft size={16}/></button>
                    <button onClick={() => { const d = new Date(viewDate); if (calendarView === 'month') d.setMonth(d.getMonth() + 1); else if (calendarView === 'week') d.setDate(d.getDate() + 7); else d.setDate(d.getDate() + 1); setViewDate(d); }} className={`p-2 rounded-lg ${colorMap.card}`}><ArrowRight size={16}/></button>
                  </div>
                </div>
                {calendarView === 'month' && renderMonthView()}
                {calendarView === 'week' && renderWeekView()}
                {calendarView === 'day' && renderDayView()}
              </div>
            )}

            {/* REWARDS TAB */}
            {activeTab === "rewards" && !overwhelmMode && (
              <div className="space-y-4 pt-4">
                <button onClick={openMysteryBox} className={`w-full flex justify-between items-center p-8 rounded-[36px] transition-all border border-purple-500/50 bg-purple-500/10 shadow-lg ${points >= 30 ? 'active:scale-95 hover:bg-purple-500/20' : 'opacity-40 pointer-events-none'}`}>
                    <div className="flex items-center gap-4">
                        <span className="text-3xl p-3 bg-purple-500 text-white rounded-2xl"><Gift size={24}/></span>
                        <div className="flex flex-col items-start">
                            <span className="font-black text-lg text-purple-500">Mystery Box</span>
                            <span className="text-xs font-bold opacity-60">Variable Dopamine</span>
                        </div>
                    </div>
                    <span className="text-amber-500 font-black">30 💎</span>
                </button>

                <form onSubmit={(e) => { e.preventDefault(); if(!newRewardTitle || !newRewardCost || Number(newRewardCost) <= 0) return; setRewards([...rewards, { title: newRewardTitle, cost: Number(newRewardCost), id: Date.now().toString() }]); setNewRewardTitle(""); setNewRewardCost(""); }} className={`p-3 rounded-4xl mt-8 mb-6 flex items-center gap-2 ${colorMap.card} overflow-hidden`}>
                  <input value={newRewardTitle} onChange={e => setNewRewardTitle(e.target.value)} placeholder="Reward..." className={`flex-1 min-w-0 px-4 py-3 rounded-2xl text-sm ${colorMap.input}`} />
                  <input type="number" value={newRewardCost} onChange={e => setNewRewardCost(e.target.value ? Number(e.target.value) : "")} placeholder="Cost" min="1" className={`w-24 px-3 py-3 rounded-2xl text-sm ${colorMap.input}`} />
                  <button type="submit" className="bg-purple-600 w-12 h-12 flex shrink-0 items-center justify-center rounded-2xl font-bold text-white"><Plus size={20}/></button>
                </form>
                {rewards.map((r, i) => (
                  <div key={`reward-${r.id}-${i}`} className="relative group">
                    <button onClick={() => { if(points >= r.cost) { setPoints(p => p - r.cost); playSound('redeem'); confetti(); } }} className={`w-full flex justify-between items-center p-8 rounded-[36px] transition-all border ${points >= r.cost ? colorMap.card + ' active:scale-95' : 'opacity-20 pointer-events-none border-transparent'}`}>
                      <span className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>{r.title}</span><span className="text-amber-500 font-black">{r.cost} 💎</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setRewards(rewards.filter(x => x.id !== r.id)); }} className="absolute -top-3 -right-3 bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black opacity-0 group-hover:opacity-100 shadow-xl transition-all"><X size={14}/></button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- FLOATING BRAIN DUMP BUTTON --- */}
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsDumpOpen(true)} className={`fixed bottom-8 right-8 w-16 h-16 rounded-3xl shadow-2xl flex items-center justify-center text-3xl z-40 ${overwhelmMode ? 'bg-blue-500 text-white' : 'bg-amber-400 text-zinc-900'}`}><Brain /></motion.button>

      {/* --- BRAIN DUMP DRAWER --- */}
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

      {/* Modals */}
      {/* --- FOCUS MODE MODAL --- */}
      <AnimatePresence>
        {focusTask && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-60 flex flex-col items-center justify-center p-12 ${colorMap.bg}`}>
                <div className="absolute top-12 left-0 right-0 px-8 flex justify-between items-center">
                    <div className={`flex rounded-full p-1 border ${colorMap.card}`}>
                        {(['none', 'rain', 'cafe', 'lofi'] as const).map(a => (
                            <button key={`amb-${a}`} onClick={() => setAmbientTrack(a)} className={`p-3 rounded-full transition-all ${ambientTrack === a ? 'bg-emerald-500 text-white shadow-lg' : colorMap.textMuted + ' hover:opacity-80'}`}>
                                {a === 'none' && <X size={16}/>}
                                {a === 'rain' && <CloudRain size={16}/>}
                                {a === 'cafe' && <Coffee size={16}/>}
                                {a === 'lofi' && <Headphones size={16}/>}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setFocusTask(null)} className={`px-6 py-3 rounded-full border font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all ${colorMap.card} ${colorMap.textMain}`}>Abort</button>
                </div>
                
                <h2 className={`text-3xl font-black text-center mb-8 mt-12 ${colorMap.textMain}`}>{focusTask.text}</h2>

                <div className="w-full max-w-sm flex items-center justify-center relative mb-8" style={{aspectRatio: '1 / 1.5'}}>
                    <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-2xl" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <linearGradient id="sandGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" className={`${colorMap.hourglassSand} opacity-80`} />
                                <stop offset="100%" className={`${colorMap.hourglassSand} opacity-50`} />
                            </linearGradient>
                            <mask id="topMask" maskUnits="objectBoundingBox">
                                <motion.rect x="0" y="0" width="100" animate={{ height: `${(1 - focusCompletionRatio) * 100}%` }} transition={{ ease: "linear", duration: 1 }} fill="white" />
                            </mask>
                            <mask id="bottomMask" maskUnits="objectBoundingBox">
                                <motion.rect x="0" width="100" animate={{ height: `${focusCompletionRatio * 100}%`, y: `${(1 - focusCompletionRatio) * 100}%` }} transition={{ ease: "linear", duration: 1 }} fill="white" />
                            </mask>
                        </defs>
                        <path d="M 20 20 C 20 65 43 85 50 95 C 57 85 80 65 80 20 Z" className={isDark ? "fill-white/5" : "fill-black/5"} />
                        <path d="M 50 105 C 43 115 20 135 20 180 L 80 180 C 80 135 57 115 50 105 Z" className={isDark ? "fill-white/5" : "fill-black/5"} />
                        <motion.rect x="20" width="60" className="fill-emerald-500" initial={{ y: 20, height: 75 }} animate={{ y: 20 + (focusCompletionRatio * 75), height: 75 - (focusCompletionRatio * 75) }} transition={{ ease: "linear", duration: 1 }} />
                        <motion.rect x="49" y="95" width="2" className="fill-emerald-500" initial={{ height: 85, opacity: 0 }} animate={{ height: 85 - (focusCompletionRatio * 75), opacity: focusRemainingSeconds > 0 && focusCompletionRatio > 0 && focusCompletionRatio < 1 ? 1 : 0 }} transition={{ ease: "linear", duration: 1 }} />
                        <motion.rect x="20" width="60" className="fill-emerald-500" initial={{ y: 180, height: 0 }} animate={{ y: 180 - (focusCompletionRatio * 75), height: focusCompletionRatio * 75 }} transition={{ ease: "linear", duration: 1 }} />
                        <path d="M 0 0 h 100 v 200 h -100 Z M 20 20 C 20 65 43 85 50 95 C 57 85 80 65 80 20 Z M 50 105 C 43 115 20 135 20 180 L 80 180 C 80 135 57 115 50 105 Z" fill="currentColor" className={colorMap.stencilColor} fillRule="evenodd" />
                        <path d="M 20 20 C 20 65 43 85 50 95 C 57 85 80 65 80 20 Z" fill="none" className={isDark ? "stroke-white/20" : "stroke-slate-900/20"} strokeWidth="2" />
                        <path d="M 50 105 C 43 115 20 135 20 180 L 80 180 C 80 135 57 115 50 105 Z" fill="none" className={isDark ? "stroke-white/20" : "stroke-slate-900/20"} strokeWidth="2" />
                        <rect x="15" y="10" width="70" height="10" rx="4" className={isDark ? "fill-zinc-800" : "fill-slate-800"} />
                        <rect x="15" y="180" width="70" height="10" rx="4" className={isDark ? "fill-zinc-800" : "fill-slate-800"} />
                    </svg>
                    <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none ${colorMap.textMain}`}>
                        <span className="text-6xl font-mono font-black tabular-nums tracking-tighter drop-shadow-md bg-white/20 dark:bg-black/20 backdrop-blur-sm px-4 py-2 rounded-2xl">
                            {formatTime(focusRemainingSeconds)}
                        </span>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <MysteryPrizeModal prize={mysteryPrize} onClaim={() => setMysteryPrize(null)} />
      <WinLogModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
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