"use client";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import ScramblePadTab from "./components/Tabs/ScramblePadTab";
import {
  Brain,
  Gift,
  Plus,
  X,
  History,
  Settings,
  Ticket,
} from "lucide-react";

import WinLogModal from "./components/Modals/WinLogModal";
import MysteryPrizeModal from "./components/Modals/MysteryPrizeModal";
import BrainDumpDrawer from "./components/Modals/BrainDumpDrawer";
import OverwhelmModal from "./components/Modals/OverwhelmModal";
import BreathingModal from "./components/Modals/BreathingModal";
import GroundingModal from "./components/Modals/GroundingModal";
import RechargeTab from "./components/Tabs/RechargeTab";
import FocusTimerModal from "./components/Modals/FocusTimerModal";

import Header from "./components/Layout/Header";
import Navigation from "./components/Layout/Navigation";

import FocusTab from "./components/Tabs/FocusTab";
import CalendarTab from "./components/Tabs/CalendarTab";

import { useNexusState } from "./hooks/useNexusState";
import { Theme } from "./types";

export default function Home() {
  const state = useNexusState();

  if (!state.isLoaded) return null;

  // MARK: User Interface
  return (
    <main
      className={`flex min-h-screen flex-col items-center font-sans transition-all duration-700 ${state.colorMap.bg} relative overflow-x-hidden`}
    >
      <AnimatePresence>
        {state.overwhelmMode && (
          <OverwhelmModal
            setOverwhelmMode={state.setOverwhelmMode}
            setIsDumpOpen={state.setIsDumpOpen}
            triggerVentMode={state.triggerVentMode}
          />
        )}
        {state.isBreathing && <BreathingModal onClose={() => state.setIsBreathing(false)} />}
        {state.groundingStep > 0 && (
          <GroundingModal
            step={state.groundingStep}
            onAdvance={state.handleAdvanceGrounding}
            onClose={state.closeGroundingModal}
          />
        )}
      </AnimatePresence>
      <div className="w-full max-w-md px-6 pb-24 relative z-10">
        <div className="flex justify-between items-start pt-8 pb-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black bg-white shadow-sm text-emerald-600 dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:text-emerald-400">
                <span className="text-[8px] opacity-50 -mb-1">LVL</span>
                {Math.floor(state.totalXp / 100) + 1}
              </div>
              <div className="flex flex-col gap-1">
                <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${state.totalXp % 100}%` }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => state.setIsVaultOpen(true)}
                className={`p-2.5 rounded-xl ${state.colorMap.card} flex items-center justify-center`}
              >
                <History size={18} />
              </button>
              <button
                onClick={() => state.setIsSettingsOpen(true)}
                className={`p-2.5 rounded-xl ${state.colorMap.card} flex items-center justify-center`}
              >
                <Settings size={18} />
              </button>
              <div className="px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-xl border border-amber-300 text-amber-600 bg-amber-50 dark:border-amber-500/20 dark:text-amber-400 dark:bg-zinc-900">
                <span>💎</span>
                {state.points}
              </div>
            </div>
            <div
              className={`text-xs font-bold px-2 ${
                state.dailyPointsEarned >= state.DAILY_CEILING
                  ? "text-rose-500"
                  : state.colorMap.textMuted
              }`}
            >
              Daily Limit: {state.dailyPointsEarned} / {state.DAILY_CEILING}
            </div>
          </div>
        </div>

        <Header
          greeting={state.greeting}
          colorMap={state.colorMap}
          setOverwhelmMode={state.setOverwhelmMode}
        />

        <Navigation
          activeTab={state.activeTab}
          setActiveTab={state.setActiveTab}
          isDark={state.isDark}
          colorMap={state.colorMap}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={state.activeTab}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.2 }}
          >
            {state.activeTab === "focus" && (
              <FocusTab
                rituals={state.rituals}
                completeRitual={state.completeRitual}
                colorMap={state.colorMap}
                isDark={state.isDark}
                handleAddTask={state.handleAddTask}
                inputValue={state.inputValue}
                setInputValue={state.setInputValue}
                inputDate={state.inputDate}
                setInputDate={state.setInputDate}
                showDurationPicker={state.showDurationPicker}
                setShowDurationPicker={state.setShowDurationPicker}
                inputDuration={state.inputDuration}
                setInputDuration={state.setInputDuration}
                inputPriority={state.inputPriority}
                setInputPriority={state.setInputPriority}
                tasks={state.tasks}
                setRandomTaskId={state.setRandomTaskId}
                holdingTaskId={state.holdingTaskId}
                holdProgress={state.holdProgress}
                startHolding={state.startHolding}
                stopHolding={state.stopHolding}
                startFocusTimer={state.startFocusTimer}
                setTasks={state.setTasks}
                getTaskStyles={state.getTaskStyles}
              />
            )}

{state.activeTab === "scramble" && (
  <ScramblePadTab 
    isDark={state.isDark} 
    colorMap={state.colorMap} 
  />
)}

            {state.activeTab === "recharge" && (
              <RechargeTab
                isDark={state.isDark}
                colorMap={state.colorMap}
                setIsBreathing={state.setIsBreathing}
                waterIntake={state.waterIntake}
                handleDrinkWater={state.handleDrinkWater}
                bubbleState={state.bubbleState}
                handlePopBubble={state.handlePopBubble}
                resetBubbles={state.resetBubbles}
                setGroundingStep={state.setGroundingStep}
              />
            )}

            {state.activeTab === "calendar" && (
              <CalendarTab
                isDark={state.isDark}
                colorMap={state.colorMap}
                calendarView={state.calendarView}
                setCalendarView={state.setCalendarView}
                viewDate={state.viewDate}
                setViewDate={state.setViewDate}
                tasks={state.tasks}
              />
            )}

            {state.activeTab === "rewards" && (
              <div className="space-y-8 pt-4 pb-20">
                {/* My Inventory */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Ticket /> My Inventory
                  </h2>
                  {state.claimedRewards && state.claimedRewards.filter((r) => !r.used).length > 0 ? (
                    state.claimedRewards
                      .filter((r) => !r.used)
                      .map((cr) => (
                        <div
                          key={cr.instanceId}
                          className={`relative group p-6 rounded-2xl flex justify-between items-center ${state.colorMap.card} border-l-4 border-emerald-500`}
                        >
                          <div className="text-left">
                            <div
                              className={`font-bold text-lg ${
                                state.isDark ? "text-white" : "text-slate-800"
                              }`}
                            >
                              {cr.title}
                            </div>
                            <div className={`text-xs ${state.colorMap.textMuted}`}>
                              Claimed:{" "}
                              {new Date(cr.claimedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <button
                            onClick={() => state.useClaimedReward(cr.instanceId)}
                            className="bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg active:scale-95"
                          >
                            Use Now
                          </button>
                        </div>
                      ))
                  ) : (
                    <p className={`${state.colorMap.textMuted} text-center py-4`}>
                      Your inventory is empty. Buy rewards from the shop below!
                    </p>
                  )}

                  {state.claimedRewards && state.claimedRewards.filter((r) => r.used).length > 0 && (
                    <div className="space-y-2 pt-4">
                      <h3 className="font-bold flex items-center gap-2 text-sm opacity-50">
                        <History size={16} /> Used History
                      </h3>
                      {state.claimedRewards
                        .filter((r) => r.used)
                        .slice(0, 5)
                        .map((cr) => (
                          <div
                            key={cr.instanceId}
                            className="p-3 rounded-lg flex justify-between items-center opacity-40"
                          >
                            <span className="font-medium text-sm">
                              {cr.title}
                            </span>
                            <span className="text-xs">
                              {new Date(cr.claimedAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Reward Shop */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Reward Shop</h2>
                  <button
                    onClick={state.openMysteryBox}
                    className={`w-full flex justify-between items-center p-8 rounded-[36px] transition-all border ${state.colorMap.card} ${
                      state.points >= 30
                        ? "active:scale-95"
                        : "opacity-40 pointer-events-none"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl p-3 bg-purple-500 text-white rounded-2xl">
                        <Gift size={24} />
                      </span>
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
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
                      if (!state.newRewardTitle || !state.newRewardDuration)
                        return;
                      state.setRewards([
                        {
                          title: state.newRewardTitle,
                          duration: state.newRewardDuration,
                          cost: state.newRewardDuration,
                          id: Date.now().toString(),
                        },
                        ...state.rewards,
                      ]);
                      state.setNewRewardTitle("");
                      state.setNewRewardDuration(15);
                    }}
                    className={`p-4 rounded-2xl mt-8 mb-6 flex flex-col gap-3 ${state.colorMap.card}`}
                  >
                    <h3
                      className={`text-center font-bold ${
                        state.isDark ? "text-white" : "text-slate-800"
                      }`}
                    >
                      Add Custom Reward
                    </h3>
                    <input
                      value={state.newRewardTitle}
                      onChange={(e) => state.setNewRewardTitle(e.target.value)}
                      placeholder="Reward Name (e.g. 'Play a game')"
                      className={`w-full px-4 py-3 rounded-xl text-sm ${state.colorMap.input}`}
                    />
                    <label
                      className={`text-center text-xs font-bold mb-1 ${state.colorMap.textMuted}`}
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
                          onClick={() => state.setNewRewardDuration(d.value)}
                          className={`px-2 py-2 text-xs font-bold rounded-lg transition-colors ${
                            state.newRewardDuration === d.value
                              ? "bg-purple-600 text-white"
                              : state.isDark
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

                  {state.rewards.map((r, i) => (
                    <div key={`reward-${r.id}-${i}`} className="relative group">
                      <button
                        onClick={() => state.claimReward(r)}
                        className={`w-full flex justify-between items-center p-6 rounded-2xl border ${
                          state.points >= r.cost
                            ? `${state.colorMap.card} active:scale-95`
                            : "opacity-40 pointer-events-none"
                        }`}
                      >
                        <div className="text-left">
                          <div
                            className={`font-bold text-lg ${
                              state.isDark ? "text-white" : "text-slate-800"
                            }`}
                          >
                            {r.title}
                          </div>
                          <div className={`text-xs ${state.colorMap.textMuted}`}>
                            Value: {r.duration}m
                          </div>
                        </div>
                        <span className="text-amber-500 font-black">
                          {r.cost} 💎
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          state.setRewards(
                            state.rewards.filter((x) => x.id !== r.id)
                          );
                        }}
                        className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- FLOATING BRAIN DUMP BUTTON --- */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => state.setIsDumpOpen(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-3xl shadow-2xl flex items-center justify-center text-3xl z-40 bg-amber-400 text-zinc-900`}
      >
        <Brain />
      </motion.button>

      <BrainDumpDrawer
        isDumpOpen={state.isDumpOpen}
        closeDumpMenu={state.closeDumpMenu}
        colorMap={state.colorMap}
        overwhelmMode={state.overwhelmMode}
        isDark={state.isDark}
        isVentMode={state.isVentMode}
        triggerVentMode={state.triggerVentMode}
        handleAddDump={state.handleAddDump}
        inputDump={state.inputDump}
        setInputDump={state.setInputDump}
        brainDump={state.brainDump}
        promoteToTask={state.promoteToTask}
        setBrainDump={state.setBrainDump}
        ventTimer={state.ventTimer}
      />

<AnimatePresence>
        {state.focusTask && (
          <FocusTimerModal
            focusTask={state.focusTask}
            isOvertime={state.isOvertime}
            overtimeSeconds={state.overtimeSeconds}
            focusRemainingSeconds={state.focusRemainingSeconds}
            ambientTrack={state.ambientTrack}
            setAmbientTrack={state.setAmbientTrack}
            endFocusSession={state.endFocusSession}
            colorMap={state.colorMap}
            isDark={state.isDark}
            formatTime={state.formatTime}
          />
        )}
      </AnimatePresence>

      <MysteryPrizeModal
        prize={state.mysteryPrize}
        onClaim={() => state.setMysteryPrize(null)}
      />
      <WinLogModal
        isOpen={state.isVaultOpen}
        onClose={() => state.setIsVaultOpen(false)}
        completedTasks={state.completedTasks}
      />
      <AnimatePresence>
        {state.isSettingsOpen && (
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
                  onClick={() => state.setIsSettingsOpen(false)}
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
                        onClick={() => state.setTheme(t)}
                        className={`py-3 px-2 text-sm font-bold rounded-xl capitalize transition-colors flex items-center justify-center gap-2 ${
                          state.theme === t
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
                    onClick={() => state.setSoundEnabled(!state.soundEnabled)}
                    className="w-full mt-2 p-6 rounded-3xl text-left border-2 font-bold bg-slate-50 border-slate-200 dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    {state.soundEnabled ? "🔊 Sounds On" : "🔇 Sounds Muted"}
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
