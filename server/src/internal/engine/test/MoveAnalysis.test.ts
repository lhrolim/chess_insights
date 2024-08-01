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
