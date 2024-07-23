import { MoveAnalysis } from "./EngineTypes";

export type GameAnalyzisResult = {
  moves: MoveAnalysis[];
  whitePrecision?: number;
  blackPrecision?: number;
  myFirstMistake?: MoveAnalysis;
  consolidateMoveAnalysis?: ConsolidateMoveAnalysis;
};

export type ConsolidateMoveAnalysis = {
  numberOfBrilliantMoves: number;
  numberOfGreatMoves: number;
  numberOfExcellentMoves: number;
  numberOfGoodMoves: number;
  numberOfInaccuracies: number;
  numberOfMistakes: number;
  numberOfBlunders: number;
  numberOfMisses: number;
  totalMoves: number;
};
