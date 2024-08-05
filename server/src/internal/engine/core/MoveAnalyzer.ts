import { MoveData, MoveCategory } from "../domain/EngineTypes";
import { ChessJSMoveData, DEFAULT_CHESS_JS_MOVE_DATA } from "../../chessjs/domain/ChessJSMoveData";
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

  public static analyzeMove(
    uciAnalysis: MoveAnalysisDTO,
    previousAnalyses: MoveAnalysisDTO,
    fenData?: ChessJSMoveData
  ): MoveAnalysisData {
    const whiteMove = uciAnalysis.wasWhiteMove;
    const positionScore = uciAnalysis.positionScore();
    const moveScoreDelta = MoveAnalyzer.calculateDeltaScore(positionScore, previousAnalyses?.positionScore());
    const category = MoveAnalyzer.getMoveCategory(moveScoreDelta, previousAnalyses, uciAnalysis, whiteMove, fenData);
    return { category, moveScoreDelta, positionScore };
  }

  private static getMoveCategory(
    deltaScore: number,
    previousAnalysis: MoveAnalysisDTO,
    moveAnalysis: MoveAnalysisDTO,
    whiteMove: boolean,
    fenData?: ChessJSMoveData
  ): MoveCategory {
    if (checkForBookMoves(moveAnalysis)) {
      return MoveCategory.Book;
    }
    if (!previousAnalysis) {
      return MoveCategory.Ignored;
    }
    const normalizedDelta = whiteMove ? -deltaScore : deltaScore; // if black is moving a positive is score is actually really bad as white is now better
    const positionGotWorse = normalizedDelta > 0;
    const moveContext = this.generateContext(moveAnalysis, previousAnalysis, whiteMove);

    const previousSuggestedMoves = previousAnalysis.nextMoves.map(move => move.move);
    if (previousAnalysis.inMateWeb() && !moveAnalysis.inMateWeb()) {
      return MoveCategory.Miss;
    }
    const bestOptionScore = previousAnalysis.nextMoves[0].data.score;
    if (previousSuggestedMoves[0] == moveAnalysis.movePlayed) {
      return brilliantGreatOrBest(previousAnalysis, whiteMove, moveContext, fenData);
    }

    const tablesTurned = moveAnalysis.didTablesTurn(previousAnalysis);
    if (tablesTurned) {
      return MoveAnalyzer.tablesTurnedScenario(moveAnalysis, normalizedDelta, moveContext);
    }

    if (positionGotWorse) {
      return MoveAnalyzer.positionGotWorseScenario(normalizedDelta, previousAnalysis, moveAnalysis, moveContext);
    }

    if (previousSuggestedMoves.includes(moveAnalysis.movePlayed)) {
      return MoveCategory.Excellent;
    }

    return normalizedDelta === 0 ? MoveCategory.Excellent : MoveCategory.Good;
  }
  static positionGotWorseScenario(
    normalizedDelta: number,
    previousAnalysis: MoveAnalysisDTO,
    moveAnalysis: MoveAnalysisDTO,
    moveContext: MoveAnalysisContext
  ): MoveCategory {
    const { lostDecisiveAdvantage, keptDecisiveAdvantage, stillHasAdvantage, stillAboutEqual, alreadyLost } =
      moveContext;
    if (normalizedDelta > MoveAnalysisThresholds.BLUNDER_CONSTANT) {
      if (lostDecisiveAdvantage && (stillHasAdvantage || stillAboutEqual)) {
        return MoveCategory.Miss;
      }
      if (keptDecisiveAdvantage) {
        return MoveCategory.Innacuracy;
      }
      if (stillHasAdvantage) {
        return MoveCategory.Mistake;
      }
      return alreadyLost ? MoveCategory.Mistake : MoveCategory.Blunder;
    }
    if (normalizedDelta > MoveAnalysisThresholds.INNACURACY_CONSTANT) {
      if (lostDecisiveAdvantage && stillHasAdvantage) {
        return MoveCategory.Innacuracy;
      }
      if (keptDecisiveAdvantage) {
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

  private static tablesTurnedScenario(
    moveAnalysis: MoveAnalysisDTO,
    delta: number,
    moveContext: MoveAnalysisContext
  ): MoveCategory {
    const absDelta = Math.abs(delta);
    if (moveContext.stillAboutEqual) {
      return MoveCategory.Miss;
    }
    if (absDelta > MoveAnalysisThresholds.BLUNDER_CONSTANT && moveContext.oponentHasDecisiveAdvantage) {
      return MoveCategory.Blunder;
    }
    if (absDelta > MoveAnalysisThresholds.INNACURACY_CONSTANT) {
      return MoveCategory.Mistake;
    }
    return MoveCategory.Innacuracy;
  }

  private static generateContext(
    moveAnalysis: MoveAnalysisDTO,
    previousAnalysis: MoveAnalysisDTO,
    whiteMove: boolean
  ): MoveAnalysisContext {
    const lostDecisiveAdvantage =
      previousAnalysis.hasDecisiveAdvantage(moveAnalysis.wasWhiteMove) &&
      !moveAnalysis.hasDecisiveAdvantage(moveAnalysis.wasWhiteMove);
    const keptDecisiveAdvantage =
      previousAnalysis.hasDecisiveAdvantage(moveAnalysis.wasWhiteMove) &&
      moveAnalysis.hasDecisiveAdvantage(moveAnalysis.wasWhiteMove);
    const stillHasAdvantage = moveAnalysis.hasClearAdvantage(moveAnalysis.wasWhiteMove);
    const stillAboutEqual = moveAnalysis.aboutEqual();
    const oponentHasDecisiveAdvantage = moveAnalysis.hasDecisiveAdvantage(!moveAnalysis.wasWhiteMove);
    const alreadyLost = moveAnalysis.alreadyLost(moveAnalysis.wasWhiteMove);
    const deltaBetweenSuggestedMoves = previousAnalysis.deltaBetweenSuggestedMoves();
    const secondBestKeepsEquality = previousAnalysis.secondBestKeepsEquality();
    const secondBestKeepsCompletelyWinning = previousAnalysis.hasCompleteAdvantage(whiteMove);
    const normalizedDelta = whiteMove ? deltaBetweenSuggestedMoves : -deltaBetweenSuggestedMoves; //delta between top choices of engine
    const onlyOneLeadsToMate = previousAnalysis.onlyOneLeadsToMate();
    return {
      lostDecisiveAdvantage,
      oponentHasDecisiveAdvantage,
      keptDecisiveAdvantage,
      stillAboutEqual,
      stillHasAdvantage,
      alreadyLost,
      normalizedDelta,
      secondBestKeepsEquality,
      secondBestKeepsCompletelyWinning,
      onlyOneLeadsToMate,
      deltaBetweenSuggestedMoves
    };
  }
}

export type MoveAnalysisData = {
  positionScore: MoveData;
  category: MoveCategory;
  moveScoreDelta: number;
};

class MoveAnalysisContext {
  secondBestKeepsEquality: boolean;
  secondBestKeepsCompletelyWinning: boolean;
  normalizedDelta: number;
  onlyOneLeadsToMate: boolean;
  deltaBetweenSuggestedMoves: number;
  lostDecisiveAdvantage: boolean;
  keptDecisiveAdvantage: boolean;
  stillHasAdvantage: boolean;
  stillAboutEqual: boolean;
  alreadyLost: boolean;
  oponentHasDecisiveAdvantage: boolean;
}

const brilliantGreatOrBest = (
  previousAnalyses: MoveAnalysisDTO,
  whiteMove: boolean,
  context: MoveAnalysisContext,
  fenData: ChessJSMoveData = DEFAULT_CHESS_JS_MOVE_DATA
): MoveCategory => {
  if (context.normalizedDelta > MoveAnalysisThresholds.BRILLIANT_CONSTANT && fenData?.isSacrifice) {
    return MoveCategory.Brilliant;
  }

  if (context.alreadyLost || context.secondBestKeepsCompletelyWinning) {
    return MoveCategory.Best;
  }

  if (context.normalizedDelta > MoveAnalysisThresholds.GREAT_CONSTANT || context.onlyOneLeadsToMate) {
    return MoveCategory.Great;
  }

  if (context.secondBestKeepsEquality) {
    return context.onlyOneLeadsToMate ? MoveCategory.Great : MoveCategory.Best;
  }

  return MoveCategory.Best;
};

function checkForBookMoves(moveAnalysis: MoveAnalysisDTO): boolean {
  //TODO: implement a database of book moves
  return moveAnalysis.moveNumber() < MoveAnalysisThresholds.BOOK_MOVE_THRESHOLD && moveAnalysis.aboutEqual();
}
