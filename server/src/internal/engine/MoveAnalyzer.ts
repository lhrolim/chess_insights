import { MoveCategory, MoveData, UCIMoveResult } from "./EngineTypes";
import { MoveAnalysis } from "./GameAnalyseResult";
import { MoveAnalysisThresholds } from "./MoveAnalyzisConstants";
const MATE_CONSTANT = 10000;

export class MoveAnalyzer {
  public static calculateDeltaScore(moveData: MoveData, pastScore?: MoveData): number {
    if (!pastScore) {
      return moveData.score;
    }
    if (moveData.mate) {
      return moveData.mate * MATE_CONSTANT;
    }
    if (pastScore.mate) {
      return -moveData.score;
    }
    return moveData.score - pastScore.score;
  }

  public static analyzeMove(uciAnalysis: MoveAnalysis, previousAnalyses: MoveAnalysis): MoveAnalysisData {
    const whiteMove = uciAnalysis.wasWhiteMove;
    const positionScore = uciAnalysis.positionScore();
    const moveScoreDelta = MoveAnalyzer.calculateDeltaScore(positionScore, previousAnalyses?.positionScore());
    const category = MoveAnalyzer.getMoveCategory(moveScoreDelta, previousAnalyses, uciAnalysis, whiteMove);
    return { category, moveScoreDelta, positionScore };
  }

  private static getMoveCategory(
    deltaScore: number,
    previousAnalysis: MoveAnalysis,
    moveAnalysis: MoveAnalysis,
    whiteMove: boolean
  ): MoveCategory {
    if (!previousAnalysis) {
      return MoveCategory.Book;
    }
    const normalizedDelta = whiteMove ? -deltaScore : deltaScore; // if black is moving a positive is score is actually really bad as white is now better
    const positionGotWorse = normalizedDelta > 0;

    const previousSuggestedMoves = previousAnalysis.nextMoves.map(move => move.move);
    if (previousAnalysis.inMateWeb() && !moveAnalysis.inMateWeb()) {
      return MoveCategory.Miss;
    }
    const bestOptionScore = previousAnalysis.nextMoves[0].data.score;
    if (previousSuggestedMoves[0] == moveAnalysis.movePlayed) {
      return brilliantGreatOrBest(previousAnalysis, whiteMove);
    }
    if (previousSuggestedMoves.includes(moveAnalysis.movePlayed)) {
      return MoveCategory.Excellent;
    }
    const tablesTurned = moveAnalysis.didTablesTurn(previousAnalysis);
    if (tablesTurned) {
      return MoveAnalyzer.tablesTurnedScenario(normalizedDelta, whiteMove);
    }

    if (positionGotWorse) {
      return MoveAnalyzer.positionGotWorseScenario(normalizedDelta, previousAnalysis, moveAnalysis);
    }

    return MoveCategory.Good;
  }
  static positionGotWorseScenario(
    normalizedDelta: number,
    previousAnalysis: MoveAnalysis,
    moveAnalysis: MoveAnalysis
  ): MoveCategory {
    const lostDecisiveAdvantage = previousAnalysis.hasDecisiveAdvantage() && !moveAnalysis.hasDecisiveAdvantage();
    const stillHasAdvantage = moveAnalysis.hasClearAdvantage();
    if (normalizedDelta > MoveAnalysisThresholds.BLUNDER_CONSTANT) {
      return lostDecisiveAdvantage && stillHasAdvantage ? MoveCategory.Miss : MoveCategory.Blunder;
    }
    if (normalizedDelta > MoveAnalysisThresholds.INNACURACY_CONSTANT) {
      return lostDecisiveAdvantage && stillHasAdvantage ? MoveCategory.Miss : MoveCategory.Mistake;
    }
    if (normalizedDelta > MoveAnalysisThresholds.GOOD_CONSTANT) {
      return MoveCategory.Innacuracy;
    }
    if (normalizedDelta > MoveAnalysisThresholds.EXCELLENT_CONSTANT) {
      return MoveCategory.Good;
    }
    return MoveCategory.Excellent;
  }

  private static tablesTurnedScenario(delta: number, whiteMove: boolean): MoveCategory {
    const absDelta = Math.abs(delta);
    if (absDelta > MoveAnalysisThresholds.BLUNDER_CONSTANT) {
      return MoveCategory.Blunder;
    }
    if (absDelta > MoveAnalysisThresholds.INNACURACY_CONSTANT) {
      return MoveCategory.Mistake;
    }
    return MoveCategory.Innacuracy;
  }
}

export type MoveAnalysisData = {
  positionScore: MoveData;
  category: MoveCategory;
  moveScoreDelta: number;
};

const brilliantGreatOrBest = (previousAnalyses: MoveAnalysis, whiteMove: boolean): MoveCategory => {
  const deltaBetweenSuggestedMoves = previousAnalyses.deltaBetweenSuggestedMoves();
  const secondBestKeepsEquality = previousAnalyses.secondBestKeepsEquality();
  const normalizedDelta = whiteMove ? deltaBetweenSuggestedMoves : -deltaBetweenSuggestedMoves; //delta between top choices of engine
  if (secondBestKeepsEquality) {
    return MoveCategory.Best;
  }
  if (normalizedDelta > MoveAnalysisThresholds.BRILLIANT_CONSTANT) {
    return MoveCategory.Brilliant;
  }
  if (normalizedDelta > MoveAnalysisThresholds.GREAT_CONSTANT) {
    return MoveCategory.Great;
  }
  return MoveCategory.Best;
};
