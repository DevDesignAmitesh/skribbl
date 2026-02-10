"use client";

import {
  ChatMessage,
  chooseState,
  Player,
  tool,
  ViewState,
} from "@/components/game/types";
import { HalfWord, Room, User } from "@repo/common/common";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface RestContextProps {
  view: ViewState;
  viewRef: React.RefObject<ViewState>;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setHalfWord: React.Dispatch<React.SetStateAction<HalfWord[]>>;
  halfWord: HalfWord[];
  setChooseType: React.Dispatch<React.SetStateAction<chooseState | null>>;
  chooseType: chooseState | null;
  setRoomId: React.Dispatch<React.SetStateAction<string | null>>;
  roomId: string | null;
  setChooseMessage: React.Dispatch<React.SetStateAction<string>>;
  chooseMessage: string;
  setCurrentColor: React.Dispatch<React.SetStateAction<string>>;
  currentColor: string;
  setStrokeWidth: React.Dispatch<React.SetStateAction<number>>;
  strokeWidth: number;
  setTool: React.Dispatch<React.SetStateAction<tool>>;
  tool: tool;
  setRightWord: React.Dispatch<React.SetStateAction<string | null>>;
  rightWord: string | null;
  setTotalLength: React.Dispatch<React.SetStateAction<number[]>>;
  totalLength: number[];
  handleSetView: (val: ViewState) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  setRoom: React.Dispatch<
    React.SetStateAction<{
      room: Room | null;
      users: User[];
    }>
  >;
  room: { room: Room | null; users: User[] };
  startDrawing: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void;
  stopDrawing: () => void;
  isDrawing: boolean;
  lastPosRef: React.RefObject<{
    x: number;
    y: number;
  } | null>;
}

const RestContext = createContext<RestContextProps | null>(null);

export const RestContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState<ViewState>("landing");
  const viewRef = useRef<ViewState>("landing");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [rightWord, setRightWord] = useState<string | null>(null);
  const [halfWord, setHalfWord] = useState<HalfWord[]>([]);
  const [chooseType, setChooseType] = useState<chooseState | null>(null);
  const [chooseMessage, setChooseMessage] = useState<string>("");
  const [totalLength, setTotalLength] = useState<number[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [tool, setTool] = useState<tool>("pencil");

  const [player, setPlayer] = useState<Player>({
    id: crypto.randomUUID(),
    name: "",
    avatarIndex: 2,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [room, setRoom] = useState<{ room: Room | null; users: User[] }>({
    room: null,
    users: [],
  });

  const handleSetView = (view: ViewState) => {
    setView(view);
    viewRef.current = view;
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

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  return (
    <RestContext.Provider
      value={{
        view,
        roomId,
        player,
        setPlayer,
        setRoom,
        messages,
        setMessages,
        setRoomId,
        viewRef,
        rightWord,
        setRightWord,
        handleSetView,
        chooseType,
        halfWord,
        setChooseType,
        setHalfWord,
        chooseMessage,
        setChooseMessage,
        room,
        setTotalLength,
        totalLength,
        canvasRef,
        startDrawing,
        stopDrawing,
        isDrawing,
        lastPosRef,
        currentColor,
        setCurrentColor,
        setStrokeWidth,
        setTool,
        strokeWidth,
        tool,
      }}
    >
      {children}
    </RestContext.Provider>
  );
};

export const useRestContext = () => {
  const context = useContext(RestContext);
  if (!context) throw new Error("ws context not found");
  return context;
};
