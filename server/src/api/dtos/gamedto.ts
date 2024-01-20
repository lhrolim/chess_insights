export interface GameResult {
    url: string;
    myPrecision: number;
    opponentPrecision: number;
    opponentUserName: string;
    myRating?: number;
    opponentRating?: number;
    format: GameFormat;
    timestamp: string;
    result: MatchResult;
    endMatchMode: EndMatchMode;
    numberOfMoves?: number;
    opening?: string;
    myClock?: string;
    opponentClock?: string;
  }
  
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
  
  export enum EndMatchMode {
    Checkmated = "checkmated",
    Resign = "resigned",
    Timeout = "timeout",
    StaleMate = "stalemate",
    TimeVsInsufficient = "timevsinsufficient",
    Insufficient = "insufficient",
    Unknown = "unknown"
  }
  
