"use client";

import { create } from "zustand";
import React, { useRef } from "react";
import {
  ChatMessage,
  chooseState,
  Player,
  tool,
  ViewState,
} from "@/components/game/types";
import { HalfWord, Room, User } from "@repo/common/common";

interface RestStore {
  view: ViewState;
  viewRef: React.RefObject<ViewState | null>;

  roomId: string | null;
  rightWord: string | null;

  halfWord: HalfWord[];
  chooseType: chooseState | null;
  chooseMessage: string;
  totalLength: number[];

  currentColor: string;
  strokeWidth: number;
  tool: tool;

  isDrawing: boolean;
  lastPosRef: React.RefObject<{ x: number; y: number } | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;

  player: Player;
  messages: ChatMessage[];
  room: { room: Room | null; users: User[] };

  /* setters (same names) */
  setRoomId: (val: string | null) => void;
  setRightWord: (val: string | null) => void;
  setHalfWord: (val: HalfWord[]) => void;
  setChooseType: (val: chooseState | null) => void;
  setChooseMessage: (val: string) => void;
  setTotalLength: (val: number[]) => void;
  setCurrentColor: (val: string) => void;
  setStrokeWidth: (val: number) => void;
  setTool: (val: tool) => void;
  setPlayer: (val: Partial<Player>) => void;
  setMessages: (
    val: ChatMessage[] | ((p: ChatMessage[]) => ChatMessage[]),
  ) => void;
  setRoom: (val: { room: Room | null; users: User[] }) => void;

  /* handlers */
  handleSetView: (val: ViewState) => void;
  startDrawing: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
}

export const useRestContext = create<RestStore>((set, get) => {
  const canvasRef = React.createRef<HTMLCanvasElement>();
  const viewRef = React.createRef<ViewState>();
  const lastPosRef = React.createRef<{ x: number; y: number } | null>();

  viewRef.current = "landing";

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

  return {
    /* initial state */
    view: "landing",
    viewRef,

    roomId: null,
    rightWord: null,

    halfWord: [],
    chooseType: null,
    chooseMessage: "",
    totalLength: [],

    currentColor: "#000000",
    strokeWidth: 2,
    tool: "pencil",

    isDrawing: false,
    lastPosRef,
    canvasRef,

    player: {
      id: crypto.randomUUID(),
      name: "",
      avatarIndex: 2,
    },

    messages: [],
    room: { room: null, users: [] },

    /* setters */
    setRoomId: (roomId) => set({ roomId }),
    setRightWord: (rightWord) => set({ rightWord }),
    setHalfWord: (halfWord) => set({ halfWord }),
    setChooseType: (chooseType) => set({ chooseType }),
    setChooseMessage: (chooseMessage) => set({ chooseMessage }),
    setTotalLength: (totalLength) => set({ totalLength }),
    setCurrentColor: (currentColor) => set({ currentColor }),
    setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
    setTool: (tool) => set({ tool }),
    setPlayer: (player) =>
      set((prev) => ({ player: { ...prev.player, player } })),
    setRoom: (room) => set({ room }),

    setMessages: (val) =>
      set((state) => ({
        messages: typeof val === "function" ? val(state.messages) : val,
      })),

    /* handlers */
    handleSetView: (view) => {
      set({ view });
      viewRef.current = view;
    },

    startDrawing: (e) => {
      const pos = getCanvasCoordinates(e);
      lastPosRef.current = pos;
      set({ isDrawing: true });
    },

    stopDrawing: () => {
      lastPosRef.current = null;
      set({ isDrawing: false });
    },
  };
});
