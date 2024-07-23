import { UCIUtil } from "./UCIUtil";

export type GameAnalyzisOptions = {
  depth: number;
  lines: number;
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
  NONE = "none"
}

export type UCIMoveResult = {
  move: string;
  score: MoveScore;
};

export type MoveScore = {
  score: number;
  mate: number;
  isWhiteToMove?: boolean;
};

export class MoveAnalysis {
  movePlayed: string;
  positionScore: MoveScore;
  moveScoreDelta: number;
  category: MoveCategory;
  position?: string;
  nextMoves?: UCIMoveResult[];
  endOfGame: EndOfGameMode;
  isWhiteToMove: boolean;

  isEndOfGame(): boolean {
    return EndOfGameMode.NONE !== this.endOfGame;
  }

  toString(): string {
    if (this.endOfGame) {
      return `game ended with this move ${this.movePlayed}`;
    }

    const positionScoreString = this.positionScore.score
      ? `Score: ${this.positionScore.score}`
      : `Mate in ${this.positionScore.mate}`;

    return `Move Played: ${this.movePlayed}, Next Best Move: ${this.nextMoves[0]?.move}, Position Score: ${positionScoreString}, Move Score Delta: ${this.moveScoreDelta}, Result: ${this.category}, Position: ${this.position}`;
  }
}


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
