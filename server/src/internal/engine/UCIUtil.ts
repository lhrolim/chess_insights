import { MoveResult, MoveScore } from "./EngineTypes";

const MATE_CONSTANT = 1000;

export class UCIUtil {
  static matchesDepth(line: string, depth: number): unknown {
    if (!line.startsWith("info")) {
      return false;
    }
    const depthOfLine = line.match(/depth (\d+)/);
    const parsedLineDepth = depthOfLine ? parseInt(depthOfLine[1], 10) : 0;
    return parsedLineDepth >= depth;
  }

  public static categorizeMove(score: number, numberOfOptionsAvailableFromPrevious: number): MoveResult {
    if (score > 900) return MoveResult.Brilliant;
    else if (score > 600) return MoveResult.Great;
    else if (score > 300) return MoveResult.Best;
    else if (score > 100) return MoveResult.Good;
    else if (score > -100) return MoveResult.Innacuracy;
    else if (score > -300) return MoveResult.Mistake;
    else return MoveResult.Blunder;
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

  public static parseScore(line: string): MoveScore {
    let scoreMatch = line.match(/score cp (-?\d+)/);
    if (scoreMatch) {
      return { score: parseInt(scoreMatch[1], 10), mate: 0 };
    }

    // Try to match the "score mate" pattern
    scoreMatch = line.match(/score mate (-?\d+)/);
    if (scoreMatch) {
      return { score: null, mate: parseInt(scoreMatch[1], 10) };
    }

    return null;
  }

  public static parseMove(line: string): string {
    const moveMatch = line.match(/pv\s+([a-h][1-8][a-h][1-8](?:[qrbn])?)/);
    return moveMatch ? moveMatch[1] : "";
  }

  static isEndOfGame(outputLines: string[]): boolean {
    return outputLines.some(line => line.includes("bestmove (none)"));
  }

  static calculateDeltaScore(previousScore: number, moveScore: MoveScore): number {
    if (moveScore.mate) {
      return moveScore.mate * MATE_CONSTANT;
    }
    return previousScore - moveScore.score;
  }

  public static joinMoves(moves: string[]) {
    return moves
      .join(" ")
      .replace(/\d+\.\s*/g, "")
      .replace(/\s+/g, " ");
  }
}
