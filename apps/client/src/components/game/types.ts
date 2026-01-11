export type ViewState = "landing" | "create-room" | "joined-room";

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
  adminName: string;
  adminAvatar: number;
  playerCount: number;
  rounds: number;
  drawTime: number;
  language: string;
}
