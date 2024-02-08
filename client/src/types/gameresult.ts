import { GameResultDTO, GameSearchDto, SortDTO } from "../../../server/src/api/dtos/GameDtos";
import { PlayerData } from "../../../server/src/api/dtos/GameDtos";

export type { GameResultDTO as GameResult, PlayerData, GameSearchDto, SortDTO };

export enum GameFormat {
  Bullet = "bullet",
  Blitz = "blitz",
  Daily = "daily",
  Rapid = "rapid"
}

export enum MatchResult {
  Draw = "draw",
  Lost = "lost",
  Won = "won",
  Unknown = "unknown" // This should never happen, but just in case it does, we'll have a default optio
}

export enum SortCriteria {
  PRECISION = "precision",
  MOVES = "moves",
  DATE = "date"
}
