"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  Task,
  Priority,
  Reward,
  Ritual,
  Theme,
  ClaimedReward,
} from "../types";

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

export function useNexusState() {
  // MARK: State & persistence
  // --- 0. DATA ISOLATION ---
  const [isDevMode, setIsDevMode] = useState(false);
  const SAVE_KEY = useMemo(() => (isDevMode ? "dev-nexus-" : "prod-nexus-"), [
    isDevMode,
  ]);

  // --- 1. CORE STATE ---
  const [activeTab, setActiveTab] = useState<
    "focus" | "calendar" | "recharge" | "rewards" | "scramble"
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

  const awardPoints = useCallback((amount: number) => {
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
  }, [dailyPointsEarned, DAILY_CEILING]);

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
  }, [bubbleState, dailyPointsEarned, playSound, resetBubbles, awardPoints]);

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
  const [claimedRewards, setClaimedRewards] = useState<ClaimedReward[]>([]);
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
  const [overtimeSeconds, setOvertimeSeconds] = useState(0);
  const [isOvertime, setIsOvertime] = useState(false);
  const [holdingTaskId, setHoldingTaskId] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const overtimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- 2. CORE FUNCTIONS (DEFINED BEFORE USE) ---
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAddTask = useCallback(() => {
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
  }, [inputValue, inputDuration, inputDate, inputPriority, tasks, playSound]);

    const closeDumpMenu = useCallback(() => {
    setIsDumpOpen(false);
    setIsVentMode(false);
    if (ventIntervalRef.current) clearInterval(ventIntervalRef.current);
  }, []);

  const promoteToTask = useCallback((text: string, index: number) => {
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
  }, [tasks, brainDump, closeDumpMenu]);

  const endFocusSession = (completed: boolean) => {
    const t = focusTask;
    if (!t) return;

    if (completed) {
      // Full reward logic for completed tasks
      let overtimeMultiplier = 1.0;
      if (isOvertime && overtimeSeconds > 300) {
        overtimeMultiplier = 0.8;
      }

      const priorityMultipliers = { low: 0.7, med: 1, high: 1.5, urgent: 2.0 };
      const priorityMultiplier = priorityMultipliers[t.priority] || 1;
      const baseGems = t.duration > 0 ? t.duration : 5;
      const potentialGems = baseGems * priorityMultiplier;
      const finalGems = potentialGems * overtimeMultiplier;
      awardPoints(finalGems);

      playSound("complete_task");
      setCompletedTasks((prev) =>
        [{ ...t, date: new Date().toISOString() }, ...prev].slice(0, 50)
      );
      setTasks((prev) => prev.filter((x) => x.id !== t.id));
      triggerGardenGrowth();
      confetti({ particleCount: 100 });
    } else {
      // Abort logic
      if (isOvertime) {
        // Award points for original time if aborted during overtime
        const priorityMultipliers = { low: 0.7, med: 1, high: 1.5, urgent: 2.0 };
        const priorityMultiplier = priorityMultipliers[t.priority] || 1;
        const baseGems = t.duration > 0 ? t.duration : 5;
        const potentialGems = baseGems * priorityMultiplier;
        awardPoints(potentialGems);
      }
    }

    setFocusTask(null);
    setRandomTaskId(null);
  };

  const handleCompleteTask = (taskId: string) => {
    if (focusTask?.id === taskId) {
      endFocusSession(true);
    } else {
      // This handles completing a task from the main list while a focus session for another task is active
      const t = tasks.find((x) => x.id === taskId);
      if (!t) return;
      playSound("complete_task");
      setCompletedTasks((prev) =>
        [{ ...t, date: new Date().toISOString() }, ...prev].slice(0, 50)
      );
      const priorityMultipliers = { low: 0.7, med: 1, high: 1.5, urgent: 2.0 };
      const multiplier = priorityMultipliers[t.priority] || 1;
      const baseGems = t.duration > 0 ? t.duration : 5;
      awardPoints(baseGems * multiplier);
      setTasks((prev) => prev.filter((x) => x.id !== taskId));
      triggerGardenGrowth();
      confetti({ particleCount: 100 });
    }
  };

  const completeTask = (taskId: string) => {
    handleCompleteTask(taskId);
  };

  const toggleSubTask = (taskId: string, subTaskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subTasks: t.subTasks.map((s) =>
                s.id === subTaskId ? { ...s, completed: !s.completed } : s
              ),
            }
          : t
      )
    );
    if (focusTask?.id === taskId) {
      setFocusTask((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          subTasks: prev.subTasks.map((s) =>
            s.id === subTaskId ? { ...s, completed: !s.completed } : s
          ),
        };
      });
    }
  };

  const startFocusTimer = (t: Task, overrideMins?: number) => {
    if (focusIntervalRef.current) clearInterval(focusIntervalRef.current);
    if (overtimeIntervalRef.current) clearInterval(overtimeIntervalRef.current);

    const finalMins = overrideMins || (t.duration > 0 ? t.duration : 30);
    setFocusTask({ ...t, duration: finalMins });
    setFocusRemainingSeconds(finalMins * 60);
    setIsOvertime(false);
    setOvertimeSeconds(0);

    focusIntervalRef.current = setInterval(() => {
      setFocusRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  };

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    // Start overtime timer when main timer finishes
    if (focusTask && focusRemainingSeconds === 0 && !isOvertime) {
      setIsOvertime(true);
      if (focusIntervalRef.current) clearInterval(focusIntervalRef.current);
      overtimeIntervalRef.current = setInterval(() => {
        setOvertimeSeconds((s) => s + 1);
      }, 1000);
    }
  }, [focusTask, focusRemainingSeconds, isOvertime]);

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
      f: (v: unknown) => void,
      parser: (s: string) => unknown = (s) => JSON.parse(s)
    ) => {
      const s = localStorage.getItem(SAVE_KEY + k);
      if (s) {
        try {
          f(parser(s));
        } catch (e) {}
      }
    };
    load("tasks", (v) => setTasks(v as Task[]));
    load("dump", (v) => setBrainDump(v as string[]));
    load("completed", (v) => setCompletedTasks(v as Task[]));
    load("rewards", (loadedRewards: unknown) => {
      if (!Array.isArray(loadedRewards)) return;
      const migratedRewards = loadedRewards
        .map((r: Reward) => {
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
    load("theme", (val: unknown) => {
      if (typeof val === 'string' && ["light", "dark", "system"].includes(val)) {
        setTheme(val as Theme);
      }
    });
    load("points", (v) => setPoints(v as number), (v) => parseInt(v, 10) || 0);
    load("xp", (v) => setTotalXp(v as number), (v) => parseInt(v, 10) || 0);
    load("settings-sounds", (v) => setSoundEnabled(v === "true"), (v) => v);
    load("overwhelm", (v) => setOverwhelmMode(v === "true"), (v) => v);
    load("garden", (v) => setGardenPlants(v as string[]));
    load("last-plant", (v) => setLastPlantedDate(v as string), (v) => v);
    load("water", (v) => setWaterIntake(v as number), (v) => parseInt(v, 10) || 0);
    load("claimed-rewards", (v) => setClaimedRewards(v as ClaimedReward[]));
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
load("points", (v: any) => setPoints(v), (v) => parseInt(v, 10) || 0);    }
    const h = new Date().getHours();
    setGreeting(
      h < 12 ? "Good Morning!" : h < 18 ? "Keep Pushing." : "Good Evening."
    );
    setIsLoaded(true);
  }, [SAVE_KEY])

  useEffect(() => {
    if (isLoaded) {
      const save = (k: string, v: unknown) =>
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
      save("claimed-rewards", claimedRewards);
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
    claimedRewards,
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

  const handleAddDump = useCallback(() => {
    if (!inputDump.trim()) return;
    setBrainDump([inputDump, ...brainDump]);
    setInputDump("");
  }, [inputDump, brainDump]);

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
  }, [isVentMode, ventTimer, inputDump, handleAddDump]);

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

  const claimReward = (r: Reward) => {
    if (points < r.cost) return;
    setPoints((p) => p - r.cost);
    const newClaimedReward: ClaimedReward = {
      instanceId: `${Date.now()}`,
      title: r.title,
      duration: r.duration,
      claimedAt: new Date().toISOString(),
      used: false,
    };
    setClaimedRewards((prev) => [newClaimedReward, ...prev]);
    playSound("redeem");
    confetti({
      particleCount: 150,
      spread: 100,
      colors: ["#a855f7", "#fcd34d", "#3b82f6"],
    });
  };

  const useClaimedReward = (instanceId: string) => {
    setClaimedRewards((prev) =>
      prev.map((cr) =>
        cr.instanceId === instanceId ? { ...cr, used: true } : cr
      )
    );
    playSound("complete_task");
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

  return {
    isLoaded,
    activeTab,
    setActiveTab,
    greeting,
    theme,
    setTheme,
    isDumpOpen,
    setIsDumpOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isVaultOpen,
    setIsVaultOpen,
    soundEnabled,
    setSoundEnabled,
    overwhelmMode,
    setOverwhelmMode,
    mysteryPrize,
    setMysteryPrize,
    viewDate,
    setViewDate,
    calendarView,
    setCalendarView,
    isVentMode,
    setIsVentMode,
    ventTimer,
    setVentTimer,
    isBreathing,
    setIsBreathing,
    waterIntake,
    setWaterIntake,
    bubbleState,
    setBubbleState,
    groundingStep,
    setGroundingStep,
    points,
    setPoints,
    totalXp,
    setTotalXp,
    dailyPointsEarned,
    setDailyPointsEarned,
    DAILY_CEILING,
    gardenPlants,
    setGardenPlants,
    lastPlantedDate,
    setLastPlantedDate,
    awardPoints,
    handleDrinkWater,
    playSound,
    handlePopBubble,
    resetBubbles,
    handleAdvanceGrounding,
    closeGroundingModal,
    tasks,
    setTasks,
    completedTasks,
    setCompletedTasks,
    brainDump,
    setBrainDump,
    rituals,
    setRituals,
    rewards,
    setRewards,
    inputValue,
    setInputValue,
    inputDump,
    setInputDump,
    inputDuration,
    setInputDuration,
    inputPriority,
    setInputPriority,
    inputDate,
    setInputDate,
    showDurationPicker,
    setShowDurationPicker,
    newRewardTitle,
    setNewRewardTitle,
    newRewardDuration,
    setNewRewardDuration,
    randomTaskId,
    setRandomTaskId,
    ambientTrack,
    setAmbientTrack,
    focusTask,
    setFocusTask,
    focusRemainingSeconds,
    setFocusRemainingSeconds,
    overtimeSeconds,
    setOvertimeSeconds,
    isOvertime,
    setIsOvertime,
    holdingTaskId,
    setHoldingTaskId,
    holdProgress,
    setHoldProgress,
    formatTime,
    handleAddTask,
    promoteToTask,
    endFocusSession,
    handleCompleteTask,
    completeTask,
    toggleSubTask,
    startFocusTimer,
    systemTheme,
    isDark,
    colorMap,
    focusCompletionRatio,
    triggerGardenGrowth,
    completeRitual,
    getTaskStyles,
    handleAddDump,
    triggerVentMode,
    closeDumpMenu,
    openMysteryBox,
    claimReward,
    useClaimedReward,
    startHolding,
    stopHolding,
    claimedRewards,
  };
}
