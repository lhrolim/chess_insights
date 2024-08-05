import { MoveData, MoveCategory } from "../domain/EngineTypes";
import { MoveAnalysisDTO } from "../domain/MoveAnalysisDTO";
import { MoveAnalysisThresholds } from "../domain/MoveAnalyzisThresholds";



export class MoveAnalyzer {
  public static calculateDeltaScore(moveData: MoveData, pastScore?: MoveData): number {
    if (!pastScore) {
      return moveData.score;
    }
    if (pastScore.mate && moveData.mate) {
      return 0;
    }
    if (moveData.mate) {
      return Math.max(0, MoveAnalysisThresholds.MATE_CONSTANT - pastScore.score);
    }
    if (pastScore.mate) {
      return -moveData.score;
    }
    return moveData.score - pastScore.score;
  }

  public static analyzeMove(uciAnalysis: MoveAnalysisDTO, previousAnalyses: MoveAnalysisDTO): MoveAnalysisData {
    const whiteMove = uciAnalysis.wasWhiteMove;
    const positionScore = uciAnalysis.positionScore();
    const moveScoreDelta = MoveAnalyzer.calculateDeltaScore(positionScore, previousAnalyses?.positionScore());
    const category = MoveAnalyzer.getMoveCategory(moveScoreDelta, previousAnalyses, uciAnalysis, whiteMove);
    return { category, moveScoreDelta, positionScore };
  }

  private static getMoveCategory(
    deltaScore: number,
    previousAnalysis: MoveAnalysisDTO,
    moveAnalysis: MoveAnalysisDTO,
    whiteMove: boolean
  ): MoveCategory {
    if (checkForBookMoves(moveAnalysis)) {
      return MoveCategory.Book;
    }
    if (!previousAnalysis) {
      return MoveCategory.Ignored;
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

    const tablesTurned = moveAnalysis.didTablesTurn(previousAnalysis);
    if (tablesTurned) {
      return MoveAnalyzer.tablesTurnedScenario(moveAnalysis, normalizedDelta, whiteMove);
    }

    if (positionGotWorse) {
      return MoveAnalyzer.positionGotWorseScenario(normalizedDelta, previousAnalysis, moveAnalysis);
    }

    if (previousSuggestedMoves.includes(moveAnalysis.movePlayed)) {
      return MoveCategory.Excellent;
    }

    return normalizedDelta === 0 ? MoveCategory.Excellent : MoveCategory.Good;
  }
  static positionGotWorseScenario(
    normalizedDelta: number,
    previousAnalysis: MoveAnalysisDTO,
    moveAnalysis: MoveAnalysisDTO
  ): MoveCategory {
    const lostDecisiveAdvantage =
      previousAnalysis.hasDecisiveAdvantage(moveAnalysis.wasWhiteMove) &&
      !moveAnalysis.hasDecisiveAdvantage(moveAnalysis.wasWhiteMove);
    const keptDeciseAdvantage =
      previousAnalysis.hasDecisiveAdvantage(moveAnalysis.wasWhiteMove) &&
      moveAnalysis.hasDecisiveAdvantage(moveAnalysis.wasWhiteMove);
    const stillHasAdvantage = moveAnalysis.hasClearAdvantage(moveAnalysis.wasWhiteMove);
    const stillAboutEqual = moveAnalysis.aboutEqual();
    if (normalizedDelta > MoveAnalysisThresholds.BLUNDER_CONSTANT) {
      if (lostDecisiveAdvantage && (stillHasAdvantage || stillAboutEqual)) {
        return MoveCategory.Miss;
      }
      if (keptDeciseAdvantage) {
        return MoveCategory.Innacuracy;
      }
      if (stillHasAdvantage) {
        return MoveCategory.Mistake;
      }
      return MoveCategory.Blunder;
    }
    if (normalizedDelta > MoveAnalysisThresholds.INNACURACY_CONSTANT) {
      if (lostDecisiveAdvantage && stillHasAdvantage) {
        return MoveCategory.Innacuracy;
      }
      if (keptDeciseAdvantage) {
        return MoveCategory.Innacuracy;
      }
      return MoveCategory.Mistake;
    }
    if (normalizedDelta > MoveAnalysisThresholds.GOOD_CONSTANT) {
      return stillHasAdvantage ? MoveCategory.Good : MoveCategory.Innacuracy;
    }
    if (normalizedDelta > MoveAnalysisThresholds.EXCELLENT_CONSTANT) {
      return MoveCategory.Good;
    }
    return MoveCategory.Excellent;
  }

  private static tablesTurnedScenario(moveAnalysis: MoveAnalysisDTO, delta: number, whiteMove: boolean): MoveCategory {
    const absDelta = Math.abs(delta);
    if (moveAnalysis.aboutEqual()) {
      return MoveCategory.Miss;
    }
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

const brilliantGreatOrBest = (previousAnalyses: MoveAnalysisDTO, whiteMove: boolean): MoveCategory => {
  const deltaBetweenSuggestedMoves = previousAnalyses.deltaBetweenSuggestedMoves();
  const secondBestKeepsEquality = previousAnalyses.secondBestKeepsEquality();
  const normalizedDelta = whiteMove ? deltaBetweenSuggestedMoves : -deltaBetweenSuggestedMoves; //delta between top choices of engine
  const onlyOneLeadsToMate = previousAnalyses.onlyOneLeadsToMate();
  if (secondBestKeepsEquality) {
    return onlyOneLeadsToMate ? MoveCategory.Great : MoveCategory.Best;
  }
  if (normalizedDelta > MoveAnalysisThresholds.BRILLIANT_CONSTANT) {
    return MoveCategory.Brilliant;
  }
  if (normalizedDelta > MoveAnalysisThresholds.GREAT_CONSTANT || onlyOneLeadsToMate) {
    return MoveCategory.Great;
  }
  return MoveCategory.Best;
};

function checkForBookMoves(moveAnalysis: MoveAnalysisDTO): boolean {
  //TODO: implement a database of book moves
  return moveAnalysis.moveNumber() < MoveAnalysisThresholds.BOOK_MOVE_THRESHOLD && moveAnalysis.aboutEqual();
}
