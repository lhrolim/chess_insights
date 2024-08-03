import { ChessGameDAO } from "@internal/database/ChessGameDAO";
import getLogger from "@infra/logging/logger";
import { EngineAnalyzer } from "@internal/engine/core/EngineAnalyzer";
import { StockfishClient } from "@internal/engine/core/StockfishClient";
import { EngineInput } from "@internal/engine/domain/EngineInput";
import { ConsolidateMoveAnalysis } from "@internal/engine/domain/GameAnalyseResult";
import { CWANalytics } from "@internal/database/CWAnalyticsModel";
const logger = getLogger("worker");

const engineAnalyzer = new EngineAnalyzer(new StockfishClient());

export class PGNWorker {
  public analyzeGame = async (url: string): Promise<void> => {
    const game = await ChessGameDAO.findById(url);
    if (!game) {
      logger.error(`Game with url ${url} not found`);
      return;
    }
    logger.info(`Analyzing game ${game.url}`);
    const pgn = game.pgn;
    const engineInput = EngineInput.fromPGN(pgn);
    const options = { depth: 15, lines: 3, eloRating: 3500, threads: 8 };
    const result = await engineAnalyzer.analyzeGame(engineInput, options);

    game.whiteData.cwAnalytics = this.convertToCWAnalytics(result.whitePrecision, result.whiteAnalysis);
    game.blackData.cwAnalytics = this.convertToCWAnalytics(result.blackPrecision, result.blackAnalysis);
    await game.save();
    logger.info(`Game ${game.url} analyzed and saved`);
  };

  private convertToCWAnalytics(precision: number, consolidatedAnalysis: ConsolidateMoveAnalysis): CWANalytics {
    return {
      cwPrecision: precision,
      numberOfBestMoves: consolidatedAnalysis.numberOfBestMoves,
      numberOfGoodMoves: consolidatedAnalysis.numberOfGoodMoves,
      numberOfMistakes: consolidatedAnalysis.numberOfMistakes,
      numberOfBlunders: consolidatedAnalysis.numberOfBlunders,
      numberOfInaccuracies: consolidatedAnalysis.numberOfInaccuracies,
      numberOfMisses: consolidatedAnalysis.numberOfMisses,
      numberOfBrilliantMoves: consolidatedAnalysis.numberOfBrilliantMoves,
      numberOfGreatMoves: consolidatedAnalysis.numberOfGreatMoves,
      numberOfExcellentMoves: consolidatedAnalysis.numberOfExcellentMoves,
      numberOfBookMoves: consolidatedAnalysis.numberOfBookMoves,
      totalMoves: consolidatedAnalysis.totalMoves
    };
  }
}
