import { EngineInput, GameAnalyzisOptions } from "./EngineTypes";
import { GameAnalyzisResult } from "./GameAnalyseResult";

export interface IEngineAnalyzer {
  analyzeGame(EngineInput: EngineInput, options: GameAnalyzisOptions): Promise<GameAnalyzisResult>;
}
