"use client";

import { create } from "zustand";
import React from "react";
import { getCanvasCoordinates, getContext, WS_URL } from "@/lib/lib";
import { MESSAGE_TYPE, Room, User } from "@repo/common/common";
import { toast } from "sonner";
import { useRestContext } from "./rest";

interface WsStore {
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
  handleSendMessage: (message: string) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export const useWsContext = create<WsStore>(() => {
  const ws = new WebSocket(WS_URL);

  ws.onmessage = (event) => {
    const parsedData = JSON.parse(event.data);

    const {
      handleSetView,
      setPlayer,
      player,
      setRoom,
      setMessages,
      setRoomId,
      viewRef,
      setRightWord,
      setHalfWord,
      setChooseType,
      setChooseMessage,
      setTotalLength,
      canvasRef,
    } = useRestContext.getState();

    if (
      parsedData.type === MESSAGE_TYPE.JOIN_ROOM ||
      parsedData.type === MESSAGE_TYPE.JOIN_RANDOM
    ) {
      const { room } = parsedData.data;
      setRoom(room);

      console.log("player ", player);

      const user = room.users.find((u: User) => u.id === player.id);
      console.log("user ", user);
      if (!user) return;

      if (user.type !== "admin") {
        if (room.room.status === "creating") handleSetView("waiting");
        else if (room.room.status === "ongoing") handleSetView("share-room");
        else if (room.room.status === "ended") window.location.reload();
      }

      setPlayer({ status: user.status, type: user.type });
    }

    if (parsedData.type === MESSAGE_TYPE.CREATE_ROOM) {
      const { room } = parsedData.data;
      setRoom(room);
      setRoomId(room.room.id);
    }

    if (parsedData.type === MESSAGE_TYPE.MESSAGE) {
      const { message, from, room, word } = parsedData.data;
      if (word) setRightWord(word);
      if (room) setRoom(room);

      if (viewRef.current === "landing") {
        toast.error(from, { description: message });
      } else {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), message, from },
        ]);
      }
    }

    if (parsedData.type === MESSAGE_TYPE.RIGHT_WORD) {
      setRightWord(parsedData.data.word);
    }

    if (parsedData.type === MESSAGE_TYPE.YOU_ARE_CHOOSER) {
      const { room } = parsedData.data;
      setRoom(room);
      setHalfWord([]);
      setRightWord(null);
      setChooseType("chooser");

      const user = room.users.find((u: User) => u.id === player.id);
      if (user) setPlayer({ status: user.status });
    }

    if (parsedData.type === MESSAGE_TYPE.SOMEONE_CHOOSING) {
      const { room, message } = parsedData.data;
      setRoom(room);
      setHalfWord([]);
      setRightWord(null);
      setChooseType("choosing");
      setChooseMessage(message);

      const user = room.users.find((u: User) => u.id === player.id);
      if (user) setPlayer({ status: user.status });
    }

    if (parsedData.type === MESSAGE_TYPE.CHOOSEN_WORD) {
      setChooseType(null);
      setHalfWord([]);
      setRightWord(null);
      setTotalLength(parsedData.data.totalLength);
      handleSetView("share-room");
    }

    if (parsedData.type === MESSAGE_TYPE.DRAWING) {
      const ctx = getContext(canvasRef);
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;

      const { from, to, color, width } = parsedData.data.payload;

      ctx.beginPath();
      ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
      ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = width * canvas.width;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    if (parsedData.type === MESSAGE_TYPE.CLEAR_CANVAS) {
      const canvas = canvasRef.current;
      const ctx = getContext(canvasRef);
      if (!canvas || !ctx) return;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (parsedData.type === MESSAGE_TYPE.GAME_END) {
      setRoom(parsedData.data.room);
      handleSetView("summary");
    }

    if (parsedData.type === MESSAGE_TYPE.ROOM_DELETED) {
      window.location.replace(process.env.NEXT_PUBLIC_FRONTEND_URL!);
    }
  };

  ws.onerror = () => {
    useRestContext.getState().handleSetView("error");
  };

  return {
    ws,

    handleRoomJoin: (roomId, name, character, language) => {
      const { setPlayer, player } = useRestContext.getState();

      setPlayer({ avatarIndex: character, id: player.id, name });

      ws.send(
        JSON.stringify({
          type: roomId ? MESSAGE_TYPE.JOIN_ROOM : MESSAGE_TYPE.JOIN_RANDOM,
          data: roomId
            ? { roomId, name, userId: player.id, character }
            : { name, userId: player.id, character, language },
        }),
      );
    },

    handleCreateRoom: (room) => {
      const { player, setMessages } = useRestContext.getState();
      if (room.custom_word.length <= 3) {
        setMessages((p) => [
          ...p,
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
    },

    handleStartRoom: () => {
      const { roomId, player } = useRestContext.getState();
      ws.send(
        JSON.stringify({
          type: MESSAGE_TYPE.START_GAME,
          data: { roomId, userId: player.id },
        }),
      );
    },

    sendGuessedWord: (word) => {
      const { roomId, player, setMessages } = useRestContext.getState();
      if (!word.trim()) {
        setMessages((p) => [
          ...p,
          {
            id: crypto.randomUUID(),
            from: "client",
            message: "choose a word first",
          },
        ]);
        return;
      }

      ws.send(
        JSON.stringify({
          type: MESSAGE_TYPE.CHOOSEN_WORD,
          data: { roomId, word, userId: player.id },
        }),
      );
    },

    handleSendMessage: (message) => {
      const { roomId, player } = useRestContext.getState();
      ws.send(
        JSON.stringify({
          type: MESSAGE_TYPE.GUESS_WORD,
          data: { roomId, word: message, userId: player.id },
        }),
      );
    },

    draw: (e) => {
      const {
        isDrawing,
        lastPosRef,
        canvasRef,
        tool,
        strokeWidth,
        currentColor,
        roomId,
        player,
      } = useRestContext.getState();

      if (!isDrawing || !lastPosRef.current) return;

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
      ctx.stroke();

      lastPosRef.current = pos;

      ws.send(
        JSON.stringify({
          type: MESSAGE_TYPE.DRAWING,
          data: {
            payload: {
              from: { x: from.x / canvas.width, y: from.y / canvas.height },
              to: { x: pos.x / canvas.width, y: pos.y / canvas.height },
              color: tool === "eraser" ? "#FFFFFF" : currentColor,
              width: strokeWidth / canvas.width,
              tool,
              roomId,
            },
            roomId,
            userId: player.id,
          },
        }),
      );
    },
  };
});
