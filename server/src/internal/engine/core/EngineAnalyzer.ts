import getLogger, { LogTypes } from "@infra/logging/logger";
import { GameAnalyzerBuilder } from "@internal/analysis/GameAnalyzerBuilder";
import { EngineMove, EngineInput } from "../domain/EngineInput";
import { GameAnalyzisOptions } from "../domain/EngineTypes";
import { GameAnalyzisResult } from "../domain/GameAnalyseResult";
import { MoveAnalyzer } from "./MoveAnalyzer";
import { StockfishClient } from "./StockfishClient";
import { UCIUtil } from "../util/UCIUtil";
import { IEngineAnalyzer } from "../IEngineAnalyzer";
import { MoveAnalysisDTO } from "../domain/MoveAnalysisDTO";
import { getConfig } from "../../../config";
const config = getConfig();
import { MoveUtil } from "@internal/util/MoveUtil";
import { MoveCategory } from "../domain/MoveCategory";
import e from "express";
import { GameMetadata } from "../domain/GameMetadata";

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
    pastMoveAnalysis: MoveAnalysisDTO
  ): Promise<MoveAnalysisDTO> {
    return new Promise(async (resolve, reject) => {
      const bufferedAnalyzer = (output: string) => {
        try {
          const isWhiteToMove = engineMove.isWhiteToMove();
          const analyzedNextMoves = UCIUtil.parseUCIResult(output, depth, isWhiteToMove);
          if (analyzedNextMoves.ignored) {
            // Ignoring received entry, could be a Stockfish info result as a result of uci
            return;
          }
          let previousScore = pastMoveAnalysis?.positionScore || { score: 0, mate: NaN, isWhiteToMove };
          const result = new MoveAnalysisDTO();
          result.movePlayed = engineMove.lastMove();
          result.wasWhiteMove = !isWhiteToMove;
          result.position = engineMove.cumulativeStartPos;
          result.endOfGame = UCIUtil.isEndOfGame(output, isWhiteToMove);
          result.timeTook = engineMove.timeTook;
          if (result.isEndOfGame()) {
            result.moveScoreDelta = 0;
            return resolve(result);
          }

          // The score of the position assuming the opponent will play the best move
          result.nextMoves = analyzedNextMoves.moves;
          const moveAnalysisResult = MoveAnalyzer.analyzeMove(result, pastMoveAnalysis, engineMove.chessJSData); // e.g., it was 0.8 before, so scoreDelta = 0.5 - 0.8 = -0.3
          result.category = moveAnalysisResult.category;
          result.moveScoreDelta = moveAnalysisResult.moveScoreDelta;
          result.rawStockfishOutput = output;
          // logger.debug(result);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.client.removeDataListener(this.currentBufferedAnalyzer);
        }
      };

      // Remove the previous listener if it exists
      if (this.currentBufferedAnalyzer) {
        this.client.removeDataListener(this.currentBufferedAnalyzer);
      }

      // Attach the new listener
      this.client.addBufferedListener(bufferedAnalyzer);
      this.currentBufferedAnalyzer = bufferedAnalyzer; // Store the reference
      await this.client.sendUCICommandsForAnalysis(engineMove, lines, depth);
    });
  }

  public async analyzeGame(
    engineInput: EngineInput,
    options?: GameAnalyzisOptions,
    gameMetadata?: GameMetadata
  ): Promise<GameAnalyzisResult> {
    logger.info(`Starting game analysis`);
    const start = performance.now();
    this.client.setStockfishOptions({
      eloRating: options?.eloRating,
      threads: options?.threads,
      hashSize: 256
    });
    const result = await this.doAnalyze(engineInput.moves, options, gameMetadata);
    const finish = performance.now();
    logger.info(`Analysis done took ${finish - start} milliseconds`);
    return result;
  }

  // Method to analyze all moves
  private async doAnalyze(
    moves: EngineMove[],
    options: GameAnalyzisOptions = { depth: 20, lines: 3, startMove: 1 },
    gameMetadata?: GameMetadata
  ): Promise<GameAnalyzisResult> {
    let analysisResults = Array<MoveAnalysisDTO>();
    let previousAnalyis: MoveAnalysisDTO = null;
    const startMove = options.startMove || 1;
    for (let i = 0; i < moves.length; i++) {
      const skipData = MoveUtil.shouldSkipMove(i, startMove);
      if (skipData.shouldSkipEntirely) {
        logger.trace(`Skipping move ${i}:${moves[i].move} as it is before the start move`);
        continue;
      }
      const move = moves[i];
      // const adjusteLines = UCIUtil.getRecommendedLines(i, options.lines); //no point in bringing multiple lines at initial positions
      const adjusteLines = 3;
      const adjustedDepth = UCIUtil.getRecommendedDepth(i, options.depth); //no point in high depth at initial positions
      logger.debug(`${i}:Analyzing game at move ${move.cumulativeStartPos} fen: ${move.fenPosition}`);
      const result = await this.analyzeSingleMove(move, adjustedDepth, adjusteLines, previousAnalyis);
      logger.debug("analysis:" + result.toString());
      if (!skipData.shouldSkipOnlyResult) {
        analysisResults.push(result);
      }
      previousAnalyis = result;
    }
    if (config.server.isLocal()) {
      logFullStockFishOutput(analysisResults);
    }
    return GameAnalyzerBuilder.buildConsolidatedAnalysis(moves, analysisResults, gameMetadata);
  }

  public async findCandidateMoves(engineInput: EngineMove, options?: GameAnalyzisOptions): Promise<MoveAnalysisDTO> {
    try {
      this.client.setStockfishOptions({
        eloRating: options.eloRating,
        threads: options.threads,
        hashSize: 256
      });
      const result = await this.analyzeSingleMove(engineInput, options.depth, options.lines, null);
      return result;
    } catch (error) {
      logger.error("Error finding candidate moves:", error);
      throw error;
    } finally {
      // this.client.disconnect();
    }
  }

  // Additional methods as needed...
}
function logFullStockFishOutput(analysisResults: Array<MoveAnalysisDTO>) {
  logger.debug("Full analysis results:");
  const perCategoryMovesWhite: any = {};
  const perCategoryMovesBlack: any = {};
  analysisResults.forEach((analysis, index) => {
    logger.debug(`Move ${analysis.moveNumber()} ${analysis.wasWhiteMove ? "W" : "B"}: ${analysis.movePlayed}`);
    logger.debug(`Position: ${analysis.position}`);
    logger.debug(`Output: ${analysis.rawStockfishOutput}`);

    if (!perCategoryMovesWhite[analysis.category]) {
      perCategoryMovesWhite[analysis.category] = [];
    }
    if (!perCategoryMovesBlack[analysis.category]) {
      perCategoryMovesBlack[analysis.category] = [];
    }
    const array = analysis.wasWhiteMove ? perCategoryMovesWhite : perCategoryMovesBlack;
    if (
      analysis.category !== MoveCategory.Book &&
      analysis.category !== MoveCategory.Ignored &&
      analysis.category !== MoveCategory.Excellent &&
      analysis.category !== MoveCategory.Best &&
      analysis.category !== MoveCategory.Good &&
      // analysis.category !== MoveCategory.Great &&
      !analysis.isEndOfGame()
    ) {
      array[analysis.category].push({
        i: analysis.moveNumber(),
        move: analysis.movePlayed,
        score: analysis.moveScoreDelta
      });
    }
  });
  // logger.debug(`Per category moves White: ${JSON.stringify(perCategoryMovesWhite, null, 1)}`);
  // logger.debug(`Per category moves Black: ${JSON.stringify(perCategoryMovesBlack, null, 1)}`);
}
