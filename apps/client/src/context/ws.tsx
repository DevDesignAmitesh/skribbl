"use client";

import { getCanvasCoordinates, getContext, WS_URL } from "@/lib/lib";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
  clearCanvas: () => void;
  handleHalfTime: () => void;
  sendGuessedWord: (word: string) => void;
  handleSendMessage: (message: string) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void;
}

const WsContext = createContext<WsContextProps | null>(null);

export const WsContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  console.log("getting called");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const roomIdRef = useRef<string | null>(null);

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
    setChooser,
    setTotalLength,
    canvasRef,
    isDrawing,
    lastPosRef,
    tool,
    strokeWidth,
    currentColor,
    room,
  } = useRestContext();

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    setWs(ws);
  }, []);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);

      console.log("recevied data ", parsedData);

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

      if (parsedData.type === MESSAGE_TYPE.RIGHT_WORD) {
        const { word } = parsedData.data;
        setRightWord(word);
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
        const { room, chooser } = parsedData.data;
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
        setChooser(chooser);
      }

      if (parsedData.type === MESSAGE_TYPE.CHOOSEN_WORD) {
        // totalLength: number[]
        const { totalLength, word } = parsedData.data;
        if (word) {
          setRightWord(word);
        } else {
          setRightWord(null);
        }
        setChooseType(null);
        setHalfWord([]);
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

      if (parsedData.type === MESSAGE_TYPE.CLEAR_CANVAS) {
        const canvas = canvasRef.current;
        const ctx = getContext(canvasRef);
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
        handleSetView("summary");
      }

      if (parsedData.type === MESSAGE_TYPE.ANOTHER_ONE) {
        setTimeout(() => {
          if (!ws) return;

          ws.send(
            JSON.stringify({
              type: MESSAGE_TYPE.START_GAME,
              data: {
                roomId: roomIdRef.current,
                userId: player.id,
              },
            }),
          );

          // ⚠️ Important:
          // This logic was originally using `roomId` from the initial render.
          // Since this `useEffect` depends only on `ws`, it does NOT re-run when `roomId` updates.
          // Because of that, any callback (like setTimeout or ws event handlers) inside here
          // captures a stale `roomId` value (often `undefined` from first render).
          //
          // This is a classic React "stale closure" issue where async callbacks
          // hold onto old state values from the render they were created in.
          // Fix: Use a ref (e.g., roomIdRef.current) to always access the latest roomId
          // instead of relying on the state value captured in this effect.

          // handleStartRoom()
        }, 2000);
      }

      if (parsedData.type === MESSAGE_TYPE.HALF_WORD) {
        const { halfWord } = parsedData.data;
        setHalfWord(halfWord);
      }

      if (parsedData.type === MESSAGE_TYPE.ROOM_DELETED) {
        window.location.replace(process.env.NEXT_PUBLIC_FRONTEND_URL!);
      }
    };

    ws.onerror = (err) => {
      console.log("ws error ", err);
      handleSetView("error");
    };
  }, [ws]);

  useEffect(() => {
    roomIdRef.current = roomId ?? room.room?.id ?? null;
  }, [roomId, room]);

  const handleRoomJoin = (
    roomId: string | null,
    name: string,
    character: number,
    language: string,
  ) => {
    if (!ws) return;

    // TODO: ideally we should do this, when we will recevie the event from the server
    setPlayer((prev) => ({
      ...prev,
      avatarIndex: character,
      id: player.id,
      name,
    }));

    if (roomId) {
      ws.send(
        JSON.stringify({
          type: MESSAGE_TYPE.JOIN_ROOM,
          data: {
            roomId,
            name,
            userId: player.id,
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
          userId: player.id,
          character,
          language,
        },
      }),
    );
  };

  const handleCreateRoom = (room: Room) => {
    if (!ws) return;

    const name = localStorage.getItem("name");
    const character = Number(localStorage.getItem("character"));

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.CREATE_ROOM,
        data: {
          ...room,
          userName: name,
          userId: player.id,
          character,
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
          roomId: roomIdRef.current,
          userId: player.id,
        },
      }),
    );
  };

  const sendGuessedWord = (word: string) => {
    if (!ws) return;

    // TODO: we should also do this on the server
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
          roomId: roomIdRef.current,
          word,
          userId: player.id,
        },
      }),
    );
  };

  const handleSendMessage = (message: string) => {
    if (!ws) return;

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.GUESS_WORD,
        data: {
          roomId: roomIdRef.current,
          word: message,
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
    };

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.DRAWING,
        data: {
          payload,
          roomId: roomIdRef.current,
          userId: player.id,
        },
      }),
    );
  };

  const handleHalfTime = () => {
    if (!ws) return;

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.HALF_TIME,
        data: {
          roomId: roomIdRef.current,
          userId: player.id,
        },
      }),
    );
  };

  const clearCanvas = () => {
    if (!ws) return;

    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.CLEAR_CANVAS,
        data: {
          roomId: roomIdRef.current,
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
        handleSendMessage,
        handleHalfTime,
        clearCanvas,
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
