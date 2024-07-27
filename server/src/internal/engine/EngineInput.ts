import { UCIUtil } from "./UCIUtil";
import { parseMovesFromPGN } from "@internal/util/pgnparserutil";

export class EngineInput {
  moves: string[];
  fen?: string;
  startPos?: string;

  private constructor(fen?: string, startPos?: string, moves: string[] = []) {
    this.fen = fen;
    this.startPos = startPos;
    this.moves = moves;
  }

  // public static fromFen(fen: string): EngineInput {
  //   return new EngineInput(fen);
  // }
  public static fromMoves(moves: string[]): EngineInput {
    const startPos = UCIUtil.getStartPositionFromMoves(moves);
    return new EngineInput(null, startPos, moves);
  }
  public static fromStartPos(startPos: string): EngineInput {
    return new EngineInput(undefined, startPos, UCIUtil.getMovesFromStartPosition(startPos));
  }

  public static fromPGN(pgn: string): EngineInput {
    const moves = parseMovesFromPGN(pgn);
    return this.fromMoves(moves);
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
