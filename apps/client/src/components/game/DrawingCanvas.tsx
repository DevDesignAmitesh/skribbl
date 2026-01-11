import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Eraser, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

export const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

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

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoordinates(e);
    lastPosRef.current = pos;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosRef.current) return;

    const ctx = getContext();
    if (!ctx) return;

    const pos = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : currentColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastPosRef.current = pos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
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
