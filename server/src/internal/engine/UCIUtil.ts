import { EndOfGameMode, MoveCategory, MoveData, UCIMoveResult, UCIResult } from "./EngineTypes";
import { MoveAnalysis } from "./GameAnalyseResult";

const MATE_CONSTANT = 10000;

export class UCIUtil {
  static matchesDepth(line: string, depth: number): unknown {
    if (!line.startsWith("info")) {
      return false;
    }
    const depthOfLine = line.match(/depth (\d+)/);
    const parsedLineDepth = depthOfLine ? parseInt(depthOfLine[1], 10) : 0;
    return parsedLineDepth >= depth;
  }

  public static categorizeMove(result: MoveAnalysis, previousAnalyses: MoveAnalysis): MoveCategory {
    if (!previousAnalyses) {
      return MoveCategory.Book;
    }
    const score = result.moveScoreDelta;
    const previousSuggestedMoves = previousAnalyses.nextMoves.map(move => move.move);
    if (previousAnalyses.inMateWeb() && !result.inMateWeb()) {
      return MoveCategory.Miss;
    }
    if (previousSuggestedMoves[0] == result.movePlayed) {
      return MoveCategory.Best;
    }
    if (previousSuggestedMoves.includes(result.movePlayed)) {
      return MoveCategory.Great;
    }
    if (score > 900) return MoveCategory.Brilliant;
    else if (score > 600) return MoveCategory.Great;
    else if (score > 300) return MoveCategory.Best;
    else if (score > 100) return MoveCategory.Good;
    else if (score > -100) return MoveCategory.Innacuracy;
    else if (score > -300) return MoveCategory.Mistake;
    else return MoveCategory.Blunder;
  }

  public static getRecommendedDepth(moveNumber: number, informedDepth: number): number {
    if (moveNumber < 5) return 20;
    if (moveNumber > 5 && moveNumber < 10) return Math.min(informedDepth, 20);
    return informedDepth;
  }

  public static getRecommendedLines(moveNumber: number, lines: number): number {
    if (moveNumber < 5) return 1;
    return Math.min(lines, 3);
  }

  public static parseScore(line: string, isWhiteToMove: boolean): MoveData {
    let scoreMatch = line.match(/score cp (-?\d+)/);
    let result = { isWhiteToMove: isWhiteToMove };
    if (scoreMatch) {
      const cpScore = parseInt(scoreMatch[1], 10);
      const whitePerspectiveScore = isWhiteToMove ? cpScore : -cpScore;
      return { score: whitePerspectiveScore, mate: null, isWhiteToMove };
    }

    // Try to match the "score mate" pattern
    scoreMatch = line.match(/score mate (-?\d+)/);
    if (scoreMatch) {
      return { score: null, mate: parseInt(scoreMatch[1], 10), isWhiteToMove };
    }

    return null;
  }

  public static parseMove(line: string): string {
    const moveMatch = line.match(/pv\s+([a-h][1-8][a-h][1-8](?:[qrbn])?)/);
    return moveMatch ? moveMatch[1] : "";
  }

  static isEndOfGame(output: string, isWhiteToMove: boolean): EndOfGameMode {
    const outputLines = output.split("\n");
    const isEndOfGame = outputLines.some(line => line.includes("bestmove (none)"));
    if (!isEndOfGame) {
      return EndOfGameMode.NONE;
    }
    for (const line of outputLines) {
      const score = this.parseScore(line, isWhiteToMove);
      if (!score) {
        continue;
      }
      if (score.score === 0) {
        return EndOfGameMode.STALEMATE;
      }
      return EndOfGameMode.MATE;
    }
    return EndOfGameMode.MATE;
  }

  public static parseUCIResult(uciAnswer: string, depth: number, isWhiteToMove: boolean): UCIResult {
    const endOfGameCheck = UCIUtil.isEndOfGame(uciAnswer, isWhiteToMove);
    if (endOfGameCheck && endOfGameCheck !== EndOfGameMode.NONE) {
      console.log("Received:\n" + uciAnswer);
      return { moves: [], endOfGame: endOfGameCheck, ignored: false };
    }
    const filteredLines = uciAnswer.split("\n").filter(line => UCIUtil.matchesDepth(line, depth));
    if (filteredLines.length === 0) {
      return { moves: [], endOfGame: endOfGameCheck, ignored: true };
    }
    console.log("Received:\n" + filteredLines);
    const movesResult: UCIMoveResult[] = [];
    for (const line of filteredLines) {
      //if multipv is enabled we will have several move options
      const score = UCIUtil.parseScore(line, isWhiteToMove);
      const move = UCIUtil.parseMove(line);
      movesResult.push({ move, data: score });
    }
    movesResult.sort((a, b) => {
      const firstElement = isWhiteToMove ? b : a;
      const secondElement = isWhiteToMove ? a : b;
      const mateScore = isWhiteToMove ? MATE_CONSTANT : -MATE_CONSTANT;
      const firstElementScore = firstElement.data.score || mateScore;
      const secondElementScore = secondElement.data.score || mateScore;
      return firstElementScore - secondElementScore;
    });
    return { moves: movesResult, endOfGame: endOfGameCheck, ignored: false };
  }

  static calculateDeltaScore(moveData: MoveData, pastScore?: MoveData): number {
    if (moveData.mate) {
      return moveData.mate * MATE_CONSTANT;
    }
    if (pastScore.mate) {
      return -moveData.score;
    }
    return pastScore.score - moveData.score;
  }

  public static joinMoves(moves: string[]) {
    return moves
      .join(" ")
      .replace(/\d+\.\s*/g, "")
      .replace(/\s+/g, " ");
  }
}
