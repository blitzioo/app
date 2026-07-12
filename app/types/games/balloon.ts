import type { GameData } from "../games";
import type { RoomPlayer } from "../rooms";

export interface BalloonExplosionEvent {
    playerId: string;
    username: string;
    penalty: number;
}

export interface BalloonGiveEvent {
    playerId: string;
    username: string;
    penalty: number;
}

export interface BalloonPublicData extends GameData {
    currentPlayerIdx: number;
    players: RoomPlayer[];
    pressure: number;
    exploded: boolean;

    currentTurn: number
    
    explosion: BalloonExplosionEvent | null;
    give: BalloonGiveEvent | null;
}

export interface BalloonPrivateData extends GameData {}

export type BalloonAction = "pump" | "pass";