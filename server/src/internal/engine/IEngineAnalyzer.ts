import { GameAnalyzisOptions } from "./EngineTypes";
import { GameAnalyzisResult } from "./GameAnalyseResult";
import { EngineInput } from "./EngineInput";

export interface IEngineAnalyzer {
  analyzeGame(EngineInput: EngineInput, options?: GameAnalyzisOptions): Promise<GameAnalyzisResult>;
}
