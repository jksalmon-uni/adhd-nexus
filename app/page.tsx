"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Leaf,
  Play,
  Zap,
  Droplet,
  RefreshCw,
  Gift,
  Plus,
  X,
  History,
  Settings,
} from "lucide-react";

import WinLogModal from "./components/Modals/WinLogModal";
import MysteryPrizeModal from "./components/Modals/MysteryPrizeModal";
import BrainDumpDrawer from "./components/Modals/BrainDumpDrawer";
import FocusTimerModal from "./components/Modals/FocusTimerModal";
import OverwhelmModal from "./components/Modals/OverwhelmModal";
import BreathingModal from "./components/Modals/BreathingModal";
import GroundingModal from "./components/Modals/GroundingModal";

import Header from "./components/Layout/Header";
import Navigation from "./components/Layout/Navigation";

import FocusTab from "./components/Tabs/FocusTab";
import CalendarTab from "./components/Tabs/CalendarTab";

// Inlined Types from types.ts
export type Task = {
  text: string;
  duration: number;
  id: string;
  date: string;
  subTasks: SubTask[];
  priority: Priority;
};
export type SubTask = { text: string; completed: boolean; id: string };
export type Priority = "low" | "med" | "high" | "urgent";
export type Reward = {
  title: string;
  cost: number;
  id: string;
  duration: number;
};
export type Ritual = {
  id: string;
  text: string;
  completed: boolean;
  lastCompletedDate: string;
};
export type Theme = "light" | "dark" | "system";

const useSystemTheme = () => {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setIsDark(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  return isDark ? "dark" : "light";
};

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
  const [theme, setTheme] = useState<Theme>('system');

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
  const [bubbleState, setBubbleState] = useState(Array(12).fill(false));
  const [groundingStep, setGroundingStep] = useState(0);

  // --- ECONOMY & GENTLE STREAKS ---
  const [points, setPoints] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [dailyPointsEarned, setDailyPointsEarned] = useState(0);
  const DAILY_CEILING = 300;
  const [gardenPlants, setGardenPlants] = useState<string[]>([]);
  const [lastPlantedDate, setLastPlantedDate] = useState<string>("");

  const awardPoints = (amount: number) => {
    let economicMultiplier = 1.0;
    if (dailyPointsEarned >= DAILY_CEILING) {
      economicMultiplier = 0;
    } else if (dailyPointsEarned >= 200) {
      economicMultiplier = 0.5;
    }

    const earned = Math.floor(amount * economicMultiplier);

    if (earned > 0) {
      setPoints((p) => p + earned);
      setDailyPointsEarned((d) => d + earned);
    }
  };

  const handleDrinkWater = () => {
    if (waterIntake >= 8) return;
    setWaterIntake(waterIntake + 1);
    playSound("complete_task");
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    awardPoints(1);
  };

  const playSound = useCallback(
    (s: string) => {
      if (soundEnabled) {
        try {
          new Audio(`/sounds/${s}.mp3`).play();
        } catch (e) {}
      }
    },
    [soundEnabled]
  );

  const handlePopBubble = (index: number) => {
    if (bubbleState[index]) return;
    const newBubbleState = [...bubbleState];
    newBubbleState[index] = true;
    setBubbleState(newBubbleState);
    playSound("bubble_pop");
  };

  const resetBubbles = useCallback(() => {
    setBubbleState(Array(12).fill(false));
  }, []);

  useEffect(() => {
    if (bubbleState.length > 0 && bubbleState.every(Boolean)) {
      const resetTimer = setTimeout(() => {
        confetti({
          particleCount: 250,
          spread: 360,
          origin: { y: 0.5 },
          scalar: 1.2,
        });
        playSound("level_up");
        awardPoints(5);
        resetBubbles();
      }, 300);
      return () => clearTimeout(resetTimer);
    }
  }, [bubbleState, dailyPointsEarned, playSound, resetBubbles]);

  const handleAdvanceGrounding = () => {
    if (groundingStep < 5) {
      setGroundingStep(groundingStep + 1);
    } else {
      confetti({ particleCount: 150, spread: 100 });
      awardPoints(5);
      setGroundingStep(0);
    }
  };

  const closeGroundingModal = () => {
    setGroundingStep(0);
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
    { title: "Watch 1 YouTube video", duration: 15, cost: 15, id: "r1" },
    { title: "Gaming Session", duration: 30, cost: 30, id: "r2" },
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
  const [newRewardDuration, setNewRewardDuration] = useState<number>(15);
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
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

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

    const priorityMultipliers = {
      low: 0.7,
      med: 1,
      high: 1.5,
      urgent: 2,
    };
    const multiplier = priorityMultipliers[t.priority] || 1;
    const baseGems = t.duration > 0 ? t.duration : 5;
    const potentialGems = Math.floor(baseGems * multiplier);
    awardPoints(potentialGems);

    setTotalXp((x) => x + (t.duration || 5));
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
    load("rewards", (loadedRewards: any) => {
      if (!Array.isArray(loadedRewards)) return;
      const migratedRewards = loadedRewards
        .map((r: any) => {
          if (!r || typeof r.id === "undefined") return null;
          if (typeof r.duration === "undefined") {
            const duration = r.cost || 15;
            return { ...r, duration, cost: duration };
          }
          return { ...r, cost: r.duration };
        })
        .filter(Boolean);
      setRewards(migratedRewards as Reward[]);
    });
    load("theme", (val: any) => {
      if (["light", "dark", "system"].includes(val)) {
        setTheme(val);
      }
    });
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
  const systemTheme = useSystemTheme();
  const isDark = useMemo(() => {
    if (theme === "system") {
      return systemTheme === "dark";
    }
    return theme === "dark";
  }, [theme, systemTheme]);

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
    tabActive:
      "bg-white text-emerald-600 shadow-md dark:bg-zinc-800 dark:text-emerald-400 dark:border-emerald-500/20",
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
          ? {
              ...r,
              completed: true,
              lastCompletedDate: new Date().toLocaleDateString(),
            }
          : r
      )
    );
    setTotalXp((x) => x + 5);
    awardPoints(5);
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
      setVentTimer((prev: number) => {
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

  const openMysteryBox = () => {
    if (points < 30) return;
    setPoints((p) => p - 30);
    playSound("redeem");
    confetti({
      particleCount: 150,
      spread: 100,
      colors: ["#a855f7", "#fcd34d", "#3b82f6"],
    });
    const fallbackPrizes = [
      "Free Pass on 1 Chore",
      "Take a 20 min Nap",
      "Buy a small treat",
      "Order Takeout tonight",
    ];
    const won = [
      ...rewards.map((r) => r.title),
      ...fallbackPrizes,
    ][Math.floor(Math.random() * (rewards.length + 4))];
    setMysteryPrize(won);
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
        {isBreathing && <BreathingModal onClose={() => setIsBreathing(false)} />}
        {groundingStep > 0 && (
          <GroundingModal
            step={groundingStep}
            onAdvance={handleAdvanceGrounding}
            onClose={closeGroundingModal}
          />
        )}
      </AnimatePresence>
      <div className="w-full max-w-md px-6 pb-24 relative z-10">
        <div className="flex justify-between items-start pt-8 pb-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black bg-white shadow-sm text-emerald-600 dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:text-emerald-400">
                <span className="text-[8px] opacity-50 -mb-1">LVL</span>
                {Math.floor(totalXp / 100) + 1}
              </div>
              <div className="flex flex-col gap-1">
                <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${totalXp % 100}%` }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsVaultOpen(true)}
                className={`p-2.5 rounded-xl ${colorMap.card} flex items-center justify-center`}
              >
                <History size={18} />
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className={`p-2.5 rounded-xl ${colorMap.card} flex items-center justify-center`}
              >
                <Settings size={18} />
              </button>
              <div className="px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-xl border border-amber-300 text-amber-600 bg-amber-50 dark:border-amber-500/20 dark:text-amber-400 dark:bg-zinc-900">
                <span>💎</span>
                {points}
              </div>
            </div>
            <div
              className={`text-xs font-bold px-2 ${
                dailyPointsEarned >= DAILY_CEILING
                  ? "text-rose-500"
                  : colorMap.textMuted
              }`}
            >
              Daily Limit: {dailyPointsEarned} / {DAILY_CEILING}
            </div>
          </div>
        </div>

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
                    <h3
                      className={`font-bold text-xl ${
                        isDark ? "text-white" : "text-slate-800"
                      }`}
                    >
                      Water Intake
                    </h3>
                    <span className="font-black text-amber-500">
                      {waterIntake} / 8
                    </span>
                  </div>
                  <div className="grid grid-cols-8 gap-2 mb-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={`water-dot-${i}`}
                        className={`h-2 rounded-full ${
                          i < waterIntake
                            ? "bg-blue-400"
                            : isDark
                            ? "bg-zinc-800"
                            : "bg-slate-200"
                        }`}
                      />
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

                <div className={`p-7 rounded-[40px] ${colorMap.card} shadow-sm`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3
                      className={`font-bold text-xl ${
                        isDark ? "text-white" : "text-slate-800"
                      }`}
                    >
                      Bubble Pop
                    </h3>
                    <button onClick={resetBubbles}>
                      <RefreshCw size={14} className={colorMap.textMuted} />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {bubbleState.map((isPopped, i) => (
                      <motion.button
                        key={`bubble-${i}`}
                        onClick={() => handlePopBubble(i)}
                        animate={isPopped ? { scale: [1, 0.9, 1] } : {}}
                        transition={{ duration: 0.2 }}
                        className={`w-12 h-12 rounded-full transition-all duration-200 focus:outline-none ${
                          isPopped
                            ? "bg-purple-300 shadow-[inset_0_4px_8px_rgba(0,0,0,0.1)]"
                            : "bg-purple-200 shadow-[0_4px_8px_rgba(0,0,0,0.15),inset_0_-4px_8px_rgba(0,0,0,0.1)]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setGroundingStep(1)}
                  className={`w-full flex items-center gap-6 p-7 rounded-[40px] active:scale-95 transition-all ${colorMap.card} shadow-sm`}
                >
                  <span
                    className={`text-3xl p-3 ${colorMap.rechargeIconBg} rounded-2xl`}
                  >
                    <Leaf className="text-emerald-400" />
                  </span>
                  <span
                    className={`font-bold text-xl ${
                      isDark ? "text-white" : "text-slate-800"
                    }`}
                  >
                    5-4-3-2-1 Grounding
                  </span>
                </motion.button>
              </div>
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
              <div className="space-y-4 pt-4">
                <button
                  onClick={openMysteryBox}
                  className={`w-full flex justify-between items-center p-8 rounded-[36px] transition-all border border-purple-500/50 bg-purple-500/10 shadow-lg ${
                    points >= 30
                      ? "active:scale-95 hover:bg-purple-500/20"
                      : "opacity-40 pointer-events-none"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl p-3 bg-purple-500 text-white rounded-2xl">
                      <Gift size={24} />
                    </span>
                    <div className="flex flex-col items-start">
                      <span className="font-black text-lg text-purple-500">
                        Mystery Box
                      </span>
                      <span className="text-xs font-bold opacity-60">
                        A fun gamble!
                      </span>
                    </div>
                  </div>
                  <span className="text-amber-500 font-black">30 💎</span>
                </button>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newRewardTitle || !newRewardDuration) return;
                    setRewards([
                      {
                        title: newRewardTitle,
                        duration: newRewardDuration,
                        cost: newRewardDuration,
                        id: Date.now().toString(),
                      },
                      ...rewards,
                    ]);
                    setNewRewardTitle("");
                    setNewRewardDuration(15);
                  }}
                  className={`p-4 rounded-4xl mt-8 mb-6 flex flex-col gap-3 ${colorMap.card}`}
                >
                  <h3
                    className={`text-center font-bold ${
                      isDark ? "text-white" : "text-slate-800"
                    }`}
                  >
                    Add Custom Reward
                  </h3>
                  <input
                    value={newRewardTitle}
                    onChange={(e) => setNewRewardTitle(e.target.value)}
                    placeholder="Reward Name (e.g. 'Play a game')"
                    className={`w-full px-4 py-3 rounded-2xl text-sm ${colorMap.input}`}
                  />
                  <label
                    className={`text-center text-xs font-bold mb-1 ${colorMap.textMuted}`}
                  >
                    How much time is this reward worth?
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: "5m", value: 5 },
                      { label: "15m", value: 15 },
                      { label: "30m", value: 30 },
                      { label: "1h", value: 60 },
                      { label: "2h", value: 120 },
                    ].map((d) => (
                      <button
                        type="button"
                        key={d.value}
                        onClick={() => setNewRewardDuration(d.value)}
                        className={`px-2 py-2 text-xs font-bold rounded-lg transition-colors ${
                          newRewardDuration === d.value
                            ? "bg-purple-600 text-white"
                            : isDark
                            ? "bg-zinc-800"
                            : "bg-slate-100"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="bg-purple-600 w-full h-12 flex items-center justify-center rounded-2xl font-bold text-white mt-2"
                  >
                    <Plus size={20} className="mr-2" />
                    Add Reward
                  </button>
                </form>

                {rewards.map((r, i) => (
                  <div key={`reward-${r.id}-${i}`} className="relative group">
                    <button
                      onClick={() => {
                        if (points >= r.cost) {
                          setPoints((p) => p - r.cost);
                          playSound("redeem");
                          confetti();
                        }
                      }}
                      className={`w-full flex justify-between items-center p-6 rounded-[32px] transition-all border ${
                        points >= r.cost
                          ? colorMap.card + " active:scale-95"
                          : "opacity-30 pointer-events-none border-transparent"
                      }`}
                    >
                      <div className="flex flex-col items-start text-left">
                        <span
                          className={`font-bold text-lg ${
                            isDark ? "text-white" : "text-slate-800"
                          }`}
                        >
                          {r.title}
                        </span>
                        <span
                          className={`text-xs font-semibold ${colorMap.textMuted}`}
                        >
                          Time Value: {r.duration}m
                        </span>
                      </div>
                      <span className="text-amber-500 font-black text-lg">
                        {r.cost} 💎
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRewards(rewards.filter((x) => x.id !== r.id));
                      }}
                      className="absolute -top-3 -right-3 bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black opacity-0 group-hover:opacity-100 shadow-xl transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- FLOATING BRAIN DUMP BUTTON --- */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsDumpOpen(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-3xl shadow-2xl flex items-center justify-center text-3xl z-40 bg-amber-400 text-zinc-900`}
      >
        <Brain />
      </motion.button>

      <BrainDumpDrawer
        isDumpOpen={isDumpOpen}
        closeDumpMenu={closeDumpMenu}
        colorMap={colorMap}
        overwhelmMode={overwhelmMode}
        isDark={isDark}
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

      <FocusTimerModal
        focusTask={focusTask}
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
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-[48px] p-10 border shadow-2xl bg-white border-slate-200 dark:bg-zinc-900 dark:border-zinc-800"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black">Settings</h2>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {(["light", "dark", "system"] as Theme[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`py-3 px-2 text-sm font-bold rounded-xl capitalize transition-colors flex items-center justify-center gap-2 ${
                          theme === t
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 dark:bg-zinc-800"
                        }`}
                      >
                        <span>
                          {t === "light"
                            ? "☀️"
                            : t === "dark"
                            ? "🌙"
                            : "🖥️"}
                        </span>
                        <span>{t}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
                    Sound
                  </label>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="w-full mt-2 p-6 rounded-3xl text-left border-2 font-bold bg-slate-50 border-slate-200 dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    {soundEnabled ? "🔊 Sounds On" : "🔇 Sounds Muted"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
