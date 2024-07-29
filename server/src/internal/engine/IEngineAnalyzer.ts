import { GameAnalyzisOptions } from "./EngineTypes";
import { GameAnalyzisResult, MoveAnalysis } from "./GameAnalyseResult";
import { EngineInput, EngineMove } from "./EngineInput";

export interface IEngineAnalyzer {
  analyzeGame(EngineInput: EngineInput, options?: GameAnalyzisOptions): Promise<GameAnalyzisResult>;
  findCandidateMoves(engineInput: EngineMove, options?: GameAnalyzisOptions): Promise<MoveAnalysis>;
}
