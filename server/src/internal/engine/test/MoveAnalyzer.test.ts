import { MoveCategory } from "../EngineTypes";
import { MoveAnalysis } from "../GameAnalyseResult";
import { MoveAnalyzer } from "../MoveAnalyzer";
import { MoveAnalysisThresholds } from "../MoveAnalyzisConstants";
import { MoveAnalysisPOTO } from "./MoveTestHelper";

describe("categorizeMove", () => {
  describe("better position scenario", () => {
    it("slipped out of mate web, return miss", () => {
      const pastMove = MoveAnalysisPOTO.inMateWeb();
      const ma = MoveAnalysisPOTO.withScore(300);
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.category).toBe(MoveCategory.Miss);
    });

    it("white: more than 1 point lost ==> mistake", () => {
      const pastMove = MoveAnalysisPOTO.with3OptionsWhiteAdvantage250();
      const ma = MoveAnalysisPOTO.withScore(120);
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(-130);
      expect(result.category).toBe(MoveCategory.Mistake);
    });

    it("black: more than 1 point lost ==> mistake", () => {
      const pastMove = MoveAnalysisPOTO.with3OptionsBlackAdvantage250();
      const ma = MoveAnalysisPOTO.withScore(-120);
      ma.wasWhiteMove = false;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(130);
      expect(result.category).toBe(MoveCategory.Mistake);
    });

    it("less than 1 point lost still winning ==> innacuraccy", () => {
      const pastMove = MoveAnalysisPOTO.with3OptionsWhiteAdvantage250();
      const ma = MoveAnalysisPOTO.withScore(
        pastMove.positionScore().score - (MoveAnalysisThresholds.INNACURACY_CONSTANT - 1)
      );
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(-1 * (MoveAnalysisThresholds.INNACURACY_CONSTANT - 1));
      expect(result.category).toBe(MoveCategory.Innacuracy);
    });

    it("keeping advantage ==> return excellent", () => {
      const pastMove = MoveAnalysisPOTO.with3OptionsWhiteAdvantage250();
      const ma = MoveAnalysisPOTO.withScore(238);
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(-12);
      expect(result.category).toBe(MoveCategory.Excellent);
    });

    it("lost considerable advantage, but kept over equality ==> return miss", () => {
      const pastMove = MoveAnalysisPOTO.with3OptionsWhiteAdvantage350();
      const ma = MoveAnalysisPOTO.withScore(230);
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(-120);
      expect(result.category).toBe(MoveCategory.Miss);
    });
  });

  describe("tables turned scenario", () => {
    it("tables turned for white and larger than constant ==> mistake", () => {
      const pastMove = MoveAnalysisPOTO.with3EqualOptionsForWhite();
      const ma = MoveAnalysisPOTO.withScore(-10);
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(-60);
      expect(result.category).toBe(MoveCategory.Mistake);
    });

    it("tables turned for black and larger than constant ==> mistake", () => {
      const pastMove = MoveAnalysisPOTO.with3EqualOptionsForBlack();
      const ma = MoveAnalysisPOTO.withScore(10);
      ma.wasWhiteMove = false;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(60);
      expect(result.category).toBe(MoveCategory.Mistake);
    });
  });

  describe("position already lost scenario", () => {
    it("white already lost, no good moves,return good", () => {
      const pastMove = MoveAnalysisPOTO.with3MovesLostPositionForWhite();
      const ma = MoveAnalysisPOTO.withScore(-230);
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(-20);
      expect(result.category).toBe(MoveCategory.Good);
    });

    it("white already lost, no good moves, position deteriorated,return innacuracy", () => {
      const pastMove = MoveAnalysisPOTO.with3MovesLostPositionForWhite();
      const ma = MoveAnalysisPOTO.withScore(-260);
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(-50);
      expect(result.category).toBe(MoveCategory.Innacuracy);
    });
  });

  describe("brilliant, great or best scenario", () => {
    it("best move, but a few good ones return best", () => {
      const pastMove = MoveAnalysisPOTO.with3EqualOptionsForWhite();
      const ma = MoveAnalysisPOTO.withScore(50);
      ma.movePlayed = "e6e7";
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(0);
      expect(result.category).toBe(MoveCategory.Best);
    });

    it("best move, but only one good, below threshold, return great", () => {
      const pastMove = MoveAnalysisPOTO.withOnlyOneDecent();
      const ma = MoveAnalysisPOTO.withScore(150);
      ma.movePlayed = "e6e7";
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(0);
      expect(result.category).toBe(MoveCategory.Great);
    });

    it("best move, but only one good, above threshold, return brilliant", () => {
      const pastMove = MoveAnalysisPOTO.withOnlyOneVeryGood();
      const ma = MoveAnalysisPOTO.withScore(350);
      ma.movePlayed = "e6e7";
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(0);
      expect(result.category).toBe(MoveCategory.Brilliant);
    });

    it("black: best move, but only one good, above threshold, return brilliant", () => {
      const pastMove = MoveAnalysisPOTO.withOnlyOneVeryGoodBlack();
      const ma = MoveAnalysisPOTO.withScore(-350);
      ma.movePlayed = "e6e7";
      ma.wasWhiteMove = false;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(0);
      expect(result.category).toBe(MoveCategory.Brilliant);
    });
  });

  it("first move, return Book", () => {
    const ma = MoveAnalysisPOTO.withScore(900);
    const result = MoveAnalyzer.analyzeMove(ma, null);
    expect(result.category).toBe(MoveCategory.Book);
    expect(result.moveScoreDelta).toBe(900);
  });

  // Add more test cases for different scenarios
});
