import { ChessJSMoveData as ChessJSMoveData } from "@internal/chessjs/domain/ChessJSMoveData";
import { Chess, Color } from "chess.js";

const pieceValues = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0
};

export class ChessJSUtil {
  public static getFenData(chess: Chess, move: string, previousMove?: ChessJSMoveData): ChessJSMoveData {
    const materialBefore = previousMove ? previousMove.materialAfter : 0; //initial move, material equal
    const validMove = chess.move(move);
    if (!validMove) {
      throw new Error("Invalid move");
    }
    const { from, to } = validMove;
    const coordinateMove = from + to;
    chess.isAttacked("e4", "w");
    // const materialAfter = ChessJSUtil.evaluateMaterial(chess);
    return {
      coordinatedMove: coordinateMove,
      fen: chess.fen()
    };
  }

  private static evaluateMaterial(chess: Chess): number {
    // Calculate material value for both sides
    let materialValue = 0;
    const board = chess.board();
    board.forEach(row => {
      row.forEach(piece => {
        if (piece) {
          const value = pieceValues[piece.type];
          materialValue += piece.color === "w" ? value : -value;
        }
      });
    });

    return materialValue;
  }
}
