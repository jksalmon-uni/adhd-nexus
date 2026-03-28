"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Target, Calendar as CalIcon, Leaf, Gem,
  Settings, Brain, CheckCircle2,
  Zap, History, Play, X,
  Timer,
  Gift, TimerReset, Plus, ArrowLeft, ArrowRight,
  Trash2, CheckSquare
} from "lucide-react";

import SettingsModal from "./components/Modals/SettingsModal";
import WinLogModal from "./components/Modals/WinLogModal";
import MysteryPrizeModal from "./components/Modals/MysteryPrizeModal";
import BrainDumpDrawer from "./components/Modals/BrainDumpDrawer";
import FocusTimerModal from "./components/Modals/FocusTimerModal";
import OverwhelmModal from "./components/Modals/OverwhelmModal";
import BreathingModal from "./components/Modals/BreathingModal";

import StatusBar from "./components/Layout/StatusBar";
import Header from "./components/Layout/Header";
import Navigation from "./components/Layout/Navigation";

import FocusTab from "./components/Tabs/FocusTab";
import RechargeTab from "./components/Tabs/RechargeTab";
import CalendarTab from "./components/Tabs/CalendarTab";
import RewardsTab from "./components/Tabs/RewardsTab";

import type { Task, Priority, Reward, Ritual } from "./types";

export default function Home() {
  // MARK: State & persistence
  // --- 0. DATA ISOLATION ---
  const [isDevMode, setIsDevMode] = useState(false);
  const SAVE_KEY = useMemo(() => (isDevMode ? "dev-nexus-" : "prod-nexus-"), [
    isDevMode,
  ]);

  // --- 1. CORE STATE ---
  const [activeTab, setActiveTab] = useState<
    "focus" | "calendar" | "recharge" | "rewards"
  >("focus");
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
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">(
    "month"
  );
  const [isVentMode, setIsVentMode] = useState(false);
  const [ventTimer, setVentTimer] = useState(60);
  const [isBreathing, setIsBreathing] = useState(false);
  const [waterIntake, setWaterIntake] = useState(0);

  // --- ECONOMY & GENTLE STREAKS ---
  const [points, setPoints] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [dailyPointsEarned, setDailyPointsEarned] = useState(0);
  const DAILY_CAP = 250;
  const [gardenPlants, setGardenPlants] = useState<string[]>([]);
  const [lastPlantedDate, setLastPlantedDate] = useState<string>("");

  const handleDrinkWater = () => {
    if (waterIntake >= 8) return;
    setWaterIntake(waterIntake + 1);
    playSound("complete_task");
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    if (dailyPointsEarned < DAILY_CAP) {
      setPoints((p) => p + 1);
      setDailyPointsEarned((d) => d + 1);
    }
  };

  // --- DATA LISTS ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [brainDump, setBrainDump] = useState<string[]>([]);
  const [rituals, setRituals] = useState<Ritual[]>([
    {
      id: "rit1",
      text: "Drink a glass of water",
      completed: false,
      lastCompletedDate: "",
    },
    {
      id: "rit2",
      text: "Take medication/supplements",
      completed: false,
      lastCompletedDate: "",
    },
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
  const [inputDate, setInputDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [newRewardTitle, setNewRewardTitle] = useState("");
  const [newRewardCost, setNewRewardCost] = useState<number | "">("");
  const [randomTaskId, setRandomTaskId] = useState<string | null>(null);

  // --- TIMER & AUDIO REFS ---
  const [ambientTrack, setAmbientTrack] = useState<
    "none" | "rain" | "cafe" | "lofi"
  >("none");
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
  const abortOnFocus = () => {
    setFocusTask(null); setFocusRemainingSeconds(0);
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const playSound = (s: string) => { if (soundEnabled) { try { new Audio(`/sounds/${s}.mp3`).play(); } catch(e){} } };


  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    playSound("add_task");
    setTasks([
      {
        text: inputValue,
        duration: inputDuration,
        id: `${Date.now()}-${Math.random()}`,
        date: inputDate,
        subTasks: [],
        priority: inputPriority,
      },
      ...tasks,
    ]);
    setInputValue("");
    setInputDuration(0);
    setInputPriority("med");
    setShowDurationPicker(false);
  };

  const promoteToTask = (text: string, index: number) => {
    setTasks([
      {
        text,
        duration: 0,
        id: `${Date.now()}-${Math.random()}`,
        date: new Date().toISOString().split("T")[0],
        subTasks: [],
        priority: "med",
      },
      ...tasks,
    ]);
    setBrainDump(brainDump.filter((_, i) => i !== index));
    closeDumpMenu();
    setOverwhelmMode(false);
    setActiveTab("focus");
    confetti({ particleCount: 40 });
  };

  const completeTask = (taskId: string) => {
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return;
    playSound("complete_task");
    setCompletedTasks((prev) =>
      [{ ...t, date: new Date().toISOString() }, ...prev].slice(0, 50)
    );
    const subScaling =
      t.subTasks.length > 0
        ? t.subTasks.filter((s) => s.completed).length / t.subTasks.length
        : 1;
    const priorityBonus =
      t.priority === "urgent" ? 1.5 : t.priority === "high" ? 1.2 : 1;
    const earned = Math.max(
      1,
      Math.floor((t.duration || 5) * subScaling * priorityBonus)
    );
    setTotalXp((x) => x + (t.duration || 5));
    if (dailyPointsEarned < DAILY_CAP) {
      const allowed = Math.min(earned, DAILY_CAP - dailyPointsEarned);
      setPoints((p) => p + allowed);
      setDailyPointsEarned((d) => d + allowed);
    }
    setTasks((prev) => prev.filter((x) => x.id !== taskId));
    setRandomTaskId(null);
    setFocusTask(null);
    triggerGardenGrowth();
    confetti({ particleCount: 100 });
  };

  const handleCompleteTask = (taskId: string) => {
    if (focusIntervalRef.current) {
      clearInterval(focusIntervalRef.current);
    }
    completeTask(taskId);
  };

  const startFocusTimer = (t: Task, overrideMins?: number) => {
    if (focusIntervalRef.current) {
      clearInterval(focusIntervalRef.current);
    }
    const finalMins = overrideMins || (t.duration > 0 ? t.duration : 30);
    setFocusTask({ ...t, duration: finalMins });
    setFocusRemainingSeconds(finalMins * 60);
    focusIntervalRef.current = setInterval(() => {
      setFocusRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (focusIntervalRef.current) {
            clearInterval(focusIntervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (
        window.location.href.includes("localhost") ||
        window.location.href.includes("-dev")
      ) {
        setIsDevMode(true);
      }
    }
    const today = new Date().toLocaleDateString();
    const load = (
      k: string,
      f: (v: any) => void,
      parser: (s: string) => any = (s) => JSON.parse(s)
    ) => {
      const s = localStorage.getItem(SAVE_KEY + k);
      if (s) {
        try {
          f(parser(s));
        } catch (e) {}
      }
    };
    load("tasks", setTasks);
    load("dump", setBrainDump);
    load("completed", setCompletedTasks);
    load("rewards", setRewards);
    load("theme", setTheme, (v) => v);
    load("points", setPoints, (v) => parseInt(v, 10) || 0);
    load("xp", setTotalXp, (v) => parseInt(v, 10) || 0);
    load("settings-sounds", setSoundEnabled, (v) => v === "true");
    load("overwhelm", setOverwhelmMode, (v) => v === "true");
    load("garden", setGardenPlants);
    load("last-plant", setLastPlantedDate, (v) => v);
    load("water", setWaterIntake, (v) => parseInt(v, 10) || 0);
    const savedRituals = localStorage.getItem(SAVE_KEY + "rituals");
    if (savedRituals) {
      const parsedRituals: Ritual[] = JSON.parse(savedRituals);
      const checkedRituals = parsedRituals.map((r) =>
        r.lastCompletedDate !== today ? { ...r, completed: false } : r
      );
      setRituals(checkedRituals);
    }
    const rd = localStorage.getItem(SAVE_KEY + "reset-date");
    if (rd !== today) {
      setDailyPointsEarned(0);
      setWaterIntake(0);
      localStorage.setItem(SAVE_KEY + "reset-date", today);
    } else {
      load("daily-points", setDailyPointsEarned, (v) => parseInt(v, 10) || 0);
    }
    const h = new Date().getHours();
    setGreeting(
      h < 12 ? "Good Morning!" : h < 18 ? "Keep Pushing." : "Good Evening."
    );
    setIsLoaded(true);
  }, [SAVE_KEY]);

  useEffect(() => {
    if (isLoaded) {
      const save = (k: string, v: any) =>
        localStorage.setItem(
          SAVE_KEY + k,
          typeof v === "string" ? v : JSON.stringify(v)
        );
      save("tasks", tasks);
      save("dump", brainDump);
      save("completed", completedTasks);
      save("rewards", rewards);
      save("theme", theme);
      save("points", points.toString());
      save("xp", totalXp.toString());
      save("daily-points", dailyPointsEarned.toString());
      save("settings-sounds", soundEnabled.toString());
      save("overwhelm", overwhelmMode.toString());
      save("rituals", rituals);
      save("garden", gardenPlants);
      save("last-plant", lastPlantedDate);
      save("water", waterIntake.toString());
    }
  }, [
    tasks,
    brainDump,
    points,
    totalXp,
    dailyPointsEarned,
    theme,
    rewards,
    soundEnabled,
    overwhelmMode,
    rituals,
    gardenPlants,
    lastPlantedDate,
    isLoaded,
    completedTasks,
    SAVE_KEY,
    waterIntake,
  ]);

  // --- 4. THEME & MATH ---
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark]);

  const colorMap = {
    bg: "bg-stone-50 text-slate-900 dark:bg-zinc-950 dark:text-white",
    card:
      "bg-white border-slate-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-xl",
    input:
      "bg-white text-slate-900 border-slate-300 dark:bg-zinc-800 dark:text-white dark:border-zinc-700",
    textMain: "text-slate-900 dark:text-zinc-100",
    tabActive: "bg-white text-emerald-600 shadow-md dark:bg-zinc-800 dark:text-emerald-400 dark:border-emerald-500/20",
    stencilColor: "text-stone-50 dark:text-zinc-950",
    btnEst: isDark
      ? "bg-zinc-800 text-zinc-400"
      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
    textMuted: isDark ? "text-zinc-500" : "text-slate-400",
    tabInactive: isDark ? "text-zinc-500" : "text-slate-400",
    rechargeIconBg: isDark ? "bg-zinc-800" : "bg-slate-100",
    gemCounter: isDark
      ? "border-amber-500/20 text-amber-400 bg-zinc-900"
      : "border-amber-300 text-amber-600 bg-amber-50",
    taskBullet: isDark
      ? "bg-zinc-700 border-zinc-700"
      : "bg-slate-200 border-slate-300",
    dumpBg: isDark ? "bg-zinc-900" : "bg-amber-50",
    dumpCard: isDark
      ? "bg-zinc-800 border-zinc-700"
      : "bg-white border-zinc-900/5",
    hourglassSand: isDark ? "text-zinc-400" : "text-zinc-500",
  };

  const focusCompletionRatio = useMemo(() => {
    if (!focusTask || focusTask.duration === 0) return 0;
    const totalSeconds = focusTask.duration * 60;
    return Math.max(
      0,
      Math.min(1, 1 - focusRemainingSeconds / totalSeconds)
    );
  }, [focusTask, focusRemainingSeconds]);

  const triggerGardenGrowth = () => {
    const today = new Date().toLocaleDateString();
    if (lastPlantedDate !== today) {
      const plants = ["🌱", "🌿", "🪴", "🌲", "🌸", "🌺", "🌻", "🍄", "🌵"];
      const randomPlant = plants[Math.floor(Math.random() * plants.length)];
      setGardenPlants((prev) => [...prev, randomPlant].slice(-14));
      setLastPlantedDate(today);
    }
  };

  const completeRitual = (id: string) => {
    playSound("add_task");
    confetti({ particleCount: 30, origin: { y: 0.8 } });
    setRituals(
      rituals.map((r) =>
        r.id === id
          ? { ...r, completed: true, lastCompletedDate: new Date().toLocaleDateString() }
          : r
      )
    );
    setTotalXp((x) => x + 5);
    if (dailyPointsEarned < DAILY_CAP) {
      setPoints((p) => p + 5);
      setDailyPointsEarned((d) => d + 5);
    }
    triggerGardenGrowth();
  };

  const getTaskStyles = (p: Priority) => {
    switch (p) {
      case "urgent":
        return `border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)] scale-[1.02] ${
          isDark ? "bg-rose-950/10" : "bg-rose-50/30"
        }`;
      case "high":
        return `border-amber-500/40 shadow-sm ${
          isDark ? "bg-amber-900/5" : "bg-amber-50/20"
        }`;
      case "med":
        return `border-transparent`;
      case "low":
        return `border-transparent opacity-70 scale-[0.98]`;
    }
  };

  const handleAddDump = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputDump.trim()) return;
    setBrainDump([inputDump, ...brainDump]);
    setInputDump("");
  };

  const triggerVentMode = () => {
    setIsVentMode(true);
    setVentTimer(60);
    setInputDump("");
    ventIntervalRef.current = setInterval(() => {
      setVentTimer((prev) => {
        if (prev <= 1) {
          clearInterval(ventIntervalRef.current!);
          setIsVentMode(false);
          setIsDumpOpen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (!isVentMode && ventTimer === 0 && inputDump.trim()) {
      handleAddDump();
      setVentTimer(60);
    }
  }, [isVentMode, ventTimer, inputDump]);

  const closeDumpMenu = () => {
    setIsDumpOpen(false);
    setIsVentMode(false);
    if (ventIntervalRef.current) clearInterval(ventIntervalRef.current);
  };

  // probabilities must add to 1
  const mysteryBoxPrizes= [
    {
      title: "Free Pass on 1 Chore",
      probability: 0.50,
    },
    {
      title: "Take a 20 min Nap",
      probability: 0.30,
    },
    {
      title: "Buy a small treat",
      probability: 0.20,
    },
  ];

  const openMysteryBox = () => {
  if (points < 30) return;
  setPoints(p => p - 30);
  playSound('redeem');
  confetti({ particleCount: 150, spread: 100, colors: ['#a855f7', '#fcd34d', '#3b82f6'] });

  // combine rewards and mystery prizes into one pool
  const prizePool = [
    ...rewards.map(r => ({ title: r.title, probability: 0.5 / rewards.length })),
    ...mysteryBoxPrizes,
  ];

  let roll = Math.random();
  let won = prizePool[prizePool.length - 1].title; // fallback to last if something goes wrong

  for (const prize of prizePool) {
    roll -= prize.probability;
    if (roll <= 0) {
      won = prize.title;
      break;
    }
  }

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
    setHoldingTaskId(id);
    setHoldProgress(0);
    progressIntervalRef.current = setInterval(
      () => setHoldProgress((p) => Math.min(p + 5, 100)),
      100
    );
    holdTimerRef.current = setTimeout(() => {
      completeTask(id);
      stopHolding();
    }, 2000);
  };

  const stopHolding = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setHoldingTaskId(null);
    setHoldProgress(0);
  };

  // --- AMBIENT AUDIO ---
  useEffect(() => {
    if (ambientTrack === "none") {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current = null;
      }
      return;
    }
    if (ambientAudioRef.current) ambientAudioRef.current.pause();
    const audio = new Audio(`/sounds/${ambientTrack}.mp3`);
    audio.loop = true;
    audio.volume = 0.4;
    audio.play().catch((e) => console.log("Audio play failed:", e));
    ambientAudioRef.current = audio;
    return () => {
      if (ambientAudioRef.current) ambientAudioRef.current.pause();
    };
  }, [ambientTrack]);

  useEffect(() => {
    if (!focusTask) {
      if (ambientTrack !== "none") setAmbientTrack("none");
      if (focusIntervalRef.current) {
        clearInterval(focusIntervalRef.current);
      }
    }
  }, [focusTask]);

  if (!isLoaded) return null;

  // MARK: User Interface
  return (
    <main
      className={`flex min-h-screen flex-col items-center font-sans transition-all duration-700 ${colorMap.bg} relative overflow-x-hidden`}
    >
      <AnimatePresence>
        {overwhelmMode && (
          <OverwhelmModal
            setOverwhelmMode={setOverwhelmMode}
            setIsDumpOpen={setIsDumpOpen}
            triggerVentMode={triggerVentMode}
          />
        )}
      </AnimatePresence>
      <div className="w-full max-w-md px-6 pb-24 relative z-10">
        <StatusBar
          totalXp={totalXp}
          points={points}
          colorMap={colorMap}
          setIsVaultOpen={setIsVaultOpen}
          setIsSettingsOpen={setIsSettingsOpen}
        />

        <Header
          greeting={greeting}
          colorMap={colorMap}
          setOverwhelmMode={setOverwhelmMode}
        />

        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDark={isDark}
          colorMap={colorMap}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "focus" && (
              <FocusTab
                rituals={rituals}
                completeRitual={completeRitual}
                colorMap={colorMap}
                isDark={isDark}
                handleAddTask={handleAddTask}
                inputValue={inputValue}
                setInputValue={setInputValue}
                inputDate={inputDate}
                setInputDate={setInputDate}
                showDurationPicker={showDurationPicker}
                setShowDurationPicker={setShowDurationPicker}
                inputDuration={inputDuration}
                setInputDuration={setInputDuration}
                inputPriority={inputPriority}
                setInputPriority={setInputPriority}
                tasks={tasks}
                setRandomTaskId={setRandomTaskId}
                holdingTaskId={holdingTaskId}
                holdProgress={holdProgress}
                startHolding={startHolding}
                stopHolding={stopHolding}
                startFocusTimer={startFocusTimer}
                setTasks={setTasks}
                getTaskStyles={getTaskStyles}
              />
            )}

            {activeTab === "recharge" && (
              <RechargeTab
                colorMap={colorMap}
                isDark={isDark}
                setIsBreathing={setIsBreathing}
                waterIntake={waterIntake}
                handleDrinkWater={handleDrinkWater}
              />
            )}

            {activeTab === "calendar" && (
              <CalendarTab
                isDark={isDark}
                colorMap={colorMap}
                calendarView={calendarView}
                setCalendarView={setCalendarView}
                viewDate={viewDate}
                setViewDate={setViewDate}
                tasks={tasks}
              />
            )}

            {activeTab === "rewards" && (
              <RewardsTab
                points={points}
                setPoints={setPoints}
                openMysteryBox={openMysteryBox}
                newRewardTitle={newRewardTitle}
                setNewRewardTitle={setNewRewardTitle}
                newRewardCost={newRewardCost}
                setNewRewardCost={setNewRewardCost}
                rewards={rewards}
                setRewards={setRewards}
                colorMap={colorMap}
                isDark={isDark}
                playSound={playSound}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- FLOATING BRAIN DUMP BUTTON --- */}
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsDumpOpen(true)} className={`fixed bottom-8 right-8 w-16 h-16 rounded-3xl shadow-2xl flex items-center justify-center text-3xl z-40 bg-amber-400 text-zinc-900`}><Brain /></motion.button>

      <BrainDumpDrawer
        isDumpOpen={isDumpOpen}
        closeDumpMenu={closeDumpMenu}
        colorMap={colorMap}
        isDark={isDark}
        overwhelmMode={overwhelmMode}
        isVentMode={isVentMode}
        triggerVentMode={triggerVentMode}
        handleAddDump={handleAddDump}
        inputDump={inputDump}
        setInputDump={setInputDump}
        brainDump={brainDump}
        promoteToTask={promoteToTask}
        setBrainDump={setBrainDump}
        ventTimer={ventTimer}
      />

        {/* Modals */}
      <AnimatePresence>
        {isBreathing && <BreathingModal onClose={() => setIsBreathing(false)} />}
      </AnimatePresence>

      <FocusTimerModal
        focusTask={focusTask || null}
        setFocusTask={setFocusTask}
        ambientTrack={ambientTrack}
        setAmbientTrack={setAmbientTrack}
        colorMap={colorMap}
        isDark={isDark}
        focusCompletionRatio={focusCompletionRatio}
        focusRemainingSeconds={focusRemainingSeconds}
        formatTime={formatTime}
        onComplete={() => focusTask && handleCompleteTask(focusTask.id)}
      />

      <MysteryPrizeModal
        prize={mysteryPrize}
        onClaim={() => setMysteryPrize(null)}
      />
      <WinLogModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        completedTasks={completedTasks}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDark={isDark}
        onToggleTheme={() => setTheme(isDark ? "light" : "dark")}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />
    </main>
  );
}
