import { DrawArea } from "./DrawArea";
import { LivePlayers } from "./LivePlayers";
import { RoomArea } from "./RoomArea";

export const MainArea = () => {
  return (
    <div
      className="w-full grid gap-2 mt-2
      grid-rows-[auto_auto]
      lg:grid-rows-none lg:grid-cols-[2fr_7fr_3fr]"
    >
      {/* Center (top on small, middle on lg) */}
      <div className="h-auto row-start-1 lg:col-start-2">
        {/* <DrawArea /> */}
        <RoomArea />
      </div>

      {/* Bottom row on small */}
      <div className="grid grid-cols-2 gap-6 row-start-2 lg:contents">
        <div className="h-96 overflow-y-auto">
          <LivePlayers />
        </div>
        <div className="h-80 bg-red-300">Right</div>
      </div>
    </div>
  );
};
