import type { Game, GameEnum } from "./games"

export enum RoomStatus {
  WAITING = "waiting",
  PLAYING = "playing",
  CLOSED = "closed"
}

export interface RoomPlayer {
  id: string
  username: string
  isHost: boolean
  isReady: boolean
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