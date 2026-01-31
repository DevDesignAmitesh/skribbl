import React, { RefObject, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Eraser, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { tool } from "./types";
import { GameHeader } from "./GameHeader";

interface DrawingCanvasProps {
  tool: tool;
  setTool: React.Dispatch<React.SetStateAction<tool>>;
  clearCanvas: () => void;
  setCurrentColor: React.Dispatch<React.SetStateAction<string>>;
  currentColor: string;
  isChooser: boolean;
  strokeWidth: number;
  totalLength: number[];
  setStrokeWidth: React.Dispatch<React.SetStateAction<number>>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  startDrawing: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  currentRound: number;
  totalRounds: number;
  roundEndsAt: number;
  onTimeUp: () => void;
}

export const DrawingCanvas = ({
  canvasRef,
  clearCanvas,
  isChooser,
  currentColor,
  draw,
  setCurrentColor,
  setStrokeWidth,
  setTool,
  startDrawing,
  stopDrawing,
  strokeWidth,
  tool,
  totalLength,
  currentRound,
  roundEndsAt,
  onTimeUp,
  totalRounds,
}: DrawingCanvasProps) => {
  const colors = [
    "#000000", // Black
    "#FFFFFF", // White
    "#EF4444", // Red
    "#F97316", // Orange
    "#EAB308", // Yellow
    "#22C55E", // Green
    "#3B82F6", // Blue
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#78716C", // Brown
  ];

  const strokeWidths = [
    { value: 2, label: "Thin" },
    { value: 6, label: "Medium" },
    { value: 12, label: "Thick" },
  ];

  // for setting canvas details
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;

    // Fill with white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col gap-3 p-3">
      {/* Game Header */}
      <GameHeader
        currentRound={currentRound}
        totalRounds={totalRounds}
        totalLength={totalLength}
        roundEndsAt={roundEndsAt}
        onTimeUp={onTimeUp}
      />

      {/* Canvas Container */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-lg overflow-hidden">
        {/* Toolbar */}
        {isChooser && (
          <div className="p-3 border-b border-border flex items-center gap-4 flex-wrap">
            {/* Tools */}
            <div className="flex gap-1">
              <Button
                variant={tool === "pencil" ? "default" : "outline"}
                size="icon"
                onClick={() => setTool("pencil")}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant={tool === "eraser" ? "default" : "outline"}
                size="icon"
                onClick={() => setTool("eraser")}
              >
                <Eraser className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={clearCanvas}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Colors */}
            <div className="flex gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setCurrentColor(color);
                    setTool("pencil");
                  }}
                  className={cn(
                    "w-6 h-6 rounded border-2 transition-all",
                    currentColor === color && tool === "pencil"
                      ? "border-foreground scale-110"
                      : "border-border hover:scale-105",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Stroke Width */}
            <div className="flex gap-1">
              {strokeWidths.map((sw) => (
                <Button
                  key={sw.value}
                  variant={strokeWidth === sw.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStrokeWidth(sw.value)}
                >
                  {sw.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center bg-muted">
          <canvas
            ref={canvasRef}
            className={`bg-white rounded border border-border ${isChooser ? "cursor-crosshair" : "cursor-not-allowed"} w-full h-full`}
            onMouseDown={isChooser ? startDrawing : () => {}}
            onMouseMove={isChooser ? draw : () => {}}
            onMouseUp={isChooser ? stopDrawing : () => {}}
            onMouseLeave={isChooser ? stopDrawing : () => {}}
          />
        </div>
      </div>
    </div>
  );
};
