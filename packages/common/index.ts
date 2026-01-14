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
}

export interface Room {
  id: string;
  players: number;
  language: string;
  draw_time: number;
  rounds: number;
  status: roomStatus;
  right_word: string | null;
  custom_word: string[];
  startedAt?: number;
}

export const MESSAGE_TYPE = {
  CREATE_ROOM: "CREATE_ROOM",
  JOIN_ROOM: "JOIN_ROOM",
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
};
