"use client";

import { useEffect, useRef, useState } from "react";
import { LandingPage } from "@/components/game/LandingPage";
import { RoomLayout } from "@/components/game/RoomLayout";
import { RoomSettings } from "@/components/game/RoomSettings";
import { DrawingCanvas } from "@/components/game/DrawingCanvas";
import {
  ViewState,
  ChatMessage,
  Player,
  tool,
  chooseState,
} from "@/components/game/types";
import { MESSAGE_TYPE, Room, type User } from "@repo/common/common";
import { WS_URL } from "@/lib/lib";
import { useSearchParams } from "next/navigation";
import { WordSelection } from "@/components/game/WordSelection";
import { toast } from "sonner";
import { GameSummary } from "@/components/game/GameSummary";

export const Main = () => {
  const params = useSearchParams();
  const roomId = params.get("roomId");

  // used in the landing page
  const [language, setLanguage] = useState("en");
  const [player, setPlayer] = useState<Player>({
    id: crypto.randomUUID(),
    name: "",
    avatarIndex: 2,
  });

  const [view, setView] = useState<ViewState>("landing");
  const viewRef = useRef<ViewState>("landing");
  const [chooseType, setChooseType] = useState<chooseState | null>(null);
  const [chooseMessage, setChooseMessage] = useState<string>("");
  const [totalLength, setTotalLength] = useState<number[]>([]);
  const [room, setRoom] = useState<{ room: Room | null; users: User[] }>({
    room: null,
    users: [],
  });
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomSettings, setRoomSettings] = useState<Room>({
    id: crypto.randomUUID().slice(0, 7),
    players: 2,
    rounds: 2,
    draw_time: 60,
    language: "en",
    custom_word: [],
    status: "creating",
  });

  // getting used in the drawing canvas comp
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [tool, setTool] = useState<tool>("pencil");
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleSetView = (view: ViewState) => {
    setView(view);
    viewRef.current = view;
  };

  const navigateToRoom = () => {
    if (!player.name.trim()) {
      alert("Enter your name");
      return;
    }
    handleSetView("create-room");
  };

  const handleSendMessage = (message: string) => {
    if (!ws) return;

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.GUESS_WORD,
        data: {
          roomId: room.room?.id,
          word: message,
          userId: player.id,
        },
      }),
    );
  };

  const handleCreateRoom = () => {
    if (!ws) return;

    if (roomSettings.custom_word.length <= 3) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          from: "client",
          message: "atleast 3 words should be in customize words",
        },
      ]);

      return;
    }

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.CREATE_ROOM,
        data: {
          ...roomSettings,
          userName: player.name,
          userId: player.id,
          character: player.avatarIndex,
        },
      }),
    );
  };

  const handleStartGame = () => {
    if (!ws) return;

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.START_GAME,
        data: {
          roomId: roomId ?? roomSettings.id,
          userId: player.id,
        },
      }),
    );
  };

  const sendGuessedWord = (word: string) => {
    if (!ws) return;

    if (!word.trim()) {
      alert("Choose word first");
      return;
    }

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.CHOOSEN_WORD,
        data: {
          roomId: room?.room?.id,
          word,
          userId: player.id,
        },
      }),
    );
  };

  const getContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  };

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
    if (!ws) return;

    const pos = getCanvasCoordinates(e);

    const payload = {
      type: "stroke",
      from: lastPosRef.current,
      to: pos,
      color: tool === "eraser" ? "#FFFFFF" : currentColor,
      width: strokeWidth,
      tool,
      name: player.name,
      roomId,
    };

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.DRAWING,
        data: {
          payload,
          roomId: room.room?.id,
          userId: player.id,
        },
      }),
    );
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  const clearCanvas = () => {
    if (!ws) return;

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.CLEAR_CANVAS,
        data: {
          roomId: room.room?.id,
          userId: player.id,
        },
      }),
    );
  };

  const handleBack = () => {
    handleSetView("landing");
    // TODO: we should send message back to server for deleting the room
    // when the room will be deleting, the users will be also get notified and we can handleSetView("landing")
  };

  // handle websocket connection
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    setWs(ws);

    return () => {
      ws.close();
    };
  }, []);

  // handle websocket messages (INCOMING)
  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);

      console.log("recevied data ", parsedData);

      if (parsedData.type === MESSAGE_TYPE.CREATE_ROOM) {
        const { room, roomUrl } = parsedData.data;

        setRoom(room);
        setRoomUrl(roomUrl);
      }

      if (
        parsedData.type === MESSAGE_TYPE.JOIN_ROOM ||
        parsedData.type === MESSAGE_TYPE.JOIN_RANDOM
      ) {
        const { room } = parsedData.data as {
          room: { room: Room; users: User[] };
        };
        setRoom(room);
        const user = room.users.find((usr: User) => usr.id === player.id);
        if (!user) return;
        if (user.type === "admin") return;

        if (room.room.status === "creating") {
          handleSetView("waiting");
        } else if (room.room.status === "ongoing") {
          handleSetView("share-room");
        } else if (room.room.status === "ended") {
          alert("room ended");
          window.location.reload();
        }

        setPlayer((prev) => ({
          ...prev,
          status: user.status,
          type: user.type,
        }));

        // we have to find the user
        // we have to get the room status
        // if status is creating then wating screen else if shared-room
        // have to update the status locally
      }

      if (parsedData.type === MESSAGE_TYPE.YOU_ARE_CHOOSER) {
        const { room } = parsedData.data;
        setRoom(room);
        const user = room.users.find((usr: User) => usr.id === player.id);
        if (!user) return;
        setChooseType("chooser");
        setPlayer((prev) => ({
          ...prev,
          status: user.status,
        }));
      }

      if (parsedData.type === MESSAGE_TYPE.SOMEONE_CHOOSING) {
        const { room, message } = parsedData.data;
        setRoom(room);
        const user = room.users.find((usr: User) => usr.id === player.id);
        if (!user) return;
        setChooseType("choosing");
        setPlayer((prev) => ({
          ...prev,
          status: user.status,
        }));
        setChooseMessage(message);
      }

      if (parsedData.type === MESSAGE_TYPE.CHOOSEN_WORD) {
        // totalLength: number[]
        const { totalLength } = parsedData.data;
        setChooseType(null);
        setTotalLength(totalLength);
        handleSetView("share-room");
      }

      if (parsedData.type === MESSAGE_TYPE.MESSAGE) {
        const { message, from, room } = parsedData.data;
        if (room) {
          setRoom(room);
        }
        if (viewRef.current === "landing") {
          toast.error(from, {
            description: message,
          });
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              message,
              from,
            },
          ]);
        }
      }

      if (parsedData.type === MESSAGE_TYPE.DRAWING) {
        const ctx = getContext();
        if (!ctx) return;
        const { payload } = parsedData.data;
        const { type, from, to, color, width, tool } = payload;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        lastPosRef.current = to;
      }

      if (parsedData.type === MESSAGE_TYPE.CLEAR_CANVAS) {
        const canvas = canvasRef.current;
        const ctx = getContext();
        if (!canvas || !ctx) return;

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (parsedData.type === MESSAGE_TYPE.LEFT) {
        const { message, room, from } = parsedData.data;
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            message,
            from,
          },
        ]);
        setRoom(room);
      }

      if (parsedData.type === MESSAGE_TYPE.GAME_END) {
        const { room } = parsedData.data;
        setRoom(room);
        setView("summary");
      }

      if (parsedData.type === MESSAGE_TYPE.ANOTHER_ONE) {
        handleStartGame();
      }
    };
  }, [ws]);

  // TODO: lets see if we need it or not...
  useEffect(() => {
    console.log("room ", room);
  }, [room]);

  const isAdmin = player?.type === "admin";
  const isMember = player?.type === "member";
  const isChooser = player?.status === "chooser";

  if (!ws) {
    return (
      <div className="z-100 inset-0 bg-card border border-border text-foreground rounded-lg h-screen flex justify-center items-center">
        Connecting to server....
      </div>
    );
  }

  if (chooseType === "chooser") {
    return (
      <WordSelection
        words={room?.room?.custom_word ?? []}
        onSelectWord={sendGuessedWord}
      />
    );
  }

  if (chooseType === "choosing") {
    return (
      <div className="z-100 inset-0 bg-card border border-border text-foreground rounded-lg h-screen flex justify-center items-center">
        {chooseMessage}
      </div>
    );
  }

  // Landing page
  if (view === "landing") {
    return (
      <LandingPage
        player={player}
        language={language}
        setLanguage={setLanguage}
        setPlayer={setPlayer}
        roomId={roomId}
        ws={ws}
        navigateToRoom={navigateToRoom}
      />
    );
  } else if (view === "waiting" && isMember) {
    // TODO: we can show the preview of room setting instead of this blank screen
    // it is easy to add just pass this condition => currentPlayer && currentPlayer.type === "admin"
    // and render the inputs disability accordingly ( you know this.... )
    return (
      <RoomLayout
        players={room.users}
        messages={messages}
        onSendMessage={handleSendMessage}
        currentPlayerId={player.id}
        centerContent={
          <div className="bg-card border border-border text-muted-foreground rounded-lg h-full flex justify-center items-center">
            waiting for the admin to start the game
          </div>
        }
      />
    );
  } else if (view === "create-room" && !isMember) {
    return (
      <RoomLayout
        players={room.users}
        messages={messages}
        onSendMessage={handleSendMessage}
        currentPlayerId={player.id}
        centerContent={
          <RoomSettings
            setMessages={setMessages}
            handleBack={handleBack}
            roomUrl={roomUrl}
            settings={roomSettings}
            onSettingsChange={setRoomSettings}
            onCreateGame={handleCreateRoom}
            onStartGame={handleStartGame}
          />
        }
      />
    );
  } else if (view === "share-room" && player) {
    return (
      <RoomLayout
        players={room.users}
        messages={messages}
        onSendMessage={handleSendMessage}
        currentPlayerId={player.id}
        centerContent={
          <DrawingCanvas
            isChooser={isChooser}
            currentRound={room.room?.latest_round!}
            drawTime={room.room?.draw_time!}
            onTimeUp={handleStartGame}
            totalRounds={room.room?.rounds!}
            // totalLength={[4, 5]}
            totalLength={totalLength}
            canvasRef={canvasRef}
            clearCanvas={clearCanvas}
            currentColor={currentColor}
            draw={draw}
            setCurrentColor={setCurrentColor}
            setStrokeWidth={setStrokeWidth}
            setTool={setTool}
            startDrawing={startDrawing}
            stopDrawing={stopDrawing}
            strokeWidth={strokeWidth}
            tool={tool}
          />
        }
      />
    );
  } else if (view === "summary") {
    return (
      <GameSummary
        players={room.users}
        redirectTime={10}
        onRestart={() => window.location.reload()}
      />
    );
  }
};
