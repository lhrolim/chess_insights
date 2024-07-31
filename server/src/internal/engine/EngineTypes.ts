export type GameAnalyzisOptions = {
  depth: number;
  lines: number;
  firstErrorOnly?: boolean;
  eloRating?: number;
  threads?: number;
};

export enum MoveCategory {
  Brilliant = "brilliant",
  Great = "great",
  Best = "best",
  Excellent = "excellent",
  Good = "good",
  Book = "book",
  Innacuracy = "inaccuracy",
  Mistake = "mistake",
  Blunder = "blunder",
  Miss = "miss"
}

export type UCIResult = {
  moves: UCIMoveResult[];
  endOfGame: EndOfGameMode;
  ignored: boolean;
};

export enum EndOfGameMode {
  MATE = "mate",
  STALEMATE = "stalemate",
  REPETITION = "repetition",
  NONE = "none",
  RESIGN = "resign",
  DRAW = "draw",
  TIMEOUT = "timeout"
}

export type UCIMoveResult = {
  move: string;
  data: MoveData;
};

export type MoveData = {
  score: number;
  mate: number;
  isWhiteToMove?: boolean;
};
