import { useRestContext } from "@/context/rest";
import { ChatPanel } from "../game/ChatPanel";
import { DrawArea } from "./DrawArea";
import { LivePlayers } from "./LivePlayers";
import { RoomArea } from "./RoomArea";
import { useWsContext } from "@/context/ws";
import { WordSelection } from "../game/WordSelection";
import Image from "next/image";
import { characters } from "@/lib/lib";
import { GameSummary } from "../game/GameSummary";
import Sound from "react-sound";

export const MainArea = () => {
  const { view, chooseType, room, chooser, messages, player } =
    useRestContext();
  const { sendGuessedWord, handleSendMessage } = useWsContext();

  const isMember = player?.type === "member";

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
          <div className="w-full h-full bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 text-white text-center">
              <p className="text-2xl md:text-3xl font-semibold">
                {chooser?.name} is choosing a word...
              </p>

              <Image
                src={characters[chooser?.character ?? 0]}
                alt="chooser avatar"
                width={120}
                height={120}
                className="w-28 md:w-32 h-auto"
                loading="eager"
              />
            </div>
          </div>
        ) : // TODO: if view is wating then we can show the admin while creating room (optional)
        view === "create-room" ? (
          <RoomArea />
        ) : view === "summary" ? (
          <>
            <GameSummary
              players={room.users}
              redirectTime={10}
              onRestart={() =>
                window.location.replace(process.env.NEXT_PUBLIC_FRONTEND_URL!)
              }
            />
            <Sound url="/gameover.mp3" playStatus="PLAYING" />
          </>
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
