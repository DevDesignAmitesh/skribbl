// TODO: we can added messages from server if some one joins/left or room is terminated and etc

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
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [tool, setTool] = useState<tool>("pencil");
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const createRoom = () => {
    if (!player.name.trim()) {
      alert("Enter your name");
      return;
    }
    setView("create-room");
  };

  const handleSendMessage = (message: string) => {
    ws?.send(
      JSON.stringify({
        type: MESSAGE_TYPE.GUESS_WORD,
        data: {
          roomId: roomId ?? roomSettings.id ?? room.room?.id,
          word: message,
          userId: player.id,
        },
      }),
    );
  };

  const handleCreateRoom = () => {
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
    if (!ws) return;

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
    if (!ws || !word.trim()) {
      alert("Choose word first");
      return;
    }

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.CHOOSEN_WORD,
        data: {
          roomId: roomId ?? roomSettings.id,
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
          roomId: roomId ?? roomSettings.id ?? room.room?.id,
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
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleCustomWords = (words: string) => {
    const arr = words.split(", ");
    setRoomSettings((prev) => ({ ...prev, custom_word: arr }));
  };

  const handleBack = () => {
    setView("landing");
    // TODO: we should send message back to server for deleting the room
    // when the room will be deleting, the users will be also get notified and we can setView("landing")
  };

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

      console.log("receved data", parsedData);

      if (parsedData.type === MESSAGE_TYPE.CREATE_ROOM) {
        const { room, roomUrl } = parsedData.data;

        setRoom(room);
        setRoomUrl(roomUrl);
      }

      if (parsedData.type === MESSAGE_TYPE.JOIN_ROOM) {
        const { room } = parsedData.data;
        setRoom(room);
      }

      if (parsedData.type === MESSAGE_TYPE.JOIN_RANDOM) {
        const { room } = parsedData.data;
        setRoom(room);
      }

      if (parsedData.type === MESSAGE_TYPE.YOU_ARE_CHOOSER) {
        const { room } = parsedData.data;
        setRoom(room);
      }

      if (parsedData.type === MESSAGE_TYPE.SOMEONE_CHOOSING) {
        const { room, message } = parsedData.data;
        setRoom(room);
        setChooseMessage(message);
      }

      if (parsedData.type === MESSAGE_TYPE.CHOOSEN_WORD) {
        // string[]
        const { totalLength } = parsedData.data;
        setChooseType(null);
        setTotalLength(totalLength);
      }

      if (parsedData.type === MESSAGE_TYPE.MESSAGE) {
        const { message, from, room } = parsedData.data;
        if (room) {
          setRoom(room);
        }
        if (view === "landing") {
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
    };
  }, [ws, view]);

  useEffect(() => {
    console.log("room", room);
    const user = room.users.find((usr) => usr.id === player.id);
    if (!user) return;

    if (user.type === "member") {
      if (room?.room?.status === "creating") {
        setView("waiting");
      } else if (room?.room?.status === "ongoing") {
        setView("share-room");
      }
    } else if (user.type === "admin") {
      if (room?.room?.status === "ongoing") {
        setView("share-room");
      }
    }

    if (user.status === "chooser") {
      setView("share-room");
      setChooseType("chooser");
    } else if (user.status === "guesser") {
      setView("share-room");
      setChooseType("choosing");
    }

    setPlayer((prev) => ({
      ...prev,
      type: user.type,
      status: user.status,
    }));
  }, [room]);

  useEffect(() => {
    if (totalLength.length === 0) return;
    setView("share-room");
  }, [totalLength]);

  const isAdmin = player?.type === "admin";
  const isMember = player?.type === "member";
  const isChooser = player?.status === "chooser";

  if (!ws) {
    return <div>Connecting to server....</div>;
  }

  if (chooseType === "chooser") {
    console.log("chooser screen is running");
    return (
      <WordSelection
        words={room?.room?.custom_word ?? []}
        onSelectWord={sendGuessedWord}
      />
    );
  }

  if (chooseType === "choosing") {
    console.log("choosing screen is running");
    return (
      <div className="z-100 inset-0 bg-card border border-border text-foreground rounded-lg h-screen flex justify-center items-center">
        {chooseMessage}
      </div>
    );
  }

  // Landing page
  if (view === "landing") {
    console.log("landing screen is running");
    return (
      <LandingPage
        player={player}
        language={language}
        setLanguage={setLanguage}
        setPlayer={setPlayer}
        roomId={roomId}
        ws={ws}
        createRoom={createRoom}
      />
    );
  } else if (view === "waiting" && isMember) {
    // TODO: we can show the preview of room setting instead of this blank screen
    // it is easy to add just pass this condition => currentPlayer && currentPlayer.type === "admin"
    // and render the inputs disability accordingly ( you know this.... )
    console.log("waiting screen is running");
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
    console.log("create room screen is running");
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
            handleCustomWords={handleCustomWords}
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
    console.log("share room screen is running");
    return (
      <RoomLayout
        players={room.users}
        messages={messages}
        onSendMessage={handleSendMessage}
        currentPlayerId={player.id}
        centerContent={
          <DrawingCanvas
            isChooser={isChooser}
            currentRound={room.room?.latest_round ?? 0}
            drawTime={room.room?.draw_time ?? 0}
            onTimeUp={handleStartGame}
            totalRounds={room.room?.rounds ?? 0}
            // totalLength={[4, 5]}
            totalLength={totalLength}
            canvasRef={canvasRef}
            clearCanvas={clearCanvas}
            colors={colors}
            currentColor={currentColor}
            draw={draw}
            setCurrentColor={setCurrentColor}
            setStrokeWidth={setStrokeWidth}
            setTool={setTool}
            startDrawing={startDrawing}
            stopDrawing={stopDrawing}
            strokeWidth={strokeWidth}
            strokeWidths={strokeWidths}
            tool={tool}
          />
        }
      />
    );
  }
};
