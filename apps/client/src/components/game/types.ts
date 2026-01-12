export type ViewState =
  | "landing"
  | "create-room"
  | "joined-room"
  | "share-room";

export type chooseState = "chooser" | "choosing";

export interface Player {
  id: string;
  name: string;
  avatarIndex: number;
}

export interface ChatMessage {
  id: string;
  playerName: string;
  message: string;
}

export interface RoomSettings {
  id: string;
  players: number;
  rounds: number;
  draw_time: number;
  language: string;
}

export type tool = "pencil" | "eraser";
