import { ChessJSMoveData } from "@internal/chessjs/domain/ChessJSMoveData";
import { EngineMove } from "@internal/engine/domain/EngineInput";
import { ChessJSUtil } from "./ChessJSDataUtil";

import { Chess } from "chess.js";

export class MoveUtil {
  public static shouldSkipMove(i: number, startMove: number): MoveSkipData {
    //adding one as the array begins at 0
    const shouldSkipEntirely = Math.ceil((i + 1) / 2) <= startMove - 2;
    const shouldSkipOnlyResult = Math.ceil((i + 1) / 2) <= startMove - 1;
    return { shouldSkipEntirely, shouldSkipOnlyResult };
  }

  public static buildEngineMoves = (moves: PGNMove[] | string[]): EngineMove[] => {
    const chess = new Chess();
    const engineMoves = Array<EngineMove>();
    let startPos = "";
    let chessJSMoveData: ChessJSMoveData = null;
    moves.forEach(pgnMove => {
      let adjustedMove: PGNMove;

      if (typeof pgnMove === "string") {
        // If move is a string, create a PGNMove with an empty clock
        adjustedMove = { move: pgnMove, timeTaken: NaN };
      } else {
        // If move is already a PGNMove, use it directly
        adjustedMove = pgnMove;
      }
      const move = adjustedMove.move;
      chessJSMoveData = ChessJSUtil.getFenData(chess, move, chessJSMoveData);
      startPos += " " + chessJSMoveData.coordinatedMove;
      engineMoves.push(
        new EngineMove(chessJSMoveData.coordinatedMove, chessJSMoveData.fen, startPos.trim(), adjustedMove.timeTaken)
      );
    });

    return engineMoves;
  };
}

export type MoveSkipData = {
  shouldSkipEntirely: boolean;
  shouldSkipOnlyResult: boolean;
};

export type PGNMove = {
  move: string;
  timeTaken: number;
};
