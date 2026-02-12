import { WebSocket } from "ws";

export type userType = "member" | "admin";
export type userStatus = "chooser" | "guesser" | "idol";
export type roomStatus = "ongoing" | "creating" | "ended";

export interface User {
  id: string;
  name: string;
  character: number;
  type: userType;
  status: userStatus;
  ws: WebSocket;
  points: number;
  turn?: boolean
}

export interface Room {
  id: string;
  players: number;
  language: string;
  draw_time: number;
  latest_round?: number;
  total_round?: number;
  rounds: number;
  roundEndsAt?: number;
  status: roomStatus;
  custom_word: string[];
  startedAt?: number;
}

export type MESSAGE_TYPE =
  | "CREATE_ROOM"
  | "LEFT"
  | "JOIN_ROOM"
  | "GAME_END"
  | "START_GAME"
  | "JOIN_RANDOM"
  | "DRAWING"
  | "START_GUESS"
  | "GUESS_WORD"
  | "CHOOSEN_WORD"
  | "YOU_ARE_CHOOSER"
  | "SOMEONE_CHOOSING"
  | "RIGHT_WORD"
  | "CLEAR_CANVAS"
  | "ANOTHER_ONE"
  | "ROOM_DELETED"
  | "HALF_WORD"
  | "HALF_TIME"
  | "ROUND_SUMMARY"
  | "MESSAGE";

export const MESSAGE_TYPE: Record<MESSAGE_TYPE, MESSAGE_TYPE> = {
  CREATE_ROOM: "CREATE_ROOM",
  LEFT: "LEFT",
  ROUND_SUMMARY: "ROUND_SUMMARY",
  ROOM_DELETED: "ROOM_DELETED",
  HALF_WORD: "HALF_WORD",
  RIGHT_WORD: "RIGHT_WORD",
  HALF_TIME: "HALF_TIME",
  JOIN_ROOM: "JOIN_ROOM",
  ANOTHER_ONE: "ANOTHER_ONE",
  JOIN_RANDOM: "JOIN_RANDOM",
  MESSAGE: "MESSAGE",
  GAME_END: "GAME_END",
  START_GAME: "START_GAME",
  DRAWING: "DRAWING",
  START_GUESS: "START_GUESS",
  GUESS_WORD: "GUESS_WORD",
  CHOOSEN_WORD: "CHOOSEN_WORD",
  YOU_ARE_CHOOSER: "YOU_ARE_CHOOSER",
  SOMEONE_CHOOSING: "SOMEONE_CHOOSING",
  CLEAR_CANVAS: "CLEAR_CANVAS",
};

export type HalfWord = {
  elm: string;
  idx: number;
};
