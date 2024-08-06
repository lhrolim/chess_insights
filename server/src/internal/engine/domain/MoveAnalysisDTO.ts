import { time } from "console";
import { MoveCategory, UCIMoveResult, EndOfGameMode, MoveData } from "./EngineTypes";
import { MoveAnalysisThresholds } from "./MoveAnalyzisThresholds";

export type MoveAnalysisDTOForPrecision = {
  moveScoreDelta: number;
  category: MoveCategory;
  wasWhiteMove: boolean;
  endofGame?: EndOfGameMode;
};

export class MoveAnalysisDTO {
  movePlayed: string; // e2e4
  moveScoreDelta: number; // how did the score varied after this move has been played from a white perspective
  category: MoveCategory;
  position?: string;
  nextMoves?: Array<UCIMoveResult>;
  endOfGame: EndOfGameMode;
  wasWhiteMove: boolean;
  rawStockfishOutput?: string;
  timeTook?: number;

  // { score: 900, mate: 0 } ==> "barrilda!" should be equal of the best reply of next moves
  positionScore(): MoveData {
    if (this.endOfGame === EndOfGameMode.MATE || !this.nextMoves) {
      return new MoveData(0, 0, this.wasWhiteMove);
    }
    return this.nextMoves[0].data;
  }

  isEndOfGame(): boolean {
    return EndOfGameMode.NONE !== this.endOfGame;
  }

  givingMate(perspective?: boolean): boolean {
    let perspectiveToUse = perspective ?? this.wasWhiteMove;
    return this.positionScore().isMate(perspectiveToUse);
  }

  receivingMate(perspective?: boolean): any {
    let perspectiveToUse = perspective ?? this.wasWhiteMove;
    return this.positionScore().isMate(!perspectiveToUse);
  }

  onlyOneLeadsToMate(perspective?: boolean): boolean {
    let perspectiveToUse = perspective ?? this.wasWhiteMove;
    if (this.nextMoves.length < 2) {
      return this.givingMate(perspectiveToUse);
    }
    return this.givingMate(perspectiveToUse) && !this.nextMoves[1].data.isMate(perspectiveToUse);
  }

  didTablesTurn(previousAnalyses: MoveAnalysisDTO): boolean {
    const thisMoveScore = this.positionScore().score;
    const pastMoveScore = previousAnalyses.positionScore().score;
    if (this.wasWhiteMove) {
      return thisMoveScore < 0 && pastMoveScore > 0;
    }
    return pastMoveScore < 0 && thisMoveScore > 0;
  }

  hasOnlyOneKeepingAdvantage(): boolean {
    if (this.nextMoves.length < 2) {
      return this.nextMoves[0].data.score > 0;
    }
    const bestScore = this.nextMoves[0].data.score;
    const secondBestScore = this.nextMoves[1].data.score;
    if (this.wasWhiteMove) {
      return bestScore > 0 && secondBestScore < 0;
    }
    return bestScore < 0 && secondBestScore > 0;
  }

  secondBestKeepsEquality() {
    if (this.nextMoves.length < 2) {
      return true;
    }
    return Math.abs(this.nextMoves[1].data.score) <= MoveAnalysisThresholds.EQUALITY_CONSTANT;
  }

  deltaBetweenSuggestedMoves(): number {
    if (this.nextMoves.length < 2) {
      return 0;
    }
    return this.nextMoves[0].data.score - this.nextMoves[1].data.score;
  }

  aboutEqual(): boolean {
    return Math.abs(this.positionScore().score) <= MoveAnalysisThresholds.EQUALITY_CONSTANT;
  }

  hasClearAdvantage(whitePerspective: boolean): boolean {
    return whitePerspective
      ? this.positionScore().score > MoveAnalysisThresholds.EQUALITY_CONSTANT
      : this.positionScore().score < -MoveAnalysisThresholds.EQUALITY_CONSTANT;
  }

  hasDecisiveAdvantage(whitePerspective: boolean): boolean {
    return whitePerspective
      ? this.positionScore().score > MoveAnalysisThresholds.DECISIVE_ADVANTAGE
      : this.positionScore().score < -MoveAnalysisThresholds.DECISIVE_ADVANTAGE;
  }

  hasCompleteAdvantage(whitePerspective: boolean): boolean {
    return whitePerspective
      ? this.positionScore().score > MoveAnalysisThresholds.COMPLETE_ADVANTAGE
      : this.positionScore().score < -MoveAnalysisThresholds.COMPLETE_ADVANTAGE;
  }

  alreadyLost(whitePerspective: boolean): boolean {
    return whitePerspective
      ? this.positionScore().score < -MoveAnalysisThresholds.DECISIVE_ADVANTAGE
      : this.positionScore().score > MoveAnalysisThresholds.DECISIVE_ADVANTAGE;
  }

  alreadyCompletelyLost(whitePerspective: boolean): boolean {
    return whitePerspective
      ? this.positionScore().score < -MoveAnalysisThresholds.COMPLETE_ADVANTAGE
      : this.positionScore().score > MoveAnalysisThresholds.COMPLETE_ADVANTAGE;
  }

  pointsLost(): number {
    return this.wasWhiteMove ? this.moveScoreDelta : -1 * this.moveScoreDelta;
  }

  moveNumber(): number {
    if (!this.position) {
      return 0;
    }
    return Math.ceil(this.position.split(" ").length / 2);
  }

  toString(): string {
    if (this.isEndOfGame()) {
      return `game ended with this move ${this.movePlayed}`;
    }
    const score = this.positionScore();

    const positionScoreString = score.score ? `Score: ${score.score}` : `Mate in ${score.mate}`;

    return `Move Played: ${this.movePlayed}, Best Reply Move: ${this.nextMoves[0]?.move}, Position Score: ${positionScoreString}, Move Score Delta: ${this.moveScoreDelta}, Result: ${this.category}, Position: ${this.position}`;
  }

  previousScore(): number {
    const delta = this.moveScoreDelta || 0;
    return this.positionScore().score - delta;
  }

  toJSON() {
    return {
      movePlayed: this.movePlayed,
      previousScore: this.previousScore(),
      positionScore: this.positionScore().score,
      moveScoreDelta: this.moveScoreDelta,
      timeTook: this.timeTook,
      moveNumber: this.moveNumber(),
      category: this.category,
      position: this.position,
      nextMoves: this.nextMoves,
      endOfGame: this.endOfGame,
      wasWhiteMove: this.wasWhiteMove
    };
  }

  getSimplifiedDTOForPrecision(): MoveAnalysisDTOForPrecision {
    return {
      moveScoreDelta: this.moveScoreDelta,
      category: this.category,
      wasWhiteMove: this.wasWhiteMove,
      endofGame: this.endOfGame
    };
  }
}
