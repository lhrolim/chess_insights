import { UCIUtil } from "./UCIUtil";

export type GameAnalyzisOptions = {
  depth: number;
  lines: number;
  firstErrorOnly?: boolean;
};

export enum MoveCategory {
  Brilliant = "brilliant",
  Great = "great",
  Best = "best",
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



export class EngineInput {
  moves?: string[];
  fen?: string;
  startPos?: string;

  private constructor(fen?: string, startPos?: string) {
    this.fen = fen;
    this.startPos = startPos;
  }

  public static fromFen(fen: string): EngineInput {
    return new EngineInput(undefined, fen);
  }
  public static fromMoves(moves: string[]): EngineInput {
    const startPos = UCIUtil.joinMoves(moves);
    return new EngineInput(null,startPos);
  }
  public static fromStartPos(startPos: string): EngineInput {
    return new EngineInput(undefined, startPos);
  }

  lastMove(): string {
    if (!this.startPos) {
      return null;
    }
    return this.startPos.trim().split(" ").pop();
  }

  isWhiteToMove(): boolean {
    if (this.moves) {
      return this.moves.length % 2 === 0;
    } else if (this.fen) {
      return this.fen.split(" ")[1] === "w";
    }
    return this.startPos.trim().split(" ").length % 2 === 0;
  }
}
