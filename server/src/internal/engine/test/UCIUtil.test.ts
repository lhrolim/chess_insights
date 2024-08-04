import { EndOfGameMode, MoveCategory, MoveData } from "../domain/EngineTypes";
import { UCIUtil } from "../util/UCIUtil";
import { MoveAnalysisPOTO } from "./MoveTestHelper";

const DRAW_UCI_REPLY = `'info string NNUE evaluation using nn-5af11540bbfe.nnue enabled
info depth 0 score cp 0
bestmove (none)'`;

const F2_F4_REPLY = `
info depth 20 seldepth 26 multipv 1 score cp 33 nodes 2470973 nps 902473 hashfull 800 tbhits 0 time 2738 pv g8f6 g1f3 d7d5 e2e3 c8f5 b2b3 e7e6 c1b2 f8e7 f1e2 c7c5 f3e5 f6d7 g2g4 f5e4 e1g1 d7e5 b2e5 e8g8 d2d3,
info depth 20 seldepth 25 multipv 2 score cp 27 nodes 2470973 nps 902473 hashfull 800 tbhits 0 time 2738 pv d7d5 g1f3 g7g6 e2e3 f8g7 c2c4 e7e6 b1c3 c7c5 c4d5 e6d5 f1b5 b8c6 b5c6 b7c6 b2b3 g7c3 d2c3 g8f6 c1b2 d8e7,
info depth 20 seldepth 20 multipv 3 score cp 5 nodes 2470973 nps 902473 hashfull 800 tbhits 0 time 2738 pv e7e6 b1c3 a7a6 e2e4 b7b5 d2d4 c8b7 a2a3 c7c5 g1f3 b5b4 c3a4 c5d4 f1d3 b8c6 e1g1 g8f6 e4e5 f6d5 a3b4 f8b4`;

const E7_E5_REPLY = `
info depth 20 seldepth 30 multipv 1 score cp 39 nodes 1839086 nps 894062 hashfull 618 tbhits 0 time 2057 pv f4e5 d7d6 g1f3 d6e5 f3e5 f8d6 e5f3 g8f6 b1c3 f6g4 g2g3 h7h5 d2d4 h5h4 h1g1 b8c6 c1g5 f7f6 g5f4 g7g5 f4d6 d8d6,
info depth 20 seldepth 28 multipv 2 score cp -36 nodes 1839086 nps 894062 hashfull 618 tbhits 0 time 2057 pv d2d3 e5f4 c1f4 d7d5 e2e4 b8c6 e4d5 d8d5 g1f3 g8f6 f1e2 c8e6 e1g1 e8c8 b1c3 d5d7 f3g5 f8c5 g1h1 c6d4 e2f3 c5d6,
info depth 20 seldepth 27 multipv 3 score cp -46 nodes 1839086 nps 894062 hashfull 618 tbhits 0 time 2057 pv e2e4 e5f4 f1c4 b8c6 d2d4 d8h4 e1f1 d7d6 h2h3 g7g5 b1c3 h7h6
`;


const F2F4_E7E5_G2G4_REPLY = `
info depth 20 seldepth 2 multipv 1 score mate 1 nodes 684926 nps 793657 hashfull 280 tbhits 0 time 863 pv d8h4,
info depth 20 seldepth 26 multipv 2 score cp 234 nodes 684926 nps 793657 hashfull 280 tbhits 0 time 863 pv d7d5 f1g2 e5f4 d2d4 f8d6 c2c4 d5c4 b1d2 h7h5 g4h5 b8c6 d2c4 h8h5 g2f3 h5h4 c4d6 c7d6,
info depth 20 seldepth 23 multipv 3 score cp 219 nodes 684926 nps 793657 hashfull 280 tbhits 0 time 863 pv e5f4 g1f3 d7d5 d2d4 f8d6 h1g1 b8c6 c2c4 d5c4 b1c3 h7h6 h2h3 g8f6 e2e4
`;

const REPLY_WITH_MATE = `
info depth 10 seldepth 12 multipv 1 score cp -764 nodes 144787 nps 12065583 hashfull 9 tbhits 0 time 12 pv f1f2 f4d3 f2c2 g5e3 b7b1 e3f3 h1g1 d3f4,
info depth 10 seldepth 19 multipv 2 score cp -792 nodes 144787 nps 12065583 hashfull 9 tbhits 0 time 12 pv b7b8 g8h7 f1f2 f4d3 f2c2 g5e3 b8h8 h7h8 h2h4 e3f3 h1h2 h8h7 a2a4 f3e4 a4a5 e4h4 h2g1 h4e1 g1g2 e1a5,
info depth 10 seldepth 3 multipv 3 score mate -1 nodes 144787 nps 12065583 hashfull 9 tbhits 0 time 12 pv a2a3 g5g2 
`;

const MATE_IN_1 = `'info depth 20 seldepth 2 multipv 1 score mate 1 nodes 832789 nps 601726 hashfull 349 tbhits 0 time 1384 pv d8h4`;

//
const FULL_RESULT = `
info depth 20 seldepth 25 multipv 1 score cp 28 nodes 650811 nps 529114 hashfull 264 tbhits 0 time 1230 pv d7d5 g1f3 g7g6 d2d4 f8g7 c2c4 e7e6 e2e3 g8e7 b2b4 e8g8 f1d3 b7b6 e1g1 c7c5 b4c5
bestmove d7d5 ponder g1f3
`;

describe("UCIUtil", () => {
  describe("matchesDepth", () => {
    it("should return true if the line matches the depth", () => {
      // Test case
    });

    it("should return false if the line does not match the depth", () => {
      // Test case
    });

    // Add more test cases for different scenarios
  });

  describe("getRecommendedDepth", () => {
    it("should return the recommended depth based on the moveNumber and informedDepth", () => {
      // Test case
    });

    // Add more test cases for different scenarios
  });

  describe("getRecommendedLines", () => {
    it("should return the recommended lines based on the moveNumber and lines", () => {
      // Test case
    });

    // Add more test cases for different scenarios
  });

  describe("parseScore", () => {
    it("should parse the score from the line and return MoveScore", () => {
      const moveResult = UCIUtil.parseScore(MATE_IN_1, false);
      expect(moveResult.mate).toBe(1);
      expect(moveResult.isWhiteToMove).toBe(false);
    });

    // Add more test cases for different scenarios
  });

  describe("parseMove", () => {
    it("should parse the move from the line and return a string", () => {
      const moveResult = UCIUtil.parseMove(MATE_IN_1);
      expect(moveResult).toBe("d8h4");
    });

    // Add more test cases for different scenarios
  });

  describe("isEndOfGame", () => {
    it("should return true if the outputLines indicate the end of the game", () => {
      const endOfGame = UCIUtil.isEndOfGame(DRAW_UCI_REPLY, true);
      expect(endOfGame).toBe(EndOfGameMode.STALEMATE);
    });

    it("should return false if the outputLines do not indicate the end of the game", () => {
      // Test case
    });

    // Add more test cases for different scenarios
  });

  describe("parseUCIResult", () => {
    it("should return next candidate moves sorted from black perspective", () => {
      const reply = UCIUtil.parseUCIResult(F2_F4_REPLY, 20, false);
      expect(reply.moves.length).toBe(3);
      expect(reply.endOfGame).toBe(EndOfGameMode.NONE);
      expect(reply.ignored).toBe(false);
      expect(reply.moves[0].move).toBe("g8f6");
      expect(reply.moves[0].data.score).toBe(-33);
      expect(reply.moves[1].move).toBe("d7d5");
      expect(reply.moves[1].data.score).toBe(-27);
      expect(reply.moves[2].move).toBe("e7e6");
      expect(reply.moves[2].data.score).toBe(-5);
    });

    it("should return next candidate moves sorted from white perspective", () => {
      const reply = UCIUtil.parseUCIResult(E7_E5_REPLY, 20, true);
      expect(reply.moves.length).toBe(3);
      expect(reply.endOfGame).toBe(EndOfGameMode.NONE);
      expect(reply.ignored).toBe(false);
      expect(reply.moves[0].move).toBe("f4e5");
      expect(reply.moves[0].data.score).toBe(39);
      expect(reply.moves[1].move).toBe("d2d3");
      expect(reply.moves[1].data.score).toBe(-36);
      expect(reply.moves[2].move).toBe("e2e4");
      expect(reply.moves[2].data.score).toBe(-46);
    });

    it("should return next candidate moves considering mate I am doing first", () => {
      const reply = UCIUtil.parseUCIResult(F2F4_E7E5_G2G4_REPLY, 20, false);
      expect(reply.moves.length).toBe(3);
      expect(reply.endOfGame).toBe(EndOfGameMode.NONE);
      expect(reply.ignored).toBe(false);
      expect(reply.moves[0].move).toBe("d8h4");
      expect(reply.moves[0].data.score).toBeNull();
      expect(reply.moves[0].data.mate).toBeTruthy();
      expect(reply.moves[1].move).toBe("d7d5");
      expect(reply.moves[1].data.score).toBe(-234);
      expect(reply.moves[2].move).toBe("e5f4");
      expect(reply.moves[2].data.score).toBe(-219);
    });

    it("should return next candidate moves considering mate I'm receiving last", () => {
      const reply = UCIUtil.parseUCIResult(REPLY_WITH_MATE, 10, true);
      expect(reply.moves.length).toBe(3);
      expect(reply.endOfGame).toBe(EndOfGameMode.NONE);
      expect(reply.ignored).toBe(false);
      expect(reply.moves[0].move).toBe("f1f2");
      expect(reply.moves[0].data.score).toBe(-764);
      expect(reply.moves[1].move).toBe("b7b8");
      expect(reply.moves[1].data.score).toBe(-792);
      expect(reply.moves[2].move).toBe("a2a3");
      expect(reply.moves[2].data.mate).toBe(-1);
      expect(reply.moves[2].data.mate).toBeTruthy();
    });
  });

  describe("calculateDeltaScore", () => {
    it("should calculate the delta score based on the previousScore and moveScore", () => {
      // Test case
    });

    // Add more test cases for different scenarios
  });

  describe("joinMoves", () => {
    it("should join the moves into a single string", () => {
      const result = UCIUtil.getStartPositionFromMoves(["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "g8f6"]);
      expect(result).toBe(["e2e4 e7e5 g1f3 b8c6 f1c4 g8f6"].join(" "));
    });

    // Add more test cases for different scenarios
  });
});
