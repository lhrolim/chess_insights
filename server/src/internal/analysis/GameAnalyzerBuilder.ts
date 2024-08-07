import { EngineMove } from "@internal/engine/domain/EngineInput";
import {
  ConsolidateMoveAnalysis,
  createDefaultConsolidateMoveAnalysis,
  GameAnalyzisResult
} from "@internal/engine/domain/GameAnalyseResult";
import { GameMetadata } from "@internal/engine/domain/GameMetadata";
import { BasicMoveAnalysis, MoveAnalysisDTO } from "@internal/engine/domain/MoveAnalysisDTO";
import { MoveAnalysisThresholds } from "@internal/engine/domain/MoveAnalyzisThresholds";
import { MoveCategory } from "@internal/engine/domain/MoveCategory";

interface RatingToCPLMapping {
  [rating: number]: number;
}

// Establish benchmarks
const grandmasterLevelDelta = 0.05;
const beginnerLevelDelta = 2.2;

const lowTimeRapid = 5000; //5 seconds or less
const longTimeRapid = 30000; //30 seconds or more

const lowTimeBlitz = 3000; //3 seconds or less
const longTimeBlitz = 30000; //15 seconds or more

const ratingToCPL: RatingToCPLMapping = {
  800: 1.5,
  900: 1.4,
  1000: 1.3,
  1100: 1.2,
  1200: 1.1,
  1300: 1.0,
  1400: 0.9,
  1500: 0.8,
  1600: 0.7,
  1700: 0.6,
  1800: 0.5,
  1850: 0.45, // Added finer granularity
  1900: 0.4,
  1950: 0.375, // Added finer granularity
  2000: 0.35,
  2050: 0.325, // Added finer granularity
  2100: 0.3,
  2150: 0.275, // Added finer granularity
  2200: 0.25,
  2250: 0.225, // Added finer granularity
  2300: 0.2,
  2350: 0.19, // Added finer granularity
  2400: 0.18,
  2450: 0.165, // Added finer granularity
  2500: 0.15,
  2550: 0.135, // Added finer granularity
  2600: 0.12,
  2650: 0.11, // Added finer granularity
  2700: 0.1,
  2750: 0.09, // Added finer granularity
  2800: 0.08,
  2850: 0.07, // Added finer granularity
  2900: 0.06,
  2950: 0.05, // Added finer granularity
  3000: 0.04,
  3050: 0.035, // Added finer granularity
  3100: 0.03,
  3150: 0.025, // Added finer granularity
  3200: 0.02
};
export class GameAnalyzerBuilder {
  public static buildConsolidatedAnalysis(
    moves: EngineMove[],
    engineMoveResults: MoveAnalysisDTO[],
    gameMetadata: GameMetadata
  ): GameAnalyzisResult {
    const consolidatedResults = GameAnalyzerBuilder.buildConsolidatedArray(engineMoveResults);
    const calculatedPrecision = GameAnalyzerBuilder.calculatePrecision(engineMoveResults);
    const result = new GameAnalyzisResult(engineMoveResults, consolidatedResults, gameMetadata);
    result.whitePrecision = calculatedPrecision[0];
    result.blackPrecision = calculatedPrecision[1];

    result.firstMistakeWhite = this.getFirstMistake(moves, engineMoveResults, true);
    result.firstMistakeBlack = this.getFirstMistake(moves, engineMoveResults, false);

    result.firstMistakeWhiteLongTime = this.getFirstMistakeLongTime(moves, engineMoveResults, true, gameMetadata);
    result.firstMistakeBlackLongTime = this.getFirstMistakeLongTime(moves, engineMoveResults, false, gameMetadata);

    result.firstMistakeWhiteLowTime = this.getFirstMistakeLowTime(moves, engineMoveResults, true, gameMetadata);
    result.firstMistakeBlackLowTime = this.getFirstMistakeLowTime(moves, engineMoveResults, false, gameMetadata);

    return result;
  }
  public static getFirstMistakeLowTime(
    moves: EngineMove[],
    engineMoveResults: MoveAnalysisDTO[],
    white: boolean,
    gameMetadata: GameMetadata
  ): MoveAnalysisDTO {
    let lowTimeThreshold = 5000; //default

    if (gameMetadata) {
      switch (gameMetadata.modality) {
        case "Rapid":
          lowTimeThreshold = lowTimeRapid;
          break;
        case "Blitz":
          lowTimeThreshold = lowTimeBlitz;
          break;
        default:
          break;
      }
    }

    return engineMoveResults
      .filter(move => move.wasWhiteMove === white)
      .find(move => {
        return (
          (move.category === MoveCategory.Mistake || move.category === MoveCategory.Blunder) &&
          move.timeTook <= lowTimeThreshold
        );
      });
  }
  public static getFirstMistakeLongTime(
    moves: EngineMove[],
    engineMoveResults: MoveAnalysisDTO[],
    white: boolean,
    gameMetadata: GameMetadata
  ): MoveAnalysisDTO {
    let highThreshold = 30000; //default

    if (gameMetadata) {
      switch (gameMetadata.modality) {
        case "Rapid":
          highThreshold = lowTimeRapid;
          break;
        case "Blitz":
          highThreshold = lowTimeBlitz;
          break;
        default:
          break;
      }
    }

    return engineMoveResults
      .filter(move => move.wasWhiteMove === white)
      .find(move => {
        return (
          (move.category === MoveCategory.Mistake || move.category === MoveCategory.Blunder) &&
          move.timeTook >= highThreshold
        );
      });
  }
  public static getFirstMistake(
    moves: EngineMove[],
    engineMoveResults: MoveAnalysisDTO[],
    white: boolean
  ): MoveAnalysisDTO {
    return engineMoveResults
      .filter(move => move.wasWhiteMove === white)
      .find(move => {
        return move.category === MoveCategory.Mistake || move.category === MoveCategory.Blunder;
      });
  }

  private static buildConsolidatedArray(engineMoveResults: MoveAnalysisDTO[]) {
    const result = new Array<ConsolidateMoveAnalysis>();
    const whiteAnalysis = createDefaultConsolidateMoveAnalysis();
    const blackAnalysis = createDefaultConsolidateMoveAnalysis();
    result.push(whiteAnalysis);
    result.push(blackAnalysis);
    // this.consolidateMoveAnalysis.totalMoves = this.moves.length;
    engineMoveResults.forEach(move => {
      let analysis = move.wasWhiteMove ? whiteAnalysis : blackAnalysis;
      analysis.totalMoves++;
      switch (move.category) {
        case MoveCategory.Book:
          analysis.numberOfBookMoves++;
          break;
        case MoveCategory.Brilliant:
          analysis.numberOfBrilliantMoves++;
          break;
        case MoveCategory.Great:
          analysis.numberOfGreatMoves++;
          break;
        case MoveCategory.Best:
          analysis.numberOfBestMoves++;
          break;
        case MoveCategory.Excellent:
          analysis.numberOfExcellentMoves++;
          break;
        case MoveCategory.Good:
          analysis.numberOfGoodMoves++;
          break;
        case MoveCategory.Innacuracy:
          analysis.numberOfInaccuracies++;
          break;
        case MoveCategory.Mistake:
          analysis.numberOfMistakes++;
          break;
        case MoveCategory.Blunder:
          analysis.numberOfBlunders++;
          break;
        case MoveCategory.Miss:
          analysis.numberOfMisses++;
          break;
      }
    });
    return result;
  }

  public static getCPLForRating(rating: number): number {
    const ratings = Object.keys(ratingToCPL)
      .map(Number)
      .sort((a, b) => a - b);

    if (rating < ratings[0]) {
      return ratingToCPL[ratings[0]];
    }

    if (rating > ratings[ratings.length - 1]) {
      return ratingToCPL[ratings[ratings.length - 1]];
    }

    // Find the closest lower and upper rating bounds
    let lowerRating = ratings[0];
    let upperRating = ratings[ratings.length - 1];

    for (let i = 0; i < ratings.length - 1; i++) {
      if (rating >= ratings[i] && rating <= ratings[i + 1]) {
        lowerRating = ratings[i];
        upperRating = ratings[i + 1];
        break;
      }
    }

    const lowerCPL = ratingToCPL[lowerRating];
    const upperCPL = ratingToCPL[upperRating];

    // Linear interpolation to estimate CPL for the given rating
    const interpolatedCPL = lowerCPL + ((rating - lowerRating) * (upperCPL - lowerCPL)) / (upperRating - lowerRating);

    return interpolatedCPL;
  }

  public static calculatePrecision(moveAnalysis: BasicMoveAnalysis[], playerRatings?: number[]): [number, number] {
    // Check if the array is empty
    if (moveAnalysis.length === 0) {
      throw new Error("The array of move analysis is empty");
    }

    const whiteOriginalMoves = moveAnalysis.filter(move => move.wasWhiteMove);
    const blackOriginalMoves = moveAnalysis.filter(move => !move.wasWhiteMove);

    // Split the move analysis into white and black moves
    const whiteMovesWithLosses = whiteOriginalMoves.filter(move => move.wasWhiteMove && move.moveScoreDelta < 0);
    const blackMovesWithLosses = blackOriginalMoves.filter(move => !move.wasWhiteMove && move.moveScoreDelta > 0);

    // Calculate total and average deltas for white moves
    const totalWhiteDelta = whiteMovesWithLosses.reduce(
      (sum, move) => sum + GameAnalyzerBuilder.normalizedValue(move),
      0
    );
    const averageWhiteDelta = Math.round(totalWhiteDelta / whiteOriginalMoves.length) / 100;

    // Calculate total and average deltas for black moves
    const totalBlackDelta = blackMovesWithLosses.reduce(
      (sum, move) => sum + GameAnalyzerBuilder.normalizedValue(move),
      0
    );
    const averageBlackDelta = Math.round(totalBlackDelta / blackOriginalMoves.length) / 100;

    // Normalize the average delta to a score between 0 and 100 for white moves
    const whitePrecisionScore = this.getPrecisionOutOfAverageCPLoss(averageWhiteDelta, true, playerRatings);
    const blackPrecisionScore = this.getPrecisionOutOfAverageCPLoss(averageBlackDelta, false, playerRatings);

    return [whitePrecisionScore, blackPrecisionScore];
  }

  private static normalizedValue(move: BasicMoveAnalysis) {
    return Math.min(MoveAnalysisThresholds.MATE_CONSTANT, Math.abs(move.moveScoreDelta));
  }

  public static getPrecisionOutOfAverageCPLoss(
    avgCPLoss: number,
    whitePrecision: boolean,
    playerRatings?: number[]
  ): number {
    const basePrecision =
      100 * Math.max(0, (beginnerLevelDelta - avgCPLoss) / (beginnerLevelDelta - grandmasterLevelDelta));
    return Math.round(Math.max(0, Math.min(100, basePrecision)) * 10) / 10;
    //TODO: implement rating based precision
    //   if (playerRatings === undefined) {

    // }
    // const idx = whitePrecision ? 0 : 1;
    // const cplForRating = this.getCPLForRating(playerRatings[idx]);
    // const enhacedPrecision = (basePrecision * cplForRating) / avgCPLoss;
    // return Math.round(10 * Math.max(0, Math.min(100, enhacedPrecision))) / 10;
  }
}
