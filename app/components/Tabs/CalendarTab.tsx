import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Task } from "../../types";

interface CalendarTabProps {
  isDark: boolean;
  colorMap: Record<string, string>;
  calendarView: "month" | "week" | "day";
  setCalendarView: (view: "month" | "week" | "day") => void;
  viewDate: Date;
  setViewDate: (date: Date) => void;
  tasks: Task[];
}

export default function CalendarTab({
  isDark,
  colorMap,
  calendarView,
  setCalendarView,
  viewDate,
  setViewDate,
  tasks,
}: CalendarTabProps) {
  const renderMonthView = () => {
    const year = viewDate.getFullYear(),
      month = viewDate.getMonth(),
      days = [],
      daysInMonth = new Date(year, month + 1, 0).getDate(),
      firstDay = new Date(year, month, 1).getDay();
    for (let i = 0; i < firstDay; i++)
      days.push(<div key={`empty-${i}`} className="h-12" />);
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`,
        dt = tasks.filter((x) => x.date === ds),
        isToday = new Date().toISOString().split("T")[0] === ds;
      days.push(
        <button
          key={`day-${d}`}
          onClick={() => {
            setViewDate(new Date(ds));
            setCalendarView("day");
          }}
          className={`h-12 border ${
            isDark ? "border-zinc-800" : "border-slate-100"
          } flex flex-col items-center p-1 rounded-lg transition-colors hover:bg-emerald-500/10`}
        >
          <span
            className={`text-[9px] font-bold ${
              isToday
                ? "bg-emerald-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                : colorMap.textMuted
            }`}
          >
            {d}
          </span>
          <div className="flex gap-0.5 mt-1">
            {dt.slice(0, 3).map((_, i) => (
              <div
                key={`dot-${d}-${i}`}
                className="w-1 h-1 rounded-full bg-emerald-400"
              />
            ))}
          </div>
        </button>
      );
    }
    return (
      <div className={`grid grid-cols-7 gap-1`}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={`head-${d}-${i}`}
            className={`text-center py-2 text-[9px] font-black opacity-30`}
          >
            {d}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    const sow = new Date(viewDate);
    sow.setDate(viewDate.getDate() - viewDate.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sow);
      d.setDate(sow.getDate() + i);
      const ds = d.toISOString().split("T")[0],
        dt = tasks.filter((x) => x.date === ds),
        isT = new Date().toISOString().split("T")[0] === ds;
      days.push(
        <button
          key={`week-${i}`}
          onClick={() => {
            setViewDate(d);
            setCalendarView("day");
          }}
          className={`p-4 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
            isT ? "bg-emerald-500/10 border-emerald-500" : colorMap.card
          }`}
        >
          <span className="text-[10px] font-black opacity-40 uppercase">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}
          </span>
          <span
            className={`text-xl font-bold ${
              isT ? "text-emerald-500" : colorMap.textMain
            }`}
          >
            {d.getDate()}
          </span>
          <span className="text-[10px] font-bold text-amber-500">
            {dt.length} tasks
          </span>
        </button>
      );
    }
    return (
      <div className="grid grid-cols-1 gap-2 animate-in slide-in-from-right-4">
        {days}
      </div>
    );
  };

  const renderDayView = () => {
    const ds = viewDate.toISOString().split("T")[0],
      dt = tasks.filter((x) => x.date === ds);
    return (
      <div className="animate-in zoom-in-95 duration-300">
        <div
          className={`p-8 rounded-[40px] text-center mb-6 ${colorMap.card}`}
        >
          <p className="text-xs font-black uppercase opacity-40 mb-1">
            {viewDate.toLocaleDateString("default", { weekday: "long" })}
          </p>
          <h3 className="text-4xl font-black">{viewDate.getDate()}</h3>
          <p className="text-sm opacity-60">
            {viewDate.toLocaleDateString("default", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="space-y-3">
          {dt.length === 0 ? (
            <p className="text-center py-10 opacity-40 italic">
              No tasks today.
            </p>
          ) : (
            dt.map((t) => (
              <div
                key={t.id}
                className={`p-5 rounded-2xl flex justify-between items-center ${colorMap.card}`}
              >
                <span className="font-bold text-sm">{t.text}</span>
                <span className="text-[10px] opacity-40 font-bold">
                  {t.duration || 5}m
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pt-4">
      <div
        className={`flex p-1 rounded-2xl ${
          isDark ? "bg-zinc-900" : "bg-slate-200"
        }`}
      >
        {(["month", "week", "day"] as const).map((v) => (
          <button
            key={`cal-toggle-${v}`}
            onClick={() => setCalendarView(v)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
              calendarView === v
                ? isDark
                  ? "bg-zinc-800 text-emerald-400 shadow-sm"
                  : "bg-white text-emerald-600 shadow-sm"
                : "opacity-40"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-2xl font-black capitalize">
          {calendarView === "month" &&
            viewDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          {calendarView === "week" && `Week of ${viewDate.getDate()}`}
          {calendarView === "day" &&
            viewDate.toLocaleDateString("default", {
              month: "short",
              day: "numeric",
            })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const d = new Date(viewDate);
              if (calendarView === "month") d.setMonth(d.getMonth() - 1);
              else if (calendarView === "week") d.setDate(d.getDate() - 7);
              else d.setDate(d.getDate() - 1);
              setViewDate(d);
            }}
            className={`p-2 rounded-lg ${colorMap.card}`}
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={() => {
              const d = new Date(viewDate);
              if (calendarView === "month") d.setMonth(d.getMonth() + 1);
              else if (calendarView === "week") d.setDate(d.getDate() + 7);
              else d.setDate(d.getDate() + 1);
              setViewDate(d);
            }}
            className={`p-2 rounded-lg ${colorMap.card}`}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      {calendarView === "month" && renderMonthView()}
      {calendarView === "week" && renderWeekView()}
      {calendarView === "day" && renderDayView()}
    </div>
  );
}
