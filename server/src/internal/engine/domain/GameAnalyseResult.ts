import { MoveAnalysisDTO } from "./MoveAnalysisDTO";

export class GameAnalyzisResult {
  constructor(moves: MoveAnalysisDTO[], consolidateMoveAnalysis: ConsolidateMoveAnalysis[]) {
    this.whiteAnalysis = consolidateMoveAnalysis[0];
    this.blackAnalysis = consolidateMoveAnalysis[1];
    this.moves = moves;
  }

  whiteAnalysis: ConsolidateMoveAnalysis;
  blackAnalysis: ConsolidateMoveAnalysis;
  moves: MoveAnalysisDTO[];
  whitePrecision?: number;
  blackPrecision?: number;
  myFirstMistake?: MoveAnalysisDTO;

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
  numberOfBestMoves: number;
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
  numberOfBestMoves: 0,
  numberOfExcellentMoves: 0,
  numberOfGoodMoves: 0,
  numberOfInaccuracies: 0,
  numberOfMistakes: 0,
  numberOfBlunders: 0,
  numberOfMisses: 0,
  numberOfBookMoves: 0,
  totalMoves: 0
});
