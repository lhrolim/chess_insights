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
  whiteData: PlayerData;
  blackData: PlayerData;
  matchTimeInSeconds: number;
}

export type PlayerData = {
  username: string;
  country?: string;
  rating: number;
  result: string;
  precision: number;
  finalClock: string;
};

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

export type GameSearchDto = {
  user: string;
  months: number;
  minAccuracy?: number;
  minOpponentRating?: number;
  minMoves?: number;
  opening?: string;
  gameFormat?: GameFormat;
  maxGames: number;
  sortDTO: SortDTO;
};

export type SortDTO = {
  criteria: SortCriteria;
  desc: boolean;
};

export enum SortCriteria {
  PRECISION = "precision",
  MOVES = "moves",
  DATE = "date"
}

// Function to convert GameSearchDto to a string
export const gameSearchDtoToString = (dto: GameSearchDto): string => {
  return `GameSearchDto {
    user: ${dto.user},
    months: ${dto.months},
    minAccuracy: ${dto.minAccuracy},
    minOpponentRating: ${dto.minOpponentRating},
    minMoves: ${dto.minMoves},
    opening: ${dto.opening},
    gameFormat: ${JSON.stringify(dto.gameFormat)}
    maxGames: ${dto.maxGames},
    sortDTO: ${JSON.stringify(dto.sortDTO)} 
  }`;
};
