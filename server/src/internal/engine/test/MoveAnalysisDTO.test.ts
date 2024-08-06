import { MoveData } from "../domain/EngineTypes";
import { MoveAnalysisDTO } from "../domain/MoveAnalysisDTO";
import { MoveAnalysisThresholds } from "../domain/MoveAnalyzisThresholds";
import { MoveAnalysisPOTO } from "./MoveTestHelper";

describe("count moves correctly", () => {
  it("should count moves correctly white", () => {
    const ma = MoveAnalysisPOTO.withScore(50);
    ma.position = "e2e4";
    expect(ma.moveNumber()).toBe(1);
  });

  it("should count moves correctly white", () => {
    const ma = MoveAnalysisPOTO.withScore(50);
    ma.position = "e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 d2d3";
    expect(ma.moveNumber()).toBe(4);
  });

  it("should count moves correctly black", () => {
    const ma = MoveAnalysisPOTO.withScore(50);
    ma.position = "e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 d2d3 d7d6";
    expect(ma.moveNumber()).toBe(4);
  });

  it("is in mate web", () => {
    const ma = MoveAnalysisPOTO.withScore(50);
    ma.position = "e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 d2d3 d7d6";
    expect(ma.moveNumber()).toBe(4);
  });
});

describe("previousScore", () => {
  it("should return 0 if no previous score", () => {
    const ma = MoveAnalysisPOTO.withScore(50);
    ma.moveScoreDelta = 50;
    expect(ma.previousScore()).toBe(0);
  });

  it("should return previous score", () => {
    const ma = MoveAnalysisPOTO.withScore(50);
    ma.moveScoreDelta = 10;
    expect(ma.previousScore()).toBe(40);
  });

  it("should return previous score", () => {
    const ma = MoveAnalysisPOTO.withScore(-50);
    ma.wasWhiteMove = false;
    ma.moveScoreDelta = 10;
    expect(ma.previousScore()).toBe(-60);
  });
});

describe("is already lost", () => {
  it("should return true if already lost", () => {
    const ma = MoveAnalysisPOTO.withScore(-MoveAnalysisThresholds.DECISIVE_ADVANTAGE - 1);
    ma.moveScoreDelta = 10;
    expect(ma.alreadyLost(true)).toBe(true);
  });

  it("should return false if not lost", () => {
    const ma = MoveAnalysisPOTO.withScore(-MoveAnalysisThresholds.DECISIVE_ADVANTAGE + 1);
    ma.moveScoreDelta = 10;
    expect(ma.alreadyLost(true)).toBe(false);
  });

  it("should return true if already lost (black)", () => {
    const ma = MoveAnalysisPOTO.withScore(MoveAnalysisThresholds.DECISIVE_ADVANTAGE + 1);
    ma.moveScoreDelta = 10;
    expect(ma.alreadyLost(false)).toBe(true);
  });

  it("should return false if not lost (black)", () => {
    const ma = MoveAnalysisPOTO.withScore(MoveAnalysisThresholds.DECISIVE_ADVANTAGE - 1);
    ma.moveScoreDelta = 10;
    expect(ma.alreadyLost(false)).toBe(false);
  });
});

describe("is in mate web", () => {
  it("white:should return true if in mate web", () => {
    const ma = MoveAnalysisPOTO.withMate(2);
    expect(ma.givingMate(true)).toBeTruthy();
  });

  it("white:should return true if giving mate", () => {
    const ma = new MoveAnalysisDTO();
    ma.nextMoves = [{ move: "any", data: new MoveData(null, -2, false) }];
    ma.wasWhiteMove = true;
    expect(ma.givingMate(true)).toBeTruthy();
  });

  it("black: should return true if in mate web", () => {
    const ma = MoveAnalysisPOTO.withMate(2, false);
    expect(ma.givingMate()).toBeTruthy();
  });

  it("white:should return true if in mate web", () => {
    const ma = MoveAnalysisPOTO.withMate(-2);
    expect(ma.receivingMate()).toBeTruthy();
  });

  it("black: should return true if in mate web", () => {
    const ma = MoveAnalysisPOTO.withMate(2, false);
    expect(ma.receivingMate()).toBeTruthy();
  });
});

describe("only one leads to mate", () => {
  it("white:only one leads to mate", () => {
    const pastMove = MoveAnalysisPOTO.blackMistake();
    pastMove.nextMoves[1].data.mate = null;
    pastMove.nextMoves[1].data.score = 1200;
    expect(pastMove.onlyOneLeadsToMate(true)).toBeTruthy();
  });

  it("black: only one leads to mate", () => {
    const pastMove = MoveAnalysisPOTO.whiteMistake();
    pastMove.nextMoves[1].data.mate = null;
    pastMove.nextMoves[1].data.score = -1200;
    expect(pastMove.onlyOneLeadsToMate(false)).toBeTruthy();
  });
});
