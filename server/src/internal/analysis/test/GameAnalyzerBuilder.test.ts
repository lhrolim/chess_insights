import { MoveCategory } from "@internal/engine/domain/EngineTypes";
import { MoveAnalysisDTOForPrecision } from "@internal/engine/domain/MoveAnalysisDTO";
import { GameAnalyzerBuilder } from "../GameAnalyzerBuilder"; // Adjust the import path as needed

describe("GameAnalyzerBuilder.getCPLForRating", () => {
  test("returns the correct CPL for exact ratings", () => {
    expect(GameAnalyzerBuilder.getCPLForRating(1000)).toBeCloseTo(1.3);
    expect(GameAnalyzerBuilder.getCPLForRating(2000)).toBeCloseTo(0.35);
    expect(GameAnalyzerBuilder.getCPLForRating(2500)).toBeCloseTo(0.15);
  });

  test("interpolates CPL for ratings between known values", () => {
    expect(GameAnalyzerBuilder.getCPLForRating(1500)).toBeCloseTo(0.8);
    expect(GameAnalyzerBuilder.getCPLForRating(1750)).toBeCloseTo(0.55);
    expect(GameAnalyzerBuilder.getCPLForRating(2200)).toBeCloseTo(0.25);
  });

  test("returns closest CPL for out-of-range ratings", () => {
    expect(GameAnalyzerBuilder.getCPLForRating(700)).toBeCloseTo(1.5);
    expect(GameAnalyzerBuilder.getCPLForRating(3300)).toBeCloseTo(0.02);
  });
});

describe("GameAnalyzerBuilder.calculatePrecision", () => {
  const moveAnalysis: MoveAnalysisDTOForPrecision[] = [
    { moveScoreDelta: 0.6, category: MoveCategory.Innacuracy, wasWhiteMove: true },
    { moveScoreDelta: 1.5, category: MoveCategory.Mistake, wasWhiteMove: false },
    { moveScoreDelta: 3.0, category: MoveCategory.Blunder, wasWhiteMove: true },
    { moveScoreDelta: 0.4, category: MoveCategory.Good, wasWhiteMove: false },
    { moveScoreDelta: 0.2, category: MoveCategory.Excellent, wasWhiteMove: true },
    { moveScoreDelta: 0.0, category: MoveCategory.Best, wasWhiteMove: false },
    { moveScoreDelta: 0.55, category: MoveCategory.Innacuracy, wasWhiteMove: true },
    { moveScoreDelta: 1.2, category: MoveCategory.Mistake, wasWhiteMove: false },
    { moveScoreDelta: 0.3, category: MoveCategory.Excellent, wasWhiteMove: true },
    { moveScoreDelta: 2.7, category: MoveCategory.Blunder, wasWhiteMove: false }
  ];

  test("calculates precision scores without rating", () => {
    const [whitePrecisionScore, blackPrecisionScore] = GameAnalyzerBuilder.calculatePrecision(moveAnalysis);
    expect(whitePrecisionScore).toBeGreaterThan(0);
    expect(whitePrecisionScore).toBeLessThanOrEqual(100);
    expect(blackPrecisionScore).toBeGreaterThan(0);
    expect(blackPrecisionScore).toBeLessThanOrEqual(100);
  });

  test("calculates precision scores with rating", () => {
    const [whitePrecisionScore, blackPrecisionScore] = GameAnalyzerBuilder.calculatePrecision(
      moveAnalysis,
      [1638, 1700]
    );
    expect(whitePrecisionScore).toBeGreaterThan(0);
    expect(whitePrecisionScore).toBeLessThanOrEqual(100);
    expect(blackPrecisionScore).toBeGreaterThan(0);
    expect(blackPrecisionScore).toBeLessThanOrEqual(100);
  });

  test("handles edge case of empty move analysis array", () => {
    expect(() => GameAnalyzerBuilder.calculatePrecision([])).toThrow("The array of move analysis is empty");
  });

  test("handles edge case of very high rating", () => {
    const [whitePrecisionScore, blackPrecisionScore] = GameAnalyzerBuilder.calculatePrecision(
      moveAnalysis,
      [3300, 3100]
    );
    expect(whitePrecisionScore).toBeGreaterThan(0);
    expect(whitePrecisionScore).toBeLessThanOrEqual(100);
    expect(blackPrecisionScore).toBeGreaterThan(0);
    expect(blackPrecisionScore).toBeLessThanOrEqual(100);
  });

  test("handles edge case of very low rating", () => {
    const [whitePrecisionScore, blackPrecisionScore] = GameAnalyzerBuilder.calculatePrecision(moveAnalysis, [700, 650]);
    expect(whitePrecisionScore).toBeGreaterThan(0);
    expect(whitePrecisionScore).toBeLessThanOrEqual(100);
    expect(blackPrecisionScore).toBeGreaterThan(0);
    expect(blackPrecisionScore).toBeLessThanOrEqual(100);
  });
});
