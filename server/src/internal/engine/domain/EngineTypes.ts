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
export class UCIMoveResult {
  move: string;
  data: MoveData;

  constructor(move: string, data: MoveData) {
    this.move = move;
    this.data = data;
  }

  toString(): string {
    return `Move: ${this.move}, Data: ${this.data.toString()}`;
  }
}

export class MoveData {
  score: number;
  mate: number;
  isWhiteToMove?: boolean;

  constructor(score: number, mate: number, isWhiteToMove?: boolean) {
    this.score = score;
    this.mate = mate;
    this.isWhiteToMove = isWhiteToMove;
  }

  toString(): string {
    return `Score: ${this.score}, Mate: ${this.mate}, IsWhiteToMove: ${this.isWhiteToMove}`;
  }
}