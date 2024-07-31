import { MoveCategory } from "@internal/engine/EngineTypes";
import {
  ConsolidateMoveAnalysis,
  createDefaultConsolidateMoveAnalysis,
  GameAnalyzisResult,
  MoveAnalysis
} from "@internal/engine/GameAnalyseResult";

export class GameAnalyzerBuilder {
  public static buildConsolidatedAnalysis(engineMoveResults: MoveAnalysis[]): Array<ConsolidateMoveAnalysis> {
    const result = new Array<ConsolidateMoveAnalysis>();
    const whiteAnalysis = createDefaultConsolidateMoveAnalysis();
    const blackAnalysis = createDefaultConsolidateMoveAnalysis();
    result.push(whiteAnalysis);
    result.push(blackAnalysis);
    // this.consolidateMoveAnalysis.totalMoves = this.moves.length;
    engineMoveResults.forEach(move => {
      let analysis = move.wasWhiteMove ? whiteAnalysis : blackAnalysis;
      analysis.totalMoves++;
      switch (move.category) {
        case MoveCategory.Book:
          analysis.numberOfBookMoves++;
          break;
        case MoveCategory.Brilliant:
          analysis.numberOfBrilliantMoves++;
          break;
        case MoveCategory.Great:
          analysis.numberOfGreatMoves++;
          break;
        case MoveCategory.Excellent:
          analysis.numberOfExcellentMoves++;
          break;
        case MoveCategory.Good:
          analysis.numberOfGoodMoves++;
          break;
        case MoveCategory.Innacuracy:
          analysis.numberOfInaccuracies++;
          break;
        case MoveCategory.Mistake:
          analysis.numberOfMistakes++;
          break;
        case MoveCategory.Blunder:
          analysis.numberOfBlunders++;
          break;
        case MoveCategory.Miss:
          analysis.numberOfMisses++;
          break;
      }
    });
    return result;
  }
}
