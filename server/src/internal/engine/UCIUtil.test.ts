import { UCIUtil } from "./UCIUtil";
import { EndOfGameMode, MoveAnalysis, MoveCategory, MoveScore } from "./EngineTypes";

const DRAW_UCI_REPLY = `'info string NNUE evaluation using nn-5af11540bbfe.nnue enabled
info depth 0 score cp 0
bestmove (none)'`;

const MATE_IN_1 = `'info depth 20 seldepth 2 multipv 1 score mate 1 nodes 832789 nps 601726 hashfull 349 tbhits 0 time 1384 pv d8h4`;

// 
const FULL_RESULT = 
`
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

  describe("categorizeMove", () => {
    it("first move, return Book", () => {
      const ma =new MoveAnalysis();
      ma.positionScore = {score: 900, mate: 0};
      const result = UCIUtil.categorizeMove(ma, null);
      expect(result).toBe(MoveCategory.Book);
    });

    it("should return MoveResult if the score and numberOfOptionsAvailableFromPrevious are outside certain ranges", () => {
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
        const moveResult =UCIUtil.parseScore(MATE_IN_1,false);
        expect(moveResult.mate).toBe(1);
        expect(moveResult.isWhiteToMove).toBe(false);
    });

    // Add more test cases for different scenarios
  });

  describe("parseMove", () => {
    it("should parse the move from the line and return a string", () => {
        const moveResult =UCIUtil.parseMove(MATE_IN_1);
        expect(moveResult).toBe("d8h4");
    });

    // Add more test cases for different scenarios
  });

  describe("isEndOfGame", () => {
    it("should return true if the outputLines indicate the end of the game", () => {
      const endOfGame = UCIUtil.isEndOfGame(DRAW_UCI_REPLY,true);
      expect(endOfGame).toBe(EndOfGameMode.STALEMATE);
    });

    it("should return false if the outputLines do not indicate the end of the game", () => {
      // Test case
    });

    // Add more test cases for different scenarios
  });

  describe("calculateDeltaScore", () => {
    it("should calculate the delta score based on the previousScore and moveScore", () => {
      // Test case
    });

    // Add more test cases for different scenarios
  });

  describe("joinMoves", () => {
    it("should join the moves into a single string", () => {
      // Test case
    });

    // Add more test cases for different scenarios
  });
});
