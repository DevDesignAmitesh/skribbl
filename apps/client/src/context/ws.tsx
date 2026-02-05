"use client";

import { getCanvasCoordinates, getContext, WS_URL } from "@/lib/lib";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRestContext } from "./rest";
import { MESSAGE_TYPE, Room, User } from "@repo/common/common";
import { toast } from "sonner";

interface WsContextProps {
  ws: WebSocket | null;
  handleRoomJoin: (
    roomId: string | null,
    name: string,
    character: number,
    language: string,
  ) => void;
  handleCreateRoom: (room: Room) => void;
  handleStartRoom: () => void;
  sendGuessedWord: (word: string) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void;
}

const WsContext = createContext<WsContextProps | null>(null);

export const WsContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  const {
    handleSetView,
    setPlayer,
    player,
    setRoom,
    setMessages,
    setRoomId,
    roomId,
    viewRef,
    setRightWord,
    setHalfWord,
    setChooseType,
    setChooseMessage,
    setTotalLength,
    canvasRef,
    isDrawing,
    lastPosRef,
    tool,
    strokeWidth,
    currentColor,
  } = useRestContext();

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    setWs(ws);

    ws.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);

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
      }

      if (parsedData.type === MESSAGE_TYPE.CREATE_ROOM) {
        const { room } = parsedData.data;
        setRoom(room);
        setRoomId(room.room.id);
      }

      if (parsedData.type === MESSAGE_TYPE.MESSAGE) {
        const { message, from, room, word } = parsedData.data;
        if (word) {
          setRightWord(word);
        }
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

      if (parsedData.type === MESSAGE_TYPE.YOU_ARE_CHOOSER) {
        const { room } = parsedData.data;
        setRoom(room);
        setHalfWord([]);
        setRightWord(null);
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
        setHalfWord([]);
        setRightWord(null);
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
        setHalfWord([]);
        setRightWord(null);
        setTotalLength(totalLength);
        handleSetView("share-room");
      }

      if (parsedData.type === MESSAGE_TYPE.DRAWING) {
        const ctx = getContext(canvasRef);
        if (!ctx) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const { payload } = parsedData.data;
        const { from, to, color, width, tool } = payload;

        // Denormalize coordinates
        const fromX = from.x * canvas.width;
        const fromY = from.y * canvas.height;
        const toX = to.x * canvas.width;
        const toY = to.y * canvas.height;

        ctx.save();

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.strokeStyle = color;
        ctx.lineWidth = width * canvas.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        ctx.restore();
      }
    };

    ws.onerror = () => {
      handleSetView("error");
    };
  }, []);

  const handleRoomJoin = (
    roomId: string | null,
    name: string,
    character: number,
    language: string,
  ) => {
    if (!ws) return;

    const userId = crypto.randomUUID();

    setPlayer((prev) => ({
      ...prev,
      avatarIndex: character,
      id: userId,
      name,
    }));

    if (roomId) {
      ws.send(
        JSON.stringify({
          type: MESSAGE_TYPE.JOIN_ROOM,
          data: {
            roomId,
            name,
            userId,
            character,
          },
        }),
      );

      return;
    }

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.JOIN_RANDOM,
        data: {
          name,
          userId,
          character,
          language,
        },
      }),
    );
  };

  const handleCreateRoom = (room: Room) => {
    if (!ws) return;

    if (room.custom_word.length <= 3) {
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
          ...room,
          userName: player.name,
          userId: player.id,
          character: player.avatarIndex,
        },
      }),
    );
  };

  const handleStartRoom = () => {
    if (!ws) return;

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.START_GAME,
        data: {
          roomId,
          userId: player.id,
        },
      }),
    );
  };

  const sendGuessedWord = (word: string) => {
    if (!ws) return;

    if (!word.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          message: "choose a word first",
          from: "client",
        },
      ]);
      return;
    }

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.CHOOSEN_WORD,
        data: {
          roomId,
          word,
          userId: player.id,
        },
      }),
    );
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosRef.current) return;
    if (!ws) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = getContext(canvasRef);
    if (!ctx) return;

    const pos = getCanvasCoordinates(e, canvasRef);
    const from = lastPosRef.current;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : currentColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastPosRef.current = pos;

    // we can add it...
    // const now = Date.now();
    // if (now - lastSentRef.current < 16) return;
    // lastSentRef.current = now;

    const normalize = (p: { x: number; y: number }) => ({
      x: p.x / canvas.width,
      y: p.y / canvas.height,
    });

    const payload = {
      type: "stroke",
      from: normalize(from),
      to: normalize(pos),
      color: tool === "eraser" ? "#FFFFFF" : currentColor,
      width: strokeWidth / canvas.width,
      tool,
      roomId,
    };

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.DRAWING,
        data: {
          payload,
          roomId,
          userId: player.id,
        },
      }),
    );
  };
  return (
    <WsContext.Provider
      value={{
        ws,
        handleRoomJoin,
        handleCreateRoom,
        handleStartRoom,
        sendGuessedWord,
        draw,
      }}
    >
      {children}
    </WsContext.Provider>
  );
};

export const useWsContext = () => {
  const context = useContext(WsContext);
  if (!context) throw new Error("ws context not found");
  return context;
};
