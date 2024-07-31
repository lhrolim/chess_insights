import { EndOfGameMode, GameAnalyzisOptions, UCIMoveResult, MoveData, MoveCategory } from "./EngineTypes";
import { MoveAnalysisThresholds } from "./MoveAnalyzisThresholds";

export class GameAnalyzisResult {
  constructor(moves: MoveAnalysis[], consolidateMoveAnalysis: ConsolidateMoveAnalysis[]) {
    this.whiteAnalysis = consolidateMoveAnalysis[0];
    this.blackAnalysis = consolidateMoveAnalysis[1];
    this.moves = moves;
  }

  whiteAnalysis: ConsolidateMoveAnalysis;
  blackAnalysis: ConsolidateMoveAnalysis;
  moves: MoveAnalysis[];
  whitePrecision?: number;
  blackPrecision?: number;
  myFirstMistake?: MoveAnalysis;

  toJSON() {
    return {
      whiteAnalysis: this.whiteAnalysis,
      blackAnalysis: this.blackAnalysis,
      moves: this.moves,
      whitePrecision: this.whitePrecision,
      blackPrecision: this.blackPrecision,
      myFirstMistake: this.myFirstMistake
    };
  }
}

export type ConsolidateMoveAnalysis = {
  numberOfBrilliantMoves: number;
  numberOfGreatMoves: number;
  numberOfExcellentMoves: number;
  numberOfGoodMoves: number;
  numberOfInaccuracies: number;
  numberOfMistakes: number;
  numberOfBlunders: number;
  numberOfMisses: number;
  numberOfBookMoves: number;
  totalMoves: number;
};

export const createDefaultConsolidateMoveAnalysis = (): ConsolidateMoveAnalysis => ({
  numberOfBrilliantMoves: 0,
  numberOfGreatMoves: 0,
  numberOfExcellentMoves: 0,
  numberOfGoodMoves: 0,
  numberOfInaccuracies: 0,
  numberOfMistakes: 0,
  numberOfBlunders: 0,
  numberOfMisses: 0,
  numberOfBookMoves: 0,
  totalMoves: 0
});

export class MoveAnalysis {
  movePlayed: string; // e2e4
  moveScoreDelta: number; // how did the score varied after this move has been played
  category: MoveCategory;
  position?: string;
  nextMoves?: UCIMoveResult[];
  endOfGame: EndOfGameMode;
  wasWhiteMove: boolean;
  rawStockfishOutput?: string;

  // { score: 900, mate: 0 } ==> "barrilda!" should be equal of the best reply of next moves
  positionScore(): MoveData {
    return this.nextMoves[0].data;
  }

  isEndOfGame(): boolean {
    return EndOfGameMode.NONE !== this.endOfGame;
  }

  inMateWeb(): boolean {
    return this.positionScore().mate !== null && this.positionScore().mate > 0;
  }

  didTablesTurn(previousAnalyses: MoveAnalysis): boolean {
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

  hasClearAdvantage(): boolean {
    return this.wasWhiteMove
      ? this.positionScore().score > MoveAnalysisThresholds.EQUALITY_CONSTANT
      : this.positionScore().score < -MoveAnalysisThresholds.EQUALITY_CONSTANT;
  }

  hasDecisiveAdvantage(): boolean {
    return this.wasWhiteMove
      ? this.positionScore().score > MoveAnalysisThresholds.DECISIVE_ADVANTAGE
      : this.positionScore().score < -MoveAnalysisThresholds.DECISIVE_ADVANTAGE;
  }

  toString(): string {
    if (this.isEndOfGame()) {
      return `game ended with this move ${this.movePlayed}`;
    }
    const score = this.positionScore();

    const positionScoreString = score.score ? `Score: ${score.score}` : `Mate in ${score.mate}`;

    return `Move Played: ${this.movePlayed}, Next Best Move: ${this.nextMoves[0]?.move}, Position Score: ${positionScoreString}, Move Score Delta: ${this.moveScoreDelta}, Result: ${this.category}, Position: ${this.position}`;
  }
}
