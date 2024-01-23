import { GameResult } from "../../../server/src/api/dtos/gamedto";

export type { GameResult };

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
