import { EndOfGameMode, GameAnalyzisOptions, UCIMoveResult, UCIResult } from "./EngineTypes";
import { GameAnalyzisResult, MoveAnalysis } from "./GameAnalyseResult";
import { IEngineAnalyzer } from "./IEngineAnalyzer";
import { StockfishClient } from "./StockfishClient";
import { UCIUtil } from "./UCIUtil";
import getLogger, { LogTypes } from "@infra/logging/logger";
import config from "../../config";
import { EngineInput, EngineMove } from "./EngineInput";
import { MoveAnalyzer } from "./MoveAnalyzer";

const logger = getLogger(__filename, LogTypes.Analysis);

export class EngineAnalyzer implements IEngineAnalyzer {
  client: StockfishClient;
  private resolveAnalysis: ((result: string) => void) | null = null;
  private currentBufferedAnalyzer: ((data: string) => void) | null = null;

  constructor(stockFishClient?: StockfishClient) {
    this.client = stockFishClient;
  }

  // Async utility to analyze a single position
  private async analyzeSingleMove(
    engineMove: EngineMove,
    depth: number,
    lines: number,
    pastMoveAnalysis: MoveAnalysis
  ): Promise<MoveAnalysis> {
    return new Promise(async (resolve, reject) => {
      const bufferedAnalyzer = (output: string) => {
        try {
          const isWhiteToMove = engineMove.isWhiteToMove();
          const analyzedNextMoves = UCIUtil.parseUCIResult(output, depth, isWhiteToMove);
          if (analyzedNextMoves.ignored) {
            //ignoring received entry, could be a stockfish info result as a result of uci
            return;
          }
          let previousScore = pastMoveAnalysis?.positionScore || { score: 0, mate: null, isWhiteToMove };
          const result = new MoveAnalysis();
          result.movePlayed = engineMove.lastMove();
          result.wasWhiteMove = isWhiteToMove;
          result.position = engineMove.cumulativeStartPos;
          result.endOfGame = UCIUtil.isEndOfGame(output, isWhiteToMove);
          if (result.isEndOfGame()) {
            return resolve(result);
          }

          // the score of the position assuming opponent will play the best move
          result.nextMoves = analyzedNextMoves.moves;
          const moveAnalysisResult = MoveAnalyzer.analyzeMove(result, pastMoveAnalysis); //e.g it was 0.8 before, so scoreDelta = 0.5 - 0.8 = -0.3
          result.category = moveAnalysisResult.category;
          result.moveScoreDelta = moveAnalysisResult.moveScoreDelta;
          result.rawStockfishOutput = output;
          // logger.debug(result);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.client?.removeDataListener(this.currentBufferedAnalyzer);
        }
      };
      if (this.currentBufferedAnalyzer) {
        this.client?.removeDataListener(this.currentBufferedAnalyzer);
      }
      // Attach the new listener
      this.client?.addBufferedListener(bufferedAnalyzer);
      this.currentBufferedAnalyzer = bufferedAnalyzer; // Store the reference
      await this.client.sendUCICommandsForAnalysis(engineMove, lines, depth);
    });
  }

  public async analyzeGame(engineInput: EngineInput, options?: GameAnalyzisOptions): Promise<GameAnalyzisResult> {
    logger.info(`Starting game analysis`);
    const start = performance.now();
    this.client.setStockfishOptions({
      eloRating: options?.eloRating,
      threads: options?.threads,
      hashSize: 128
    });
    const result = await this.doAnalyze(engineInput.moves, options);
    const finish = performance.now();
    logger.info(`Analysis done took ${finish - start} milliseconds`);
    return result;
  }

  // Method to analyze all moves
  private async doAnalyze(
    moves: EngineMove[],
    options: GameAnalyzisOptions = { depth: 20, lines: 3 }
  ): Promise<GameAnalyzisResult> {
    let analysisResults = Array<MoveAnalysis>();
    let previousAnalyis: MoveAnalysis = null;
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      // const adjusteLines = UCIUtil.getRecommendedLines(i, options.lines); //no point in bringing multiple lines at initial positions
      const adjusteLines = 3;
      const adjustedDepth = UCIUtil.getRecommendedDepth(i, options.depth); //no point in high depth at initial positions
      logger.debug(`${i}:Analyzing game at move ${move.cumulativeStartPos} fen: ${move.fenPosition}`);
      const result = await this.analyzeSingleMove(move, options.depth, adjusteLines, previousAnalyis);
      logger.debug("analysis:" + result.toString());
      analysisResults.push(result);
      previousAnalyis = result;
    }
    try {
      this.client.disconnect();
    } catch (e) {
      console.error("Error disconnecting:", e);
    }
    if (config.server.isLocal()) {
      logFullStockFishOutput(analysisResults);
    }
    return { moves: analysisResults };
  }

  public async findCandidateMoves(engineInput: EngineMove, options?: GameAnalyzisOptions): Promise<MoveAnalysis> {
    try {
      this.client.setStockfishOptions({
        eloRating: options.eloRating,
        threads: options.threads,
        hashSize: 128
      });
      const result = await this.analyzeSingleMove(engineInput, options.depth, options.lines, null);
      return result;
    } catch (error) {
      logger.error("Error finding candidate moves:", error);
      throw error;
    } finally {
      this.client.disconnect();
    }
  }

  // Additional methods as needed...
}
function logFullStockFishOutput(analysisResults: Array<MoveAnalysis>) {
  logger.debug("Full analysis results:");
  analysisResults.forEach((analysis, index) => {
    const moveNumber = Math.floor((index + 2) / 2);
    logger.debug(`Move ${moveNumber} ${analysis.wasWhiteMove ? "W" : "B"}: ${analysis.movePlayed}`);
    logger.debug(`Position: ${analysis.position}`);
    logger.debug(`Output: ${analysis.rawStockfishOutput}`);
  });
}
