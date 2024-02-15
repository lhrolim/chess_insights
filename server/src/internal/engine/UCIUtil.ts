import { MoveResult } from "./StockfishClient";

export class UCIUtil {
  static matchesDepth(line: string, depth: number): unknown {
    if (!line.startsWith("info")){
      return false;
    } 
    const depthOfLine = line.match(/depth (\d+)/);
    const parsedLineDepth = depthOfLine ? parseInt(depthOfLine[1], 10) : 0;
    return parsedLineDepth >= depth;
  }

  public static categorizeMove(score: number): MoveResult {
    if (score > 900) return MoveResult.Brilliant;
    else if (score > 600) return MoveResult.Great;
    else if (score > 300) return MoveResult.Best;
    else if (score > 100) return MoveResult.Good;
    else if (score > -100) return MoveResult.Innacuracy;
    else if (score > -300) return MoveResult.Mistake;
    else return MoveResult.Blunder;
  }

  public static getRecommendedDepth(moveNumber: number, informedDepth: number): number {
    if (moveNumber < 5) return 5;
    if (moveNumber > 5 && moveNumber < 10) return Math.min(informedDepth, 10);
    return informedDepth;
  }

  public static getRecommendedLines(moveNumber: number, lines: number): number {
    if (moveNumber < 5) return 1;
    return Math.min(lines, 3);
  }
}
