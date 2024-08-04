import { MoveCategory } from "../domain/EngineTypes";
import { MoveAnalysisThresholds } from "../domain/MoveAnalyzisThresholds";
import { MoveAnalyzer } from "../core/MoveAnalyzer";
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
    describe("had decisive advantage", () => {
      it("tables turned but within equality ==> miss", () => {
        const pastMove = MoveAnalysisPOTO.with3OptionsBlackAdvantage250();
        const ma = MoveAnalysisPOTO.withScore(MoveAnalysisThresholds.EQUALITY_CONSTANT - 1);
        ma.wasWhiteMove = false;
        const result = MoveAnalyzer.analyzeMove(ma, pastMove);
        expect(result.moveScoreDelta).toBe(
          MoveAnalysisThresholds.EQUALITY_CONSTANT - 1 - pastMove.positionScore().score
        );
        expect(result.category).toBe(MoveCategory.Miss);
      });
    });

    describe("about equal advantage", () => {
      it("tables turned for white and larger than constant and not equal anymore ==> mistake", () => {
        const pastMove = MoveAnalysisPOTO.with3EqualOptionsForWhite();
        const ma = MoveAnalysisPOTO.withScore(-80);
        ma.wasWhiteMove = true;
        const result = MoveAnalyzer.analyzeMove(ma, pastMove);
        expect(result.moveScoreDelta).toBe(-130);
        expect(result.category).toBe(MoveCategory.Mistake);
      });

      it("tables turned for black and larger than constant and not equal anymore ==> mistake", () => {
        const pastMove = MoveAnalysisPOTO.with3EqualOptionsForBlack();
        const ma = MoveAnalysisPOTO.withScore(80);
        ma.wasWhiteMove = false;
        const result = MoveAnalyzer.analyzeMove(ma, pastMove);
        expect(result.moveScoreDelta).toBe(130);
        expect(result.category).toBe(MoveCategory.Mistake);
      });
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

  describe("had decisive advantage", () => {
    it("lost decisive advantage, still about equal ==> return miss", () => {
      const pastMove = MoveAnalysisPOTO.with3OptionsWhiteAdvantage350();
      const ma = MoveAnalysisPOTO.withScore(MoveAnalysisThresholds.EQUALITY_CONSTANT - 1);
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(MoveAnalysisThresholds.EQUALITY_CONSTANT - 1 - pastMove.positionScore().score);
      expect(result.category).toBe(MoveCategory.Miss);
    });

    // it("still had decisive, losing 180 ==> innacuracy", () => {
    //   const pastMove = MoveAnalysisPOTO.with3OptionsBlackAdvantage250();
    //   pastMove.nextMoves[0].data.score = 430;
    //   const ma = MoveAnalysisPOTO.withScore(MoveAnalysisThresholds.DECISIVE_ADVANTAGE + 1);
    //   ma.wasWhiteMove = false;
    //   const result = MoveAnalyzer.analyzeMove(ma, pastMove);
    //   expect(result.moveScoreDelta).toBe(
    //     MoveAnalysisThresholds.DECISIVE_ADVANTAGE + 1 - pastMove.positionScore().score
    //   );
    //   expect(result.category).toBe(MoveCategory.Innacuracy);
    // });

    it("still has decisive, losing tons ==> innacuracy", () => {
      const pastMove = MoveAnalysisPOTO.decisiveBlack();
      pastMove.nextMoves[0].data.score = -630;
      const ma = MoveAnalysisPOTO.withScore(-1 * (MoveAnalysisThresholds.DECISIVE_ADVANTAGE + 1));
      ma.wasWhiteMove = false;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(
        -MoveAnalysisThresholds.DECISIVE_ADVANTAGE - 1 - pastMove.positionScore().score
      );
      expect(result.category).toBe(MoveCategory.Innacuracy);
    });

    it("still has decisive, losing tons ==> innacuracy", () => {
      const pastMove = MoveAnalysisPOTO.withScore(-478);
      const ma = MoveAnalysisPOTO.withScore(-259, false, "f6g5");
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(219);
      expect(result.category).toBe(MoveCategory.Innacuracy);
    });

    it("lost decisive, kept advantage ==> miss", () => {
      const pastMove = MoveAnalysisPOTO.withScore(-483);
      const ma = MoveAnalysisPOTO.withScore(-224, false, "f6g5");
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(259);
      expect(result.category).toBe(MoveCategory.Miss);
    });

    it("lost decisive, kept advantage ==> miss", () => {
      const pastMove = MoveAnalysisPOTO.withScore(-483);
      const ma = MoveAnalysisPOTO.withScore(-224, false, "f6g5");
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(259);
      expect(result.category).toBe(MoveCategory.Miss);
    });
  });

  describe("mate scenarios", () => {
    it("returns MATE_CONSTANT when joins a mate web", () => {
      const pastMove = MoveAnalysisPOTO.withScore(400); //white already winning
      const ma = MoveAnalysisPOTO.inMateWeb(5, false);
      const result = MoveAnalyzer.calculateDeltaScore(ma.positionScore(), pastMove.positionScore());
      expect(result).toBe(MoveAnalysisThresholds.MATE_CONSTANT - 400);
    });

    it("returns a 0 in regular mate scenario and excellent move", () => {
      const pastMove = MoveAnalysisPOTO.inMateWeb(5, false);
      const ma = MoveAnalysisPOTO.inMateWeb(4, true, "d6d8"); //second best
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(0);
      expect(result.category).toBe(MoveCategory.Excellent);
    });

    it("returns a 0 in longer mate web", () => {
      const pastMove = MoveAnalysisPOTO.inMateWeb(5, false);
      const ma = MoveAnalysisPOTO.inMateWeb(9, true, "d2d3"); //second best
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(0);
      expect(result.category).toBe(MoveCategory.Excellent);
    });

    it("returns a miss if escapes mate", () => {
      const pastMove = MoveAnalysisPOTO.inMateWeb();
      const ma = MoveAnalysisPOTO.withScore(955, true, "h2h3");
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.category).toBe(MoveCategory.Miss);
    });

    it("enters mate web", () => {
      const pastMove = MoveAnalysisPOTO.blackMistake();
      const ma = MoveAnalysisPOTO.withScore(1, true, "h4g6");
      ma.movePlayed = "h4g6";
      ma.nextMoves[0].data.mate = 6;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.category).toBe(MoveCategory.Best); //TODO: piece sacrificed should count as great
    });
  });

  it("first move, return Book", () => {
    const ma = MoveAnalysisPOTO.withScore(30);
    ma.movePlayed = "e2e4";
    ma.position = "e2e4";
    const result = MoveAnalyzer.analyzeMove(ma, null);
    expect(result.category).toBe(MoveCategory.Book);
    expect(result.moveScoreDelta).toBe(30);
  });

  // Add more test cases for different scenarios
});
