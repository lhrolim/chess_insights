import { EngineInput, EngineMove } from "./domain/EngineInput";
import { GameAnalyzisOptions } from "./domain/EngineTypes";
import { GameAnalyzisResult } from "./domain/GameAnalyseResult";
import { GameMetadata } from "./domain/GameMetadata";
import { MoveAnalysisDTO } from "./domain/MoveAnalysisDTO";

export interface IEngineAnalyzer {
  analyzeGame(
    EngineInput: EngineInput,
    options?: GameAnalyzisOptions,
    gameMetadata?: GameMetadata
  ): Promise<GameAnalyzisResult>;

  findCandidateMoves(engineInput: EngineMove, options?: GameAnalyzisOptions): Promise<MoveAnalysisDTO>;
}
