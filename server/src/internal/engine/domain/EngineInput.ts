import { parseMovesFromPGN } from "@internal/util/pgnparserutil";
import { UCIUtil } from "../util/UCIUtil";
import { ChessJSMoveData } from "../../chessjs/domain/ChessJSMoveData";
import { MoveUtil } from "@internal/util/MoveUtil";

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
    const moves = new Array<EngineMove>();
    moves.push(new EngineMove(null, fen, null));
    return new EngineInput(fen, null, moves);
  }

  public static fromMoves(moves: string[]): EngineInput {
    const startPos = UCIUtil.getStartPositionFromMoves(moves);
    const engineMoves = MoveUtil.buildEngineMoves(moves);
    return new EngineInput(null, startPos, engineMoves);
  }

  public static fromStartPos(startPos: string): EngineInput {
    const moves = UCIUtil.getMovesFromStartPosition(startPos);
    return new EngineInput(undefined, startPos, MoveUtil.buildEngineMoves(moves));
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
  timeTook?: number; //time it took in millis to perform this move
  whiteMove?: boolean = undefined;
  pieceSacrificed?: boolean;
  fenData?: ChessJSMoveData; //data that could be extracted just by checking the fen, before any engine analysis

  constructor(
    move: string,
    fenPosition: string,
    cumulativeStartPos: string,
    timeTook?: number,
    fenData?: ChessJSMoveData
  ) {
    this.move = move;
    this.fenPosition = fenPosition;
    this.cumulativeStartPos = cumulativeStartPos;
    this.timeTook = timeTook;
    this.whiteMove = this.isWhiteToMove();
    this.fenData = fenData;
  }

  public lastMove(): string {
    if (!this.cumulativeStartPos) {
      return null;
    }
    return this.cumulativeStartPos.trim().split(" ").pop();
  }

  public isWhiteToMove(): boolean {
    if (this.whiteMove !== undefined) {
      return this.whiteMove;
    }
    if (this.fenPosition) {
      return this.fenPosition.split(" ")[1] === "w";
    }
    return this.cumulativeStartPos.trim().split(" ").length % 2 === 0;
  }
}
