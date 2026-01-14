"use client";

import { useEffect, useRef, useState } from "react";
import { LandingPage } from "@/components/game/LandingPage";
import { RoomLayout } from "@/components/game/RoomLayout";
import { RoomSettings } from "@/components/game/RoomSettings";
import { DrawingCanvas } from "@/components/game/DrawingCanvas";
import {
  ViewState,
  ChatMessage,
  RoomSettings as RoomSettingsType,
  Player,
  tool,
  chooseState,
} from "@/components/game/types";
import { MESSAGE_TYPE, Room, type User } from "@repo/common/common";
import { WS_URL } from "@/lib/lib";
import { useSearchParams } from "next/navigation";
import { WordSelection } from "@/components/game/WordSelection";

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
  const [gussedMessage, setGuessedMessage] = useState<string>("");

  const [totalLength, setTotalLength] = useState<number[]>([]);

  const [room, setRoom] = useState<{ room: Room | null; users: User[] }>({
    room: null,
    users: [],
  });

  const [roomUrl, setRoomUrl] = useState<string | null>(null);

  const [ws, setWs] = useState<WebSocket | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [roomSettings, setRoomSettings] = useState<RoomSettingsType>({
    id: crypto.randomUUID().slice(0, 7),
    players: 2,
    rounds: 2,
    draw_time: 60,
    language: "en",
    custom_word: [],
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
          roomId: roomId ?? roomSettings.id,
          word: message,
          name: player.name,
        },
      })
    );
  };

  const handleCreateRoom = () => {
    if (!ws) return;

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.CREATE_ROOM,
        data: {
          ...roomSettings,
          userName: player.name,
          character: player.avatarIndex,
        },
      })
    );
  };

  const handleStartGame = () => {
    if (!ws) return;

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.START_GAME,
        data: {
          roomId: roomSettings.id,
          name: player.name,
        },
      })
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
          name: player.name,
        },
      })
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
          roomId: roomId ?? roomSettings.id,
          name: player.name,
        },
      })
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

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    setWs(ws);

    ws.onopen = () => {};

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
        setView("create-room");
      }

      if (parsedData.type === MESSAGE_TYPE.YOU_ARE_CHOOSER) {
        const { room, round } = parsedData.data;
        setRoom(room);
        setView("share-room");
        setChooseType("chooser");
      }

      if (parsedData.type === MESSAGE_TYPE.SOMEONE_CHOOSING) {
        const { room, message, round } = parsedData.data;
        setRoom(room);
        setChooseMessage(message);
        setView("share-room");
        setChooseType("choosing");
      }

      if (parsedData.type === MESSAGE_TYPE.CHOOSEN_WORD) {
        // string[]
        const { totalLength } = parsedData.data;
        setChooseType(null);
        setTotalLength(totalLength);
      }

      if (parsedData.type === MESSAGE_TYPE.ERROR) {
        const { message } = parsedData.data;
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            message,
            playerName: player.name,
          },
        ]);
      }

      if (parsedData.type === MESSAGE_TYPE.GUESSED) {
        const { message } = parsedData.data;
        setGuessedMessage(message);
        setChooseType("guessed");
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
    };
  }, []);

  if (!ws) {
    return <div>Connecting to server....</div>;
  }

  if (chooseType === "chooser") {
    return (
      <WordSelection
        words={roomSettings.custom_word}
        onSelectWord={sendGuessedWord}
      />
    );
  }

  if (chooseType === "choosing") {
    return (
      <div className="z-100 inset-0 bg-black/20 text-white fixed flex justify-center items-center gap-20">
        {chooseMessage}
      </div>
    );
  }

  if (chooseType === "guessed") {
    return (
      <div className="z-100 inset-0 bg-black/20 text-white fixed flex justify-center items-center gap-20">
        {gussedMessage}
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
        createRoom={createRoom}
      />
    );
  }

  return (
    <RoomLayout
      players={room.users}
      messages={messages}
      onSendMessage={handleSendMessage}
      currentPlayerName={player.name}
      centerContent={
        view === "create-room" ? (
          <RoomSettings
            handleCustomWords={handleCustomWords}
            roomUrl={roomUrl}
            settings={roomSettings}
            onSettingsChange={setRoomSettings}
            onCreateGame={handleCreateRoom}
            onStartGame={handleStartGame}
          />
        ) : (
          <DrawingCanvas
            currentRound={3}
            drawTime={60}
            onTimeUp={() => {}}
            totalRounds={10}
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
        )
      }
    />
  );
};
