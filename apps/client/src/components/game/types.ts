export type ViewState = "landing" | "create-room" | "waiting" | "share-room";

export type chooseState = "chooser" | "choosing" | "guessed";

export interface Player {
  id: string;
  name: string;
  avatarIndex: number;
}

export interface ChatMessage {
  id: string;
  from: string;
  message: string;
}

export interface RoomSettings {
  id: string;
  players: number;
  rounds: number;
  draw_time: number;
  language: string;
  custom_word: string[];
}

export type tool = "pencil" | "eraser";
