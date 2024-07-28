import { UCIUtil } from "./UCIUtil";
import { parseMovesFromPGN, buildEngineMoves } from "@internal/util/pgnparserutil";

export class EngineInput {
  moves: EngineMove[];
  // fen?: string;
  // startPos?: string;

  private constructor(fen?: string, startPos?: string, moves: EngineMove[] = []) {
    // this.fen = fen;
    // this.startPos = startPos;
    this.moves = moves;
  }

  public static fromFen(fen: string): EngineInput {
    return new EngineInput(fen);
  }

  public static fromMoves(moves: string[]): EngineInput {
    const startPos = UCIUtil.getStartPositionFromMoves(moves);
    const engineMoves = buildEngineMoves(moves);
    return new EngineInput(null, startPos, engineMoves);
  }

  public static fromStartPos(startPos: string): EngineInput {
    const moves = UCIUtil.getMovesFromStartPosition(startPos);
    return new EngineInput(undefined, startPos, buildEngineMoves(moves));
  }

  public static fromPGN(pgn: string): EngineInput {
    const moves = parseMovesFromPGN(pgn);
    return new EngineInput(undefined, undefined, moves);
  }
}

export class EngineMove {
  move: string;
  fenPosition: string;
  cumulativeStartPos: string;

  constructor(move: string, fenPosition: string, cumulativeStartPos: string) {
    this.move = move;
    this.fenPosition = fenPosition;
    this.cumulativeStartPos = cumulativeStartPos;
  }

  public lastMove(): string {
    if (!this.cumulativeStartPos) {
      return null;
    }
    return this.cumulativeStartPos.trim().split(" ").pop();
  }

  public isWhiteToMove(): boolean {
    if (this.cumulativeStartPos) {
      return this.cumulativeStartPos.length % 2 === 0;
    } else if (this.fenPosition) {
      return this.fenPosition.split(" ")[1] === "w";
    }
    return this.cumulativeStartPos.trim().split(" ").length % 2 === 0;
  }
};