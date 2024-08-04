import getLogger, { LogTypes } from "@infra/logging/logger";
import { EndOfGameMode, MoveCategory, MoveData, UCIMoveResult, UCIResult } from "../domain/EngineTypes";
import { MoveAnalysisThresholds } from "../domain/MoveAnalyzisThresholds";
const logger = getLogger(__filename, LogTypes.Analysis);

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

  public static getRecommendedDepth(moveNumber: number, informedDepth: number): number {
    if (moveNumber < MoveAnalysisThresholds.OPENING_THRESHOLD) {
      return Math.min(informedDepth, 10); // limiting initial moves to lower depth to make it faster
    }
    if (moveNumber > 5 && moveNumber < 10) {
      return Math.min(informedDepth, 20);
    }
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
      return new MoveData(whitePerspectiveScore, null, isWhiteToMove);
    }

    // Try to match the "score mate" pattern
    scoreMatch = line.match(/score mate (-?\d+)/);
    if (scoreMatch) {
      return new MoveData(null, parseInt(scoreMatch[1], 10), isWhiteToMove);
    }

    return null;
  }

  public static parseMove(line: string): string {
    const moveMatch = line.match(/pv\s+([a-h][1-8][a-h][1-8](?:[qrbn])?)/);
    return moveMatch ? moveMatch[1] : "";
  }

  private static logHashInfo(response: string): void {
    const hashfullMatch = response.match(/hashfull (\d+)/);
    const tbhitsMatch = response.match(/tbhits (\d+)/);

    if (hashfullMatch) {
      const hashfull = parseInt(hashfullMatch[1], 10);
      // logger.debug(`Hash table fullness: ${hashfull / 10}%`);
    }

    if (tbhitsMatch) {
      const tbhits = parseInt(tbhitsMatch[1], 10);
      // logger.debug(`Transposition table hits: ${tbhits}`);
    }
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

  public static parseUCIResult(uciAnswer: string, depth: number, areRepliesWhiteMoves: boolean): UCIResult {
    const endOfGameCheck = UCIUtil.isEndOfGame(uciAnswer, areRepliesWhiteMoves);
    this.logHashInfo(uciAnswer);
    if (endOfGameCheck && endOfGameCheck !== EndOfGameMode.NONE) {
      logger.debug("Received:\n" + uciAnswer);
      return { moves: [], endOfGame: endOfGameCheck, ignored: false };
    }
    let filteredLines = uciAnswer.split("\n").filter(line => UCIUtil.matchesDepth(line, depth));
    filteredLines = filteredLines.filter(line => !line.includes("currmovenumber"));
    if (filteredLines.length === 0) {
      return { moves: [], endOfGame: endOfGameCheck, ignored: true };
    }
    logger.debug("Received:\n" + filteredLines);
    const movesResult = new Array<UCIMoveResult>();
    for (const line of filteredLines) {
      //if multipv is enabled we will have several move options
      const score = UCIUtil.parseScore(line, areRepliesWhiteMoves);
      if (score != null) {
        const move = UCIUtil.parseMove(line);
        movesResult.push(new UCIMoveResult(move, score));
      }
    }
    movesResult.sort((a, b) => {
      const firstElement = areRepliesWhiteMoves ? b : a;
      const secondElement = areRepliesWhiteMoves ? a : b;
      // const mateScore = areRepliesWhiteMoves ? MATE_CONSTANT : -MATE_CONSTANT;
      const firstElementScore = this.getScoreConsideringMate(areRepliesWhiteMoves, firstElement.data);
      const secondElementScore = this.getScoreConsideringMate(areRepliesWhiteMoves, secondElement.data);
      return firstElementScore - secondElementScore;
    });
    return { moves: movesResult, endOfGame: endOfGameCheck, ignored: false };
  }

  public static getScoreConsideringMate(areRepliesWhiteMoves: boolean, moveData: MoveData) {
    if (moveData.score != null) {
      return moveData.score;
    }
    const mateIn = moveData.mate; //positive means I am giving mate, and negative I am receiving it
    return areRepliesWhiteMoves ? mateIn * MATE_CONSTANT : -mateIn * MATE_CONSTANT;
  }

  public static getStartPositionFromMoves(moves: string[]): string {
    return moves
      .join(" ")
      .replace(/\d+\.\s*/g, "")
      .replace(/\s+/g, " ");
  }

  public static getMovesFromStartPosition(startPosition: string): string[] {
    return startPosition.split(" ");
  }
}
