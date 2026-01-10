import { WebSocket } from "ws";

export type userType = "member" | "drawee";
export type userStatus = "drawing" | "choosing" | "guessing";

export interface User {
  name: string;
  character: string;
  type?: userType;
  status?: userStatus;
  isAdmin: boolean;
  ws: WebSocket;
}

export interface Room {
  id: string;
  name: string;
  players: number;
  language: string;
  draw_time: number;
  rounds: number;
  right_word: string | null;
}

export const MESSAGE_TYPE = {
  CREATE_ROOM: "CREATE_ROOM",
  JOIN_ROOM: "JOIN_ROOM",
  JOIN_RANDOM: "JOIN_RANDOM",
  ERROR: "ERROR",
  START_GAME: "START_GAME",
  START_GUESS: "START_GUESS",
  CHOOSEN_WORD: "CHOOSEN_WORD",
};
