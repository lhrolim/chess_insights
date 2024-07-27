import { MoveAnalysis } from "../GameAnalyseResult";
import { UCIMoveResult } from "../EngineTypes";

export class MoveAnalysisPOTO {
  public static inMateWeb(): MoveAnalysis {
    const moveAnalysis = new MoveAnalysis();
    moveAnalysis.positionScore = { score: 900, mate: 3 };
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: 900, mate: 2 } },
      { move: "d6d8", data: { score: 900, mate: 4 } }
    ];
    return moveAnalysis;
  }
}
