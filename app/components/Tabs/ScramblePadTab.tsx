"use client";
import { useRef, useState, useEffect } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { motion } from "framer-motion";
import { PenTool, Eraser, Flame, MessageSquare } from "lucide-react";
import UnstuckerChat from "./UnstuckerChat";

interface ScramblePadTabProps {
  isDark: boolean;
  colorMap: any;
}

export default function ScramblePadTab({ isDark, colorMap }: ScramblePadTabProps) {
  // --- STATE ---
  const [activeView, setActiveView] = useState<"draw" | "chat">("draw");
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [activeTool, setActiveTool] = useState<"pen" | "eraser">("pen");
  
  const defaultColor = isDark ? "#ffffff" : "#18181b";
  const [penColor, setPenColor] = useState(defaultColor);

  useEffect(() => {
    if (penColor === "#ffffff" || penColor === "#18181b") {
      setPenColor(isDark ? "#ffffff" : "#18181b");
    }
  }, [isDark]);

  const colorPalette = [
    defaultColor, "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#a855f7",
  ];

  // --- HANDLERS ---
  const handleToolChange = (tool: "pen" | "eraser") => {
    setActiveTool(tool);
    if (!canvasRef.current) return;
    canvasRef.current.eraseMode(tool === "eraser");
  };

  const handleIncinerate = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
      const audio = new Audio("/sounds/bubble_pop.mp3");
      audio.play().catch(() => {});
    }
  };

  const dotGrid = isDark
    ? "radial-gradient(#3f3f46 1px, transparent 0)"
    : "radial-gradient(#cbd5e1 1px, transparent 0)";

  return (
    <div className="space-y-4 pt-4 flex flex-col h-[70vh]">
      
      {/* --- THE TOGGLE SWITCH --- */}
      <div className={`flex p-1 rounded-2xl mx-auto w-full max-w-xs ${isDark ? 'bg-zinc-900' : 'bg-slate-200/50'}`}>
        <button
          onClick={() => setActiveView("draw")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeView === "draw"
              ? "bg-white dark:bg-zinc-800 shadow-sm text-emerald-500 dark:text-emerald-400"
              : colorMap.textMuted + " hover:text-emerald-500/70"
          }`}
        >
          <PenTool size={16} />
          <span>Draw</span>
        </button>
        <button
          onClick={() => setActiveView("chat")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeView === "chat"
              ? "bg-white dark:bg-zinc-800 shadow-sm text-purple-500 dark:text-purple-400"
              : colorMap.textMuted + " hover:text-purple-500/70"
          }`}
        >
          <MessageSquare size={16} />
          <span>Unstucker</span>
        </button>
      </div>

      {/* ========================================= */}
      {/* VIEW 1: THE DRAWING PAD (Hidden if not active) */}
      {/* ========================================= */}
      <div className={`flex-1 flex-col gap-4 ${activeView === "draw" ? "flex" : "hidden"}`}>
        <div className={`p-4 rounded-[32px] flex flex-col gap-4 shadow-sm shrink-0 ${colorMap.card}`}>
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-2">
              <button
                onClick={() => handleToolChange("pen")}
                className={`p-3 rounded-2xl transition-all ${
                  activeTool === "pen"
                    ? "bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md scale-105"
                    : `${colorMap.textMuted} hover:bg-zinc-100 dark:hover:bg-zinc-800`
                }`}
              >
                <PenTool size={20} />
              </button>
              <button
                onClick={() => handleToolChange("eraser")}
                className={`p-3 rounded-2xl transition-all ${
                  activeTool === "eraser"
                    ? "bg-blue-500 text-white shadow-md scale-105"
                    : `text-blue-400/50 hover:bg-blue-50 dark:hover:bg-blue-500/10`
                }`}
              >
                <Eraser size={20} />
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleIncinerate}
              className="px-4 py-3 rounded-2xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors flex items-center gap-2 font-bold"
            >
              <Flame size={18} />
              <span className="hidden sm:inline">Incinerate</span>
            </motion.button>
          </div>

          <div className="flex justify-between items-center w-full px-1">
            {colorPalette.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setPenColor(color);
                  handleToolChange("pen");
                }}
                className={`w-8 h-8 rounded-full transition-transform ${
                  penColor === color && activeTool === "pen"
                    ? "scale-125 ring-2 ring-offset-2 ring-offset-transparent ring-zinc-400 dark:ring-zinc-500"
                    : "hover:scale-110"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className={`flex-1 w-full rounded-[32px] overflow-hidden border-2 shadow-inner ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <ReactSketchCanvas
            ref={canvasRef}
            strokeWidth={activeTool === "eraser" ? 25 : 4}
            strokeColor={penColor}
            canvasColor="transparent"
            style={{
              backgroundImage: dotGrid,
              backgroundSize: "24px 24px",
              backgroundColor: isDark ? "#18181b" : "#f8fafc"
            }}
          />
        </div>
      </div>

      {/* ========================================= */}
      {/* VIEW 2: THE UNSTUCKER CHAT (Hidden if not active) */}
      {/* ========================================= */}
      <div className={`flex-1 flex-col h-full ${activeView === "chat" ? "flex" : "hidden"}`}>
        <UnstuckerChat isDark={isDark} colorMap={colorMap} />
      </div>

    </div>
  );
}