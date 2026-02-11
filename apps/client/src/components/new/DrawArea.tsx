import { useRestContext } from "@/context/rest";
import { useWsContext } from "@/context/ws";
import { Button } from "../ui/button";
import { Eraser, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { colors, strokeWidths } from "@/lib/lib";
import { useEffect } from "react";

export const DrawArea = () => {
  const {
    canvasRef,
    player,
    startDrawing,
    stopDrawing,
    tool,
    setTool,
    currentColor,
    setCurrentColor,
    strokeWidth,
    setStrokeWidth,
  } = useRestContext();
  const { draw, clearCanvas } = useWsContext();

  const isChooser = player.status === "chooser";

  // for setting canvas details
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    // canvas.width = 600;
    // canvas.height = 400;

    // Fill with white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <canvas
        ref={canvasRef}
        className={`${isChooser ? "cursor-crosshair" : "cursor-not-allowed"} w-full h-full`}
        onMouseDown={isChooser ? startDrawing : () => {}}
        onMouseMove={isChooser ? draw : () => {}}
        onMouseUp={isChooser ? stopDrawing : () => {}}
        onMouseLeave={isChooser ? stopDrawing : () => {}}
      />
      {/* Toolbar */}
      {isChooser && (
        <div className="p-3 flex w-full items-center justify-between flex-wrap">
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
    </div>
  );
};
