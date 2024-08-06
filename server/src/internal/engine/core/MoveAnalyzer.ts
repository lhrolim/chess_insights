import { MoveData, MoveCategory } from "../domain/EngineTypes";
import { ChessJSMoveData, DEFAULT_CHESS_JS_MOVE_DATA } from "../../chessjs/domain/ChessJSMoveData";
import { MoveAnalysisDTO } from "../domain/MoveAnalysisDTO";
import { MoveAnalysisThresholds } from "../domain/MoveAnalyzisThresholds";
import { MoveAnalysisContext, MoveAnalysisContextBuilder, MoveAnalysisData } from "./MoveAnalysisContextBuilder";

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
      //used only for scenarios where we are analyzing a game after a given move (ex: >25)
      return MoveCategory.Ignored;
    }

    const moveContext = MoveAnalysisContextBuilder.generateContext(
      moveAnalysis,
      previousAnalysis,
      deltaScore,
      whiteMove
    );

    if (previousAnalysis.givingMate(whiteMove) && !moveAnalysis.givingMate(whiteMove)) {
      //this move misses the opportunity to give it a mate
      return MoveCategory.Miss;
    }
    const bestOptionScore = previousAnalysis.nextMoves[0].data.score;
    if (moveContext.topChoice) {
      return brilliantGreatOrBest(moveContext, fenData);
    }

    const tablesTurned = moveAnalysis.didTablesTurn(previousAnalysis);
    if (tablesTurned) {
      return MoveAnalyzer.tablesTurnedScenario(moveAnalysis, moveContext);
    }

    if (moveContext.positionGotWorse) {
      return MoveAnalyzer.positionGotWorseScenario(moveAnalysis, moveContext);
    }

    if (moveContext.amongstEngineChoices) {
      return MoveCategory.Excellent;
    }

    return moveContext.normalizedDelta === 0 ? MoveCategory.Excellent : MoveCategory.Good;
  }
  static positionGotWorseScenario(moveAnalysis: MoveAnalysisDTO, moveContext: MoveAnalysisContext): MoveCategory {
    const {
      lostDecisiveAdvantage,
      keptDecisiveAdvantage,
      keptCompleteAdvantage,
      stillHasAdvantage,
      stillAboutEqual,
      alreadyLost,
      alreadyCompletelyLost,
      amongstEngineChoices,
      topChoice,
      normalizedDelta,
      willGiveMateNow,
      willReceiveMateNow
    } = moveContext;

    if (keptCompleteAdvantage) {
      if (topChoice) {
        return MoveCategory.Best;
      }

      return amongstEngineChoices || normalizedDelta <= MoveAnalysisThresholds.EXCELLENT_CONSTANT
        ? MoveCategory.Excellent
        : MoveCategory.Good;
    }

    if (willReceiveMateNow) {
      return alreadyCompletelyLost ? MoveCategory.Mistake : MoveCategory.Blunder;
    }

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
      if (alreadyCompletelyLost) {
        return MoveCategory.Innacuracy;
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
      if (alreadyCompletelyLost) {
        return MoveCategory.Good;
      }
      return alreadyLost ? MoveCategory.Innacuracy : MoveCategory.Mistake;
    }
    if (normalizedDelta > MoveAnalysisThresholds.GOOD_CONSTANT) {
      return stillHasAdvantage ? MoveCategory.Good : MoveCategory.Innacuracy;
    }
    if (normalizedDelta > MoveAnalysisThresholds.EXCELLENT_CONSTANT) {
      return MoveCategory.Good;
    }
    return MoveCategory.Excellent;
  }

  private static tablesTurnedScenario(moveAnalysis: MoveAnalysisDTO, moveContext: MoveAnalysisContext): MoveCategory {
    const delta = moveContext.normalizedDelta;
    const absDelta = Math.abs(delta);
    if (moveContext.lostDecisiveAdvantage && moveContext.stillAboutEqual) {
      return MoveCategory.Miss;
    }
    if (absDelta > MoveAnalysisThresholds.BLUNDER_CONSTANT && moveContext.oponentHasDecisiveAdvantage) {
      return MoveCategory.Blunder;
    }
    if (absDelta > MoveAnalysisThresholds.INNACURACY_CONSTANT) {
      return MoveCategory.Mistake;
    }
    return moveContext.stillAboutEqual ? MoveCategory.Good : MoveCategory.Innacuracy;
  }
}

const brilliantGreatOrBest = (
  context: MoveAnalysisContext,
  fenData: ChessJSMoveData = DEFAULT_CHESS_JS_MOVE_DATA
): MoveCategory => {
  if (
    context.alreadyCompletelyLost ||
    context.alreadyLost ||
    context.secondBestKeepsCompletelyWinning ||
    fenData.isExchangeCapture ||
    (fenData.isCapture && !fenData.isSacrifice)
  ) {
    return MoveCategory.Best;
  }

  if (fenData.isSacrifice) {
    return context.deltaBetweenSuggestedMoves > MoveAnalysisThresholds.BRILLIANT_LOWER_CONSTANT
      ? MoveCategory.Brilliant
      : MoveCategory.Great;
  }

  // if (context.deltaBetweenSuggestedMoves > MoveAnalysisThresholds.BRILLIANT_LOWER_CONSTANT) {
  //   return MoveCategory.Brilliant;
  // }

  if (context.deltaBetweenSuggestedMoves > MoveAnalysisThresholds.GREAT_LOWER_CONSTANT || context.onlyOneLeadsToMate) {
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
