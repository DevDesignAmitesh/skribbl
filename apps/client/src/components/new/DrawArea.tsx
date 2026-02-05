import { useRestContext } from "@/context/rest";
import { useWsContext } from "@/context/ws";

export const DrawArea = () => {
  const { canvasRef, player, startDrawing, stopDrawing } = useRestContext();
  const { draw } = useWsContext();

  const isChooser = player.status === "chooser";

  return (
    <canvas
      ref={canvasRef}
      className={`bg-white rounded border border-border ${isChooser ? "cursor-crosshair" : "cursor-not-allowed"} w-full h-full`}
      onMouseDown={isChooser ? startDrawing : () => {}}
      onMouseMove={isChooser ? draw : () => {}}
      onMouseUp={isChooser ? stopDrawing : () => {}}
      onMouseLeave={isChooser ? stopDrawing : () => {}}
    />
  );
};
