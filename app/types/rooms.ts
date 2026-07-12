import type { Game, GameEnum } from "./games"

export enum PlayerStatus {
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  TIMEOUT = "TIMEOUT"
}
export enum RoomStatus {
  WAITING = "waiting",
  PLAYING = "playing",
  CLOSED = "closed"
}

export interface PlayerPresenceChangedEvent {
  players: (RoomPlayer)[];
  newHostId: string;
}

export interface RoomPlayer {
  id: string
  username: string
  
  connectionStatus: PlayerStatus;
  disconnectedAt?: Date;
}

export interface Room {
  code: string
  hostId: string
  gameId: GameEnum
  game: Game;
  status: RoomStatus
  players: RoomPlayer[]
  createdAt: string;
}