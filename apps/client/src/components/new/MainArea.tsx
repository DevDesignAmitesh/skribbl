import { useRestContext } from "@/context/rest";
import { ChatPanel } from "../game/ChatPanel";
import { DrawArea } from "./DrawArea";
import { LivePlayers } from "./LivePlayers";
import { RoomArea } from "./RoomArea";
import { useWsContext } from "@/context/ws";
import { WordSelection } from "../game/WordSelection";

export const MainArea = () => {
  const { view, chooseType, room, chooseMessage, messages, player } =
    useRestContext();
  const { sendGuessedWord, handleSendMessage } = useWsContext();

  const isMember = player?.type === "member";

  console.log("player ", player);
  console.log("isMember ", isMember);
  console.log("messages ", messages);

  return (
    <div
      className="w-full grid gap-2 mt-2
      grid-rows-[auto_auto]
      lg:grid-rows-none lg:grid-cols-[2fr_7fr_3fr]"
    >
      {/* Center (top on small, middle on lg) */}
      <div className="h-auto row-start-1 lg:col-start-2">
        {chooseType === "chooser" ? (
          <WordSelection
            words={room?.room?.custom_word ?? []}
            onSelectWord={sendGuessedWord}
          />
        ) : chooseType === "choosing" ? (
          <div className="bg-card border border-border text-foreground rounded-lg h-full w-full flex justify-center items-center">
            {chooseMessage}
          </div>
        ) : // TODO: if view is wating then we can show the admin while creating room (optional)
        view === "create-room" ? (
          <RoomArea />
        ) : view === "waiting" && isMember ? (
          <div className="bg-card text-muted-foreground rounded-lg h-full w-full flex justify-center items-center">
            waiting for the admin to start the game
          </div>
        ) : (
          <DrawArea />
        )}
      </div>

      {/* Bottom row on small */}
      <div className="grid grid-cols-2 gap-2 row-start-2 lg:contents">
        <div className="h-96 overflow-y-auto">
          <LivePlayers />
        </div>
        <div className="h-96 overflow-y-auto">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            currentPlayerId={player.id}
          />
        </div>
      </div>
    </div>
  );
};
