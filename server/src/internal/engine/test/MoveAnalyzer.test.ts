import { MoveAnalysisThresholds } from "../domain/MoveAnalyzisThresholds";
import { MoveAnalyzer } from "../core/MoveAnalyzer";
import { MoveAnalysisPOTO } from "./MoveTestHelper";
import { MoveCategory } from "../domain/MoveCategory";

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

    it("less than 1 point lost still winning ==> good", () => {
      const pastMove = MoveAnalysisPOTO.with3OptionsWhiteAdvantage250();
      const ma = MoveAnalysisPOTO.withScore(
        pastMove.positionScore().score - (MoveAnalysisThresholds.INNACURACY_CONSTANT - 1)
      );
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(-1 * (MoveAnalysisThresholds.INNACURACY_CONSTANT - 1));
      expect(result.category).toBe(MoveCategory.Good);
    });

    it("marks innacuraccy if less than 1 point and lost edge", () => {
      const pastMove = MoveAnalysisPOTO.withScore(140);
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

    it("lost considerable advantage, but kept over equality ==> return innacuraccy", () => {
      const pastMove = MoveAnalysisPOTO.with3OptionsWhiteAdvantage350();
      const ma = MoveAnalysisPOTO.withScore(230);
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(-120);
      expect(result.category).toBe(MoveCategory.Innacuracy);
    });
  });

  describe("tables turned scenario", () => {
    describe("had decisive advantage", () => {
      it("tables turned and had decisive advantage ==> miss", () => {
        const pastMove = MoveAnalysisPOTO.with3OptionsBlackAdvantage250();
        pastMove.nextMoves[0].data.score = -MoveAnalysisThresholds.DECISIVE_ADVANTAGE - 10;
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

    it("white already lost, no good moves,return innacuracy", () => {
      const pastMove = MoveAnalysisPOTO.with3MovesLostPositionForWhite();
      const ma = MoveAnalysisPOTO.withScore(-230);
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(-20);
      expect(result.category).toBe(MoveCategory.Good);
    });

    it("white already lost, no good moves, position deteriorated,return innacuracy", () => {
      const pastMove = MoveAnalysisPOTO.with3MovesLostPositionCompletelyWhite();
      const ma = MoveAnalysisPOTO.withScore(-800);
      ma.movePlayed = "d6d8"; //not into the list of options
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(-253);
      expect(result.category).toBe(MoveCategory.Innacuracy);
    });

    it("white already lost, return best move, not great", () => {
      const pastMove = MoveAnalysisPOTO.with3MovesLostPositionCompletelyWhite();
      const ma = MoveAnalysisPOTO.withScore(-547);
      ma.wasWhiteMove = true;
      ma.movePlayed = "b7b8";
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(0);
      expect(result.category).toBe(MoveCategory.Best);
    });

    it("black already completely lost, return mistake not blunder even if joining mate web", () => {
      const pastMove = MoveAnalysisPOTO.withScore(660, false, "f8b8");
      const ma = MoveAnalysisPOTO.withScore(0);
      ma.nextMoves[0].data.mate = 7;
      ma.movePlayed = "b7b8";
      ma.wasWhiteMove = false;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(340);
      expect(result.category).toBe(MoveCategory.Mistake);
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

    it("returns best if all moves keep good adavantage regardless of the threshold", () => {
      const pastMove = MoveAnalysisPOTO.black3Excellent();
      const ma = MoveAnalysisPOTO.withScore(-437);
      ma.movePlayed = "a7d4";
      ma.wasWhiteMove = false;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(0);
      expect(result.category).toBe(MoveCategory.Best);
    });

    it("best move, but only one good, above threshold, return brilliant", () => {
      const pastMove = MoveAnalysisPOTO.withOnlyOneVeryGood();
      const ma = MoveAnalysisPOTO.withScore(350);
      ma.movePlayed = "e6e7";
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove, { isSacrifice: true });
      expect(result.moveScoreDelta).toBe(0);
      expect(result.category).toBe(MoveCategory.Brilliant);
    });

    it("capture not a sacrifice, best", () => {
      const pastMove = MoveAnalysisPOTO.withOnlyOneVeryGood();
      const ma = MoveAnalysisPOTO.withScore(350);
      ma.movePlayed = "e6e7";
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove, { isSacrifice: false, isCapture: true });
      expect(result.moveScoreDelta).toBe(0);
      expect(result.category).toBe(MoveCategory.Best);
    });

    it("black: best move, but only one good, above threshold, return brilliant", () => {
      const pastMove = MoveAnalysisPOTO.withOnlyOneVeryGoodBlack();
      const ma = MoveAnalysisPOTO.withScore(-350);
      ma.movePlayed = "e6e7";
      ma.wasWhiteMove = false;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove, { isSacrifice: true });
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

    it("still had decisive, losing 180 ==> innacuracy", () => {
      const pastMove = MoveAnalysisPOTO.with3OptionsBlackAdvantage250();
      pastMove.nextMoves[0].data.score = 430;
      const ma = MoveAnalysisPOTO.withScore(MoveAnalysisThresholds.DECISIVE_ADVANTAGE + 1);
      ma.wasWhiteMove = false;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(
        MoveAnalysisThresholds.DECISIVE_ADVANTAGE + 1 - pastMove.positionScore().score
      );
      expect(result.category).toBe(MoveCategory.Good);
    });

    it("is an exchange piece capture, return best regardless of score (avoid great)", () => {
      const pastMove = MoveAnalysisPOTO.withOnlyOneDecent();
      const ma = MoveAnalysisPOTO.withScore(150);
      ma.movePlayed = "e6e7";
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove, { isExchangeCapture: true });
      expect(result.moveScoreDelta).toBe(0);
      expect(result.category).toBe(MoveCategory.Best);
    });

    xit("is another piece capture, return great given criteria", () => {
      const pastMove = MoveAnalysisPOTO.withOnlyOneDecent();
      const ma = MoveAnalysisPOTO.withScore(150);
      ma.movePlayed = "e6e7";
      ma.wasWhiteMove = true;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove, { isCapture: true, isExchangeCapture: false });
      expect(result.moveScoreDelta).toBe(0);
      expect(result.category).toBe(MoveCategory.Great);
    });

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

    it("still has complete, not on list, losing tons ==> good", () => {
      const pastMove = MoveAnalysisPOTO.withScore(1080);
      const ma = MoveAnalysisPOTO.withScore(710, true, "f6g5");
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(-370);
      expect(result.category).toBe(MoveCategory.Good);
    });

    it("lost decisive, kept advantage ==> miss", () => {
      const pastMove = MoveAnalysisPOTO.withScore(-483);
      const ma = MoveAnalysisPOTO.withScore(-224, false, "f6g5");
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(259);
      expect(result.category).toBe(MoveCategory.Miss);
    });

    it("lost decisive, kept advantage ==> miss", () => {
      const pastMove = MoveAnalysisPOTO.withScore(-583);
      const ma = MoveAnalysisPOTO.withScore(-224, false, "f6g5");
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(359);
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

    it("should return 0 if had more than the Mate constant", () => {
      const pastMove = MoveAnalysisPOTO.withScore(1800); //white already winning
      const ma = MoveAnalysisPOTO.inMateWeb(5, false);
      const result = MoveAnalyzer.calculateDeltaScore(ma.positionScore(), pastMove.positionScore());
      expect(result).toBe(0);
    });

    it("returns a 0 in regular mate scenario and excellent move", () => {
      const pastMove = MoveAnalysisPOTO.inMateWeb(-5, false);
      const ma = MoveAnalysisPOTO.inMateWeb(4, true, "d6d8"); //second best
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.moveScoreDelta).toBe(0);
      expect(result.category).toBe(MoveCategory.Excellent);
    });

    it("[black]returns a 0 in regular mate scenario and excellent move", () => {
      const pastMove = MoveAnalysisPOTO.inMateWeb(5, true);
      const ma = MoveAnalysisPOTO.inMateWeb(-4, false, "d6d8"); //second best
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

    it("enters mate web, multiple options to enter", () => {
      const pastMove = MoveAnalysisPOTO.blackMistake();
      const ma = MoveAnalysisPOTO.withScore(1, true, "h4g6");
      ma.movePlayed = "h4g6";
      ma.nextMoves[0].data.mate = 6;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.category).toBe(MoveCategory.Best); //TODO: piece sacrificed should count as great
    });

    it("enters mate web, single option", () => {
      const pastMove = MoveAnalysisPOTO.blackMistake();
      pastMove.nextMoves[1].data.mate = null;
      pastMove.nextMoves[1].data.score = 1200;
      const ma = MoveAnalysisPOTO.withScore(1, true, "h4g6");
      ma.movePlayed = "h4g6";
      ma.nextMoves[0].data.mate = 6;
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.category).toBe(MoveCategory.Great); //single option
    });

    it("return miss if misses entering mate web", () => {
      const pastMove = MoveAnalysisPOTO.blackMistake();
      pastMove.nextMoves[1].data.mate = null;
      pastMove.nextMoves[1].data.score = 1200;
      const ma = MoveAnalysisPOTO.withScore(300, true, "h4g6");
      ma.movePlayed = "h2h3";
      const result = MoveAnalyzer.analyzeMove(ma, pastMove);
      expect(result.category).toBe(MoveCategory.Miss); //single option
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
