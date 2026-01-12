import React, { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Eraser, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { tool } from "./types";

interface DrawingCanvasProps {
  tool: tool;
  setTool: React.Dispatch<React.SetStateAction<tool>>;
  clearCanvas: () => void;
  colors: string[];
  strokeWidths: { value: number; label: string }[];
  setCurrentColor: React.Dispatch<React.SetStateAction<string>>;
  currentColor: string;
  strokeWidth: number;
  totalLength: number[];
  setStrokeWidth: React.Dispatch<React.SetStateAction<number>>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  startDrawing: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export const DrawingCanvas = ({
  canvasRef,
  clearCanvas,
  colors,
  currentColor,
  draw,
  setCurrentColor,
  setStrokeWidth,
  setTool,
  startDrawing,
  stopDrawing,
  strokeWidth,
  strokeWidths,
  tool,
  totalLength,
}: DrawingCanvasProps) => {
  console.log("totalLength", totalLength);
  return (
    <div className="relative bg-card border border-border rounded-lg h-full flex flex-col">
      <div className="absolute top-20 left-0 right-0  text-xl text-black w-50">
        {totalLength.map((nm, groupIdx) => {
          const arr = Array.from({ length: nm });

          return (
            <div key={groupIdx} className="inline-block mr-4">
              {arr.map((_, idx) => (
                <span key={idx} className="mr-1">
                  _
                </span>
              ))}
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
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
                  : "border-border hover:scale-105"
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

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-4 bg-muted">
        <canvas
          ref={canvasRef}
          className="bg-white rounded border border-border cursor-crosshair max-w-full"
          style={{ width: 600, height: 400 }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
};
