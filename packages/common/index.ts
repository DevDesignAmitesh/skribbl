import { WebSocket } from "ws";

export type userType = "member" | "admin";
export type userStatus = "chooser" | "guesser" | "idol";

export interface User {
  id: string;
  name: string;
  character: string;
  type: userType;
  status: userStatus;
  ws: WebSocket;
  points: number
}

export interface Room {
  id: string;
  name: string;
  players: number;
  language: string;
  draw_time: number;
  rounds: number;
  right_word: string | null;
  startedAt?: number
}

export const MESSAGE_TYPE = {
  CREATE_ROOM: "CREATE_ROOM",
  JOIN_ROOM: "JOIN_ROOM",
  JOIN_RANDOM: "JOIN_RANDOM",
  ERROR: "ERROR",
  GUESSED: "GUESSED",
  GAME_END: "GAME_END",
  START_GAME: "START_GAME",
  DRAWING: "DRAWING",
  START_GUESS: "START_GUESS",
  GUESS_WORD: "GUESS_WORD",
  CHOOSEN_WORD: "CHOOSEN_WORD",
};
