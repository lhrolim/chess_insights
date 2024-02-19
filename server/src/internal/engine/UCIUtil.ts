import { EndOfGameMode, MoveCategory, MoveScore } from "./EngineTypes";

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

  public static categorizeMove(score: number, numberOfOptionsAvailableFromPrevious: number): MoveCategory {
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

  public static parseScore(line: string, isWhiteToMove: boolean): MoveScore {
    let scoreMatch = line.match(/score cp (-?\d+)/);
    let result = {isWhiteToMove: isWhiteToMove};
    if (scoreMatch) {
      const cpScore = parseInt(scoreMatch[1], 10);
      return { score: cpScore, mate: null, isWhiteToMove };
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

  static isEndOfGame(outputLines: string[], isWhiteToMove:boolean): EndOfGameMode {
    const isEndOfGame = outputLines.some(line => line.includes("bestmove (none)"));
    if (!isEndOfGame) {
      return EndOfGameMode.NONE;
    }
    for (const line of outputLines) {
      const score = this.parseScore(line,isWhiteToMove);
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

  static calculateDeltaScore(moveScore: MoveScore, pastScore?: MoveScore): number {
    if (moveScore.mate) {
      return moveScore.mate * MATE_CONSTANT;
    }
    if (pastScore.mate) {
      return -moveScore.score;
    }
    return pastScore.score - moveScore.score;
  }

  public static joinMoves(moves: string[]) {
    return moves
      .join(" ")
      .replace(/\d+\.\s*/g, "")
      .replace(/\s+/g, " ");
  }
}
