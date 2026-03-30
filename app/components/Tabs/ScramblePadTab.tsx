"use client";
import { useRef, useState, useEffect } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { motion } from "framer-motion";
import { PenTool, Eraser, Flame } from "lucide-react";

interface ScramblePadTabProps {
  isDark: boolean;
  colorMap: any;
}

export default function ScramblePadTab({ isDark, colorMap }: ScramblePadTabProps) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [activeTool, setActiveTool] = useState<"pen" | "eraser">("pen");
  
  // Set default color based on light/dark mode
  const defaultColor = isDark ? "#ffffff" : "#18181b";
  const [penColor, setPenColor] = useState(defaultColor);

  // Update default color if theme changes while tab is open
  useEffect(() => {
    if (penColor === "#ffffff" || penColor === "#18181b") {
      setPenColor(isDark ? "#ffffff" : "#18181b");
    }
  }, [isDark]);

  // A curated, vibrant palette so she isn't overwhelmed with choices
  const colorPalette = [
    defaultColor, // Standard
    "#ef4444", // Red
    "#f59e0b", // Amber
    "#10b981", // Emerald
    "#3b82f6", // Blue
    "#a855f7", // Purple
  ];

  const handleToolChange = (tool: "pen" | "eraser") => {
    setActiveTool(tool);
    if (!canvasRef.current) return;
    canvasRef.current.eraseMode(tool === "eraser");
  };

  const handleIncinerate = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
      const audio = new Audio("/sounds/burn.mp3");
      audio.play().catch(() => {});
    }
  };

  const dotGrid = isDark
    ? "radial-gradient(#3f3f46 1px, transparent 0)"
    : "radial-gradient(#cbd5e1 1px, transparent 0)";

  return (
    <div className="space-y-4 pt-4 flex flex-col h-[60vh]">
      <div className={`p-4 rounded-[32px] flex flex-col gap-4 shadow-sm ${colorMap.card}`}>
        
        {/* Top Row: Tools & Incinerate */}
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

        {/* Bottom Row: Color Palette */}
        <div className="flex justify-between items-center w-full px-1">
          {colorPalette.map((color) => (
            <button
              key={color}
              onClick={() => {
                setPenColor(color);
                handleToolChange("pen"); // Auto-switch back to pen if they select a color while erasing
              }}
              className={`w-8 h-8 rounded-full transition-transform ${
                penColor === color && activeTool === "pen"
                  ? "scale-125 ring-2 ring-offset-2 ring-offset-transparent ring-zinc-400 dark:ring-zinc-500"
                  : "hover:scale-110"
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      {/* The Canvas */}
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
      
      <p className={`text-center text-xs font-bold opacity-50 ${colorMap.textMuted}`}>
        Everything here vanishes when you close the app.
      </p>
    </div>
  );
}