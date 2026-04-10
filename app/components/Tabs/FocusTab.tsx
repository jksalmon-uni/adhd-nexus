"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Play, Wand2, X, Sparkles, Loader2, Gift } from "lucide-react";
import type { Task, Priority, Ritual, CustomWishlistItem } from "../../types";
import UnstuckerChat from "./UnstuckerChat";

interface FocusTabProps {
  rituals: Ritual[];
  completeRitual: (id: string) => void;
  colorMap: Record<string, string>;
  isDark: boolean;
  handleAddTask: () => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  inputDate: string;
  setInputDate: (date: string) => void;
  showDurationPicker: boolean;
  setShowDurationPicker: (show: boolean) => void;
  inputDuration: number;
  setInputDuration: (duration: number) => void;
  inputPriority: Priority;
  setInputPriority: (priority: Priority) => void;
  tasks: Task[];
  setRandomTaskId: (id: string | null) => void;
  holdingTaskId: string | null;
  holdProgress: number;
  startHolding: (id: string) => void;
  stopHolding: () => void;
  startFocusTimer: (task: Task, duration?: number) => void;
  setTasks: (tasks: Task[]) => void;
  getTaskStyles: (priority: Priority) => string;
  customWishlist: CustomWishlistItem[];
}

export default function FocusTab({
  rituals,
  completeRitual,
  colorMap,
  isDark,
  handleAddTask,
  inputValue,
  setInputValue,
  inputDate,
  setInputDate,
  showDurationPicker,
  setShowDurationPicker,
  inputDuration,
  setInputDuration,
  inputPriority,
  setInputPriority,
  tasks,
  setRandomTaskId,
  holdingTaskId,
  holdProgress,
  startHolding,
  stopHolding,
  startFocusTimer,
  setTasks,
  getTaskStyles,
  customWishlist,
}: FocusTabProps) {
  
  const [unstuckTask, setUnstuckTask] = useState<string | null>(null);
  const [chosenTaskId, setChosenTaskId] = useState<string | null>(null);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [attachingRewardFor, setAttachingRewardFor] = useState<string | null>(null);
  const [newBountyText, setNewBountyText] = useState("");

  // UPDATED: Now points to the dedicated breakdown brain!
  const handleAIBreakdown = async (taskId: string, taskText: string) => {
    setGeneratingFor(taskId);
    try {
      const response = await fetch("/api/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: taskText }), // Much cleaner payload
      });

      if (!response.ok) throw new Error("API failed");
      const data = await response.json();

      const newSubtasks = data.result
        .split('\n')
        .filter((line: string) => line.trim().match(/^\d+\./))
        .map((line: string, index: number) => {
          const cleanText = line.replace(/^\d+\.\s*/, '').trim();
          return {
            id: `auto-${Date.now()}-${index}`,
            text: cleanText,
            completed: false,
          };
        })
        .filter((subtask: any) => subtask.text !== ""); 

      if (newSubtasks.length > 0) {
        setTasks(tasks.map(t =>
          t.id === taskId
            ? { ...t, subTasks: [...t.subTasks, ...newSubtasks] }
            : t
        ));
      }
    } catch (error) {
      console.error("Failed to generate subtasks", error);
    } finally {
      setGeneratingFor(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* RITUALS */}
      {rituals.some((r) => !r.completed) && (
        <div className={`p-5 rounded-4xl border ${colorMap.card} shadow-sm`}>
          <h3 className="text-[10px] font-black uppercase opacity-40 mb-3 px-2 flex items-center gap-2">
            <Leaf size={12} /> Morning Rituals
          </h3>
          <div className="space-y-2">
            {rituals
              .filter((r) => !r.completed)
              .map((r, i) => (
                <button
                  key={`ritual-${r.id}-${i}`}
                  onClick={() => completeRitual(r.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-all ${
                    isDark
                      ? "bg-zinc-800/50 hover:bg-zinc-800 text-white"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-800"
                  } text-left`}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-emerald-500/50 shrink-0" />
                  <span className="flex-1 font-semibold">{r.text}</span>
                  <span className="text-[10px] font-black text-amber-500">
                    +5💎
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* ADD TASK FORM */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddTask();
        }}
        className={`p-6 rounded-[36px] border ${colorMap.card} flex flex-col gap-4 shadow-sm`}
      >
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What needs doing?"
          className={`w-full px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 ${colorMap.input}`}
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
            className={`flex-1 px-3 py-2 rounded-xl text-xs outline-none ${colorMap.input}`}
          />
          <button
            type="button"
            onClick={() => setShowDurationPicker(!showDurationPicker)}
            className={`flex-1 text-left px-3 py-2 rounded-xl text-[10px] font-bold border border-dashed ${
              isDark ? "border-zinc-700" : "border-slate-300"
            } ${colorMap.btnEst}`}
          >
            {inputDuration > 0 ? `⏱️ ${inputDuration}m` : "⏱️ Estimate?"}
          </button>
        </div>
        <div
          className={`flex justify-around items-center py-2.5 rounded-2xl ${
            isDark ? "bg-black/20" : "bg-slate-50"
          }`}
        >
          {(["low", "med", "high", "urgent"] as Priority[]).map((p) => (
            <button
              key={`pri-${p}`}
              type="button"
              onClick={() => setInputPriority(p)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                inputPriority === p
                  ? "scale-110 border-white ring-4 ring-white/10"
                  : "border-transparent opacity-30"
              } ${
                p === "low"
                  ? "bg-blue-400"
                  : p === "med"
                  ? "bg-emerald-500"
                  : p === "high"
                  ? "bg-amber-500"
                  : "bg-rose-500 animate-pulse"
              }`}
            />
          ))}
        </div>
        {showDurationPicker && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            className="flex gap-2 pt-1"
          >
            {[5, 15, 30, 60].map((m) => (
              <button
                key={`dur-${m}`}
                type="button"
                onClick={() => setInputDuration(m)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                  inputDuration === m
                    ? "bg-emerald-500 text-white shadow-md"
                    : colorMap.btnEst
                }`}
              >
                {m}m
              </button>
            ))}
          </motion.div>
        )}
        <button
          type="submit"
          className="bg-emerald-600 py-4 rounded-2xl font-black text-white hover:bg-emerald-500 active:scale-[0.98] transition-all"
        >
          Add Task
        </button>
      </form>

      {/* YOUR DAY HEADER & CHOICE HELPER */}
      <div className="flex justify-between items-center mb-4 px-2 mt-8">
        <h2 className={`text-xl font-bold ${colorMap.textMain}`}>Your Day</h2>
        
        {tasks.filter((t) => t.date === new Date().toISOString().split("T")[0]).length > 1 && (
          <button
            onClick={() => {
              const today = tasks.filter(
                (t) => t.date === new Date().toISOString().split("T")[0]
              );
              const winner = today[Math.floor(Math.random() * today.length)];
              setChosenTaskId(winner.id);
              setRandomTaskId(winner.id);
            }}
            className="text-[10px] font-black uppercase px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all active:scale-95"
          >
            🎲 Choice Helper
          </button>
        )}
      </div>

      {/* TASK LIST */}
      <div className="space-y-4">
        {tasks
          .filter((t) => t.date === new Date().toISOString().split("T")[0])
          .map((t, index) => (
            <motion.div
              layout
              key={`task-${t.id}-${index}`}
              className={`relative overflow-hidden rounded-4xl border-2 transition-all duration-300 ${
                colorMap.card
              } ${
                chosenTaskId === t.id 
                  ? "border-amber-500 ring-4 ring-amber-500/20 scale-[1.02] shadow-xl z-10" 
                  : getTaskStyles(t.priority)
              }`}
            >
              {holdingTaskId === t.id && (
                <motion.div
                  className="absolute top-0 left-0 h-1.5 bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${holdProgress}%` }}
                />
              )}
              <div
                onMouseDown={() => startHolding(t.id)}
                onMouseUp={stopHolding}
                onTouchStart={() => startHolding(t.id)}
                onTouchEnd={stopHolding}
                className="w-full flex justify-between items-center p-6 text-left relative group select-none cursor-pointer"
              >
                <div className="flex flex-col gap-1">
                  <span
                    className={`font-bold flex items-center gap-3 ${
                      t.priority === "urgent"
                        ? "text-lg text-rose-400"
                        : "text-sm"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${
                        holdingTaskId === t.id
                          ? "border-emerald-500"
                          : t.priority === "urgent"
                          ? "bg-rose-500 border-rose-500"
                          : t.priority === "high"
                          ? "border-amber-500"
                          : colorMap.taskBullet
                      }`}
                    />{" "}
                    {t.text}
                  </span>
                  {t.bounty && (
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mt-1 ml-6">
                      <Gift size={12} /> Reward: {t.bounty}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-amber-500 font-black text-xs pr-2">
                    +{t.duration || 5}💎
                  </span>
                  
                  {/* UNSTUCKER CHAT BUTTON */}
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setUnstuckTask(t.text);
                    }}
                    className="p-2 rounded-xl transition-all bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white"
                    title="Talk to the Unstucker"
                  >
                    <Wand2 size={14} />
                  </button>

                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      startFocusTimer(t);
                    }}
                    className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Play size={14} fill="currentColor" />
                    {t.duration > 0 && <span className="font-bold">{t.duration}m</span>}
                  </button>
                </div>
              </div>
              
              <div
                className={`p-5 pt-0 border-t ${
                  isDark ? "border-zinc-800" : "border-slate-50"
                }`}
              >
                {t.priority === "urgent" && !t.bounty && attachingRewardFor !== t.id && (
                  <div className="mt-4">
                    <button
                      onClick={() => setAttachingRewardFor(t.id)}
                      className="flex items-center gap-2 text-xs font-bold bg-amber-500/10 text-amber-500 px-3 py-2 rounded-xl hover:bg-amber-500 hover:text-white transition-colors"
                    >
                      <Gift size={14} /> Attach Reward
                    </button>
                  </div>
                )}
                {attachingRewardFor === t.id && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-2">
                    <label className="text-xs font-bold text-amber-600 dark:text-amber-400">Attach a Reward to this Urgent Task</label>
                    {customWishlist.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {customWishlist.map(w => (
                          <button
                            key={w.id}
                            onClick={() => {
                              setTasks(tasks.map(x => x.id === t.id ? { ...x, bounty: w.title } : x));
                              setAttachingRewardFor(null);
                            }}
                            className="text-[10px] font-bold bg-amber-500 text-white px-2 py-1 rounded-lg hover:bg-amber-600"
                          >
                            {w.title}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        value={newBountyText}
                        onChange={(e) => setNewBountyText(e.target.value)}
                        placeholder="Or type a custom reward..."
                        className="flex-1 text-xs px-2 py-1 rounded-lg border border-amber-500/30 bg-white dark:bg-zinc-900 outline-none text-amber-600 dark:text-amber-400 placeholder:text-amber-500/50"
                      />
                      <button
                        onClick={() => {
                          if (!newBountyText.trim()) return;
                          setTasks(tasks.map(x => x.id === t.id ? { ...x, bounty: newBountyText.trim() } : x));
                          setNewBountyText("");
                          setAttachingRewardFor(null);
                        }}
                        disabled={!newBountyText.trim()}
                        className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-lg disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setAttachingRewardFor(null); setNewBountyText(""); }}
                        className="text-xs text-amber-600 dark:text-amber-400 px-2 py-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {/* SUBTASK GENERATOR BAR */}
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="text"
                    placeholder="Type a subtask or let AI break it down..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
                        setTasks(
                          tasks.map((x) =>
                            x.id === t.id
                              ? {
                                  ...x,
                                  subTasks: [
                                    ...x.subTasks,
                                    {
                                      text: e.currentTarget.value,
                                      completed: false,
                                      id: Date.now().toString(),
                                    },
                                  ],
                                }
                              : x
                          )
                        );
                        e.currentTarget.value = "";
                      }
                    }}
                    className={`flex-1 text-xs p-3 rounded-xl bg-transparent border border-dashed ${
                      isDark
                        ? "border-zinc-700 text-zinc-400 focus:border-purple-500"
                        : "border-slate-200 text-slate-500 focus:border-purple-500"
                    } focus:opacity-100 outline-none transition-colors`}
                  />
                  <button
                    onClick={() => handleAIBreakdown(t.id, t.text)}
                    disabled={generatingFor === t.id}
                    className="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    title="Auto-Generate Subtasks"
                  >
                    {generatingFor === t.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                  </button>
                </div>

                {/* SUBTASKS LIST */}
                <div className="space-y-2 mt-4">
                  {t.subTasks.map((s, i) => (
                    <button
                      key={`sub-${s.id}-${i}`}
                      onClick={() =>
                        setTasks(
                          tasks.map((x) =>
                            x.id === t.id
                              ? {
                                  ...x,
                                  subTasks: x.subTasks.map((y) =>
                                    y.id === s.id
                                      ? { ...y, completed: !y.completed }
                                      : y
                                  ),
                                }
                              : x
                          )
                        )
                      }
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs transition-all ${
                        s.completed
                          ? "opacity-30 line-through"
                          : "bg-black/5 dark:bg-black/20"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border ${
                          s.completed
                            ? "bg-emerald-500 border-emerald-500 text-white flex items-center justify-center text-[10px]"
                            : "border-zinc-500 dark:border-zinc-700"
                        }`}
                      >
                        {s.completed && "✓"}
                      </div>
                      <span className="text-left flex-1">{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
      </div>

      {/* THE UNSTUCKER MODAL */}
      <AnimatePresence>
        {unstuckTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-md h-[80vh] flex flex-col"
            >
              <button
                onClick={() => setUnstuckTask(null)}
                className="absolute -top-12 right-0 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors z-50"
              >
                <X size={20} />
              </button>
              
              <div className="flex-1 w-full bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden shadow-2xl relative">
                <UnstuckerChat 
                  isDark={isDark} 
                  colorMap={colorMap} 
                  initialTask={unstuckTask} 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}