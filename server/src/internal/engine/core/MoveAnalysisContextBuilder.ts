import { MoveData, MoveCategory } from "../domain/EngineTypes";
import { MoveAnalysisDTO } from "../domain/MoveAnalysisDTO";

export class MoveAnalysisContextBuilder {
  public static generateContext(
    moveAnalysis: MoveAnalysisDTO,
    previousAnalysis: MoveAnalysisDTO,
    deltaScore: number,
    whiteMove: boolean
  ): MoveAnalysisContext {
    const normalizedDelta = whiteMove ? -deltaScore : deltaScore; // if black is moving a positive is score is actually really bad as white is now better
    const positionGotWorse = normalizedDelta > 0;
    const previousSuggestedMoves = previousAnalysis.nextMoves.map(move => move.move);

    const lostDecisiveAdvantage =
      previousAnalysis.hasDecisiveAdvantage(moveAnalysis.wasWhiteMove) &&
      !moveAnalysis.hasDecisiveAdvantage(moveAnalysis.wasWhiteMove);
    const keptDecisiveAdvantage =
      previousAnalysis.hasDecisiveAdvantage(moveAnalysis.wasWhiteMove) &&
      moveAnalysis.hasDecisiveAdvantage(moveAnalysis.wasWhiteMove);
    const keptCompleteAdvantage =
      previousAnalysis.hasCompleteAdvantage(moveAnalysis.wasWhiteMove) &&
      moveAnalysis.hasCompleteAdvantage(moveAnalysis.wasWhiteMove);
    const stillHasAdvantage = moveAnalysis.hasClearAdvantage(moveAnalysis.wasWhiteMove);
    const stillAboutEqual = moveAnalysis.aboutEqual();
    const oponentHasDecisiveAdvantage = moveAnalysis.hasDecisiveAdvantage(!moveAnalysis.wasWhiteMove);
    const alreadyLost = previousAnalysis.alreadyLost(moveAnalysis.wasWhiteMove);
    const alreadyCompletelyLost = previousAnalysis.alreadyLost(moveAnalysis.wasWhiteMove);
    const whiteFactor = whiteMove ? 1 : -1;
    const deltaBetweenSuggestedMoves = whiteFactor * previousAnalysis.deltaBetweenSuggestedMoves();
    const secondBestKeepsEquality = previousAnalysis.secondBestKeepsEquality();
    const secondBestKeepsCompletelyWinning = previousAnalysis.hasCompleteAdvantage(whiteMove);
    const onlyOneLeadsToMate = previousAnalysis.onlyOneLeadsToMate(whiteMove);
    const amongstEngineChoices = previousSuggestedMoves.includes(moveAnalysis.movePlayed);
    const topChoice = previousSuggestedMoves[0] == moveAnalysis.movePlayed;
    const previousScore = previousAnalysis.positionScore();
    const willReceiveMateNow = !previousAnalysis.givingMate() && moveAnalysis.receivingMate();
    const willGiveMateNow = !previousAnalysis.receivingMate() && moveAnalysis.givingMate();
    return {
      previousScore,
      lostDecisiveAdvantage,
      oponentHasDecisiveAdvantage,
      keptDecisiveAdvantage,
      keptCompleteAdvantage,
      stillAboutEqual,
      stillHasAdvantage,
      alreadyLost,
      alreadyCompletelyLost,
      normalizedDelta, //delta between this and past positions
      positionGotWorse,
      secondBestKeepsEquality,
      secondBestKeepsCompletelyWinning,
      onlyOneLeadsToMate,
      deltaBetweenSuggestedMoves,
      amongstEngineChoices,
      willReceiveMateNow,
      willGiveMateNow,
      topChoice
    };
  }
}

export type MoveAnalysisData = {
  positionScore: MoveData;
  category: MoveCategory;
  moveScoreDelta: number;
};

export class MoveAnalysisContext {
  previousScore: MoveData;
  secondBestKeepsEquality: boolean;
  secondBestKeepsCompletelyWinning: boolean;
  normalizedDelta: number;
  onlyOneLeadsToMate: boolean;
  deltaBetweenSuggestedMoves: number;
  lostDecisiveAdvantage: boolean;
  keptDecisiveAdvantage: boolean;
  keptCompleteAdvantage: boolean;
  stillHasAdvantage: boolean;
  stillAboutEqual: boolean;
  alreadyLost: boolean;
  alreadyCompletelyLost: boolean;
  positionGotWorse: boolean;
  oponentHasDecisiveAdvantage: boolean;
  amongstEngineChoices: boolean;
  topChoice: boolean;
  willGiveMateNow: boolean;
  willReceiveMateNow: boolean;
}
