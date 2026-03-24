"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import type { Task } from "../../types";

type Properties = {
  tasks: Task[];
  isDark: boolean;
};

/// CalendarTab component displays tasks in a calendar format with month, week, and day views
/// inputs:
/// - tasks: An array of task objects, each containing text, duration, id, and date.
/// - isDark: A boolean indicating whether the dark theme is active.
/// example usage:
/// <CalendarTab tasks={[{ text: "Task 1", duration: 30, id: "1", date: "2024-06-01" }]} isDark={false} />

export default function CalendarTab({ tasks, isDark }: Properties) {
  const [viewDate, setViewDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">("month");

  // to do: consider moving styles to global definitions for consistency between views
  const textMuted = isDark ? "text-zinc-500" : "text-slate-400";
  const textMain = isDark ? "text-zinc-100" : "text-slate-900";
  const card = isDark ? "bg-zinc-900 border-zinc-800 shadow-xl" : "bg-white border-slate-200 shadow-sm";

  const navigate = (direction: 1 | -1) => {
    const d = new Date(viewDate);
    if (calendarView === "month") d.setMonth(d.getMonth() + direction);
    else if (calendarView === "week") d.setDate(d.getDate() + direction * 7);
    else d.setDate(d.getDate() + direction);
    setViewDate(d);
  };

  const renderMonthView = () => {
    const year = viewDate.getFullYear(), month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-12" />);
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dt = tasks.filter(x => x.date === ds);
      const isToday = new Date().toISOString().split("T")[0] === ds;
      days.push(
        <button
          key={`day-${d}`}
          onClick={() => { setViewDate(new Date(ds)); setCalendarView("day"); }}
          className={`h-12 border ${isDark ? "border-zinc-800" : "border-slate-100"} flex flex-col items-center p-1 rounded-lg transition-colors hover:bg-emerald-500/10`}
        >
          <span className={`text-[9px] font-bold ${isToday ? "bg-emerald-500 text-white rounded-full w-4 h-4 flex items-center justify-center" : textMuted}`}>{d}</span>
          <div className="flex gap-0.5 mt-1">
            {dt.slice(0, 3).map((_, i) => <div key={`dot-${d}-${i}`} className="w-1 h-1 rounded-full bg-emerald-400" />)}
          </div>
        </button>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={`head-${d}-${i}`} className="text-center py-2 text-[9px] font-black opacity-30">{d}</div>
        ))}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    const sow = new Date(viewDate);
    sow.setDate(viewDate.getDate() - viewDate.getDay());

    return (
      <div className="grid grid-cols-1 gap-2 animate-in slide-in-from-right-4">
        {Array.from({ length: 7 }, (_, i) => {
          const d = new Date(sow);
          d.setDate(sow.getDate() + i);
          const ds = d.toISOString().split("T")[0];
          const dt = tasks.filter(x => x.date === ds);
          const isToday = new Date().toISOString().split("T")[0] === ds;
          return (
            <button
              key={`week-${i}`}
              onClick={() => { setViewDate(d); setCalendarView("day"); }}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-1 transition-all ${isToday ? "bg-emerald-500/10 border-emerald-500" : card}`}
            >
              <span className="text-[10px] font-black opacity-40 uppercase">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}
              </span>
              <span className={`text-xl font-bold ${isToday ? "text-emerald-500" : textMain}`}>{d.getDate()}</span>
              <span className="text-[10px] font-bold text-amber-500">{dt.length} tasks</span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const ds = viewDate.toISOString().split("T")[0];
    const dt = tasks.filter(x => x.date === ds);
    return (
      <div className="animate-in zoom-in-95 duration-300">
        <div className={`p-8 rounded-[40px] text-center mb-6 border ${card}`}>
          <p className="text-xs font-black uppercase opacity-40 mb-1">
            {viewDate.toLocaleDateString("default", { weekday: "long" })}
          </p>
          <h3 className="text-4xl font-black">{viewDate.getDate()}</h3>
          <p className="text-sm opacity-60">
            {viewDate.toLocaleDateString("default", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="space-y-3">
          {dt.length === 0
            ? <p className="text-center py-10 opacity-40 italic">No tasks today.</p>
            : dt.map(t => (
              <div key={t.id} className={`p-5 rounded-2xl border flex justify-between items-center ${card}`}>
                <span className="font-bold text-sm">{t.text}</span>
                <span className="text-[10px] opacity-40 font-bold">{t.duration || 5}m</span>
              </div>
            ))
          }
        </div>
      </div>
    );
  };

  return (
    <motion.div key="calendar-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 pt-4">
      <div className={`flex p-1 rounded-2xl ${isDark ? "bg-zinc-900" : "bg-slate-200"}`}>
        {(["month", "week", "day"] as const).map(v => (
          <button
            key={`cal-toggle-${v}`}
            onClick={() => setCalendarView(v)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${calendarView === v ? (isDark ? "bg-zinc-800 text-emerald-400 shadow-sm" : "bg-white text-emerald-600 shadow-sm") : "opacity-40"}`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-2xl font-black capitalize">
          {calendarView === "month" && viewDate.toLocaleString("default", { month: "long", year: "numeric" })}
          {calendarView === "week" && `Week of ${viewDate.getDate()}`}
          {calendarView === "day" && viewDate.toLocaleDateString("default", { month: "short", day: "numeric" })}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className={`p-2 rounded-lg border ${card}`}><ArrowLeft size={16} /></button>
          <button onClick={() => navigate(1)} className={`p-2 rounded-lg border ${card}`}><ArrowRight size={16} /></button>
        </div>
      </div>

      {calendarView === "month" && renderMonthView()}
      {calendarView === "week" && renderWeekView()}
      {calendarView === "day" && renderDayView()}
    </motion.div>
  );
}
