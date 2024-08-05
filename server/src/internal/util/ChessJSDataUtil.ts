import { ChessJSMoveData as ChessJSMoveData } from "@internal/chessjs/domain/ChessJSMoveData";
import { Chess, Color, Move, Square } from "chess.js";

const pieceValues = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0
};

export class ChessJSUtil {
  public static getChessJSData(chess: Chess, move: string, previousMove?: ChessJSMoveData): ChessJSMoveData {
    const validMove = chess.move(move);
    if (!validMove) {
      throw new Error("Invalid move");
    }
    const { from, to } = validMove;
    const coordinateMove = from + to;
    const isCapture = move.includes("x");
    const isSacrifice = this.isSacrifice(chess, validMove);
    // const materialAfter = ChessJSUtil.evaluateMaterial(chess);
    return {
      coordinatedMove: coordinateMove,
      fen: chess.fen(),
      isCapture,
      isSacrifice
    };
  }

  static isSacrifice(chess: Chess, validMove: Move): boolean {
    const piecePoints = pieceValues[validMove.piece];
    const capturedPoints = validMove.captured ? pieceValues[validMove.captured] : 0;

    // Calculate attackers and supporters after the move
    const opponentColor = validMove.color === "w" ? "b" : "w";
    const opponentAttackers = chess.attackers(validMove.to, opponentColor);
    const supporters = chess.attackers(validMove.to, validMove.color);
    if (opponentAttackers.length === 0) {
      return false;
    }
    if (capturedPoints >= piecePoints) {
      return false;
    }

    // Simulate exchanges
    return this.simulateExchanges(chess, validMove, opponentAttackers, supporters, piecePoints, capturedPoints);
  }

  private static simulateExchanges(
    chess: Chess,
    validMove: Move,
    opponentAttackers: Square[],
    supporters: Square[],
    piecePoints: number,
    capturedPoints: number
  ): boolean {
    // Get values of opponent attackers
    const opponentAttackerValues = opponentAttackers
      .map(square => {
        const piece = chess.get(square);
        return piece ? pieceValues[piece.type] : 0;
      })
      .sort((a, b) => a - b);

    // Get values of supporters
    const supporterValues = supporters
      .map(square => {
        const piece = chess.get(square);
        return piece ? pieceValues[piece.type] : 0;
      })
      .sort((a, b) => a - b);

    let netLoss = -capturedPoints;
    let supporterIndex = 0;

    for (let attackerValue of opponentAttackerValues) {
      if (supporterIndex < supporterValues.length) {
        netLoss += attackerValue - supporterValues[supporterIndex++];
      } else {
        netLoss += attackerValue;
      }

      // If at any point the net loss is positive, it is a sacrifice
      if (netLoss > 0) {
        return true;
      }
    }

    return false;
  }
}
