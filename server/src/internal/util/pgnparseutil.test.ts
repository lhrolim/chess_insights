import { parseRelevantDataFromPGN, parseMovesFromPGN } from "./pgnparserutil";

const PGN_1 =
  '[Event "Live Chess"]\n[Site "Chess.com"]\n[Date "2024.01.02"]\n[Round "-"]\n[White "lhrolim"]\n[Black "rokaLX"]\n[Result "0-1"]\n[CurrentPosition "r4rk1/1pp1qppp/p7/3PPp2/5B2/bP3N2/P1n1BPPP/5RK1 w - -"]\n[Timezone "UTC"]\n[ECO "B05"]\n[ECOUrl "https://www.chess.com/openings/Alekhines-Defense-Modern-Main-Line-5.Be2"]\n[UTCDate "2024.01.02"]\n[UTCTime "16:50:15"]\n[WhiteElo "1712"]\n[BlackElo "1689"]\n[TimeControl "180"]\n[Termination "rokaLX won by resignation"]\n[StartTime "16:50:15"]\n[EndDate "2024.01.02"]\n[EndTime "16:52:59"]\n[Link "https://www.chess.com/game/live/97953083141"]\n\n1. e4 {[%clk 0:03:00]} 1... Nf6 {[%clk 0:03:00]} 2. e5 {[%clk 0:02:58.7]} 2... Nd5 {[%clk 0:02:59.5]} 3. d4 {[%clk 0:02:58.6]} 3... d6 {[%clk 0:02:58.3]} 4. Nf3 {[%clk 0:02:57.5]} 4... Bg4 {[%clk 0:02:54.5]} 5. Be2 {[%clk 0:02:56.3]} 5... dxe5 {[%clk 0:02:50.1]} 6. dxe5 {[%clk 0:02:54.3]} 6... Nc6 {[%clk 0:02:47.2]} 7. O-O {[%clk 0:02:49.8]} 7... e6 {[%clk 0:02:45.6]} 8. c4 {[%clk 0:02:47]} 8... Nb6 {[%clk 0:02:43.1]} 9. Bf4 {[%clk 0:02:37.6]} 9... Bc5 {[%clk 0:02:36.3]} 10. Nc3 {[%clk 0:02:30.2]} 10... a6 {[%clk 0:02:29.6]} 11. Rc1 {[%clk 0:02:24.9]} 11... O-O {[%clk 0:02:12.6]} 12. b3 {[%clk 0:02:21.4]} 12... Ba3 {[%clk 0:02:08.8]} 13. Rc2 {[%clk 0:02:14.9]} 13... Qe7 {[%clk 0:02:06.4]} 14. Qd3 {[%clk 0:02:00.2]} 14... Nb4 {[%clk 0:02:03.3]} 15. Qe4 {[%clk 0:01:55.9]} 15... Bf5 {[%clk 0:01:58.1]} 16. Nd5 {[%clk 0:01:47.5]} 16... N6xd5 {[%clk 0:01:49.1]} 17. Qxf5 {[%clk 0:01:43.6]} 17... exf5 {[%clk 0:01:44.8]} 18. cxd5 {[%clk 0:01:43.5]} 18... Nxc2 {[%clk 0:01:42.5]} 0-1\n';

describe("parseRelevantDataFromPGN", () => {
  it("should parse relevant data from PGN", () => {
    const result = parseRelevantDataFromPGN(PGN_1, true);

    expect(result).toEqual({
      startTime: "2024-01-02 16:50:15",
      myClock: "0:01:43.5",
      opponentClock: "0:01:42.5",
      blackClock: "0:01:42.5",
      whiteClock: "0:01:43.5",
      opening: "https://www.chess.com/openings/Alekhines-Defense-Modern-Main-Line-5.Be2",
      numberOfMoves: 18
    });
  });

  it("should parse relevant data from PGN, playing as black", () => {
    const pgn =
      '[Event "Live Chess"]\n[Site "Chess.com"]\n[Date "2024.01.02"]\n[Round "-"]\n[White "lhrolim"]\n[Black "rokaLX"]\n[Result "0-1"]\n[CurrentPosition "r4rk1/1pp1qppp/p7/3PPp2/5B2/bP3N2/P1n1BPPP/5RK1 w - -"]\n[Timezone "UTC"]\n[ECO "B05"]\n[ECOUrl "https://www.chess.com/openings/Alekhines-Defense-Modern-Main-Line-5.Be2"]\n[UTCDate "2024.01.02"]\n[UTCTime "16:50:15"]\n[WhiteElo "1712"]\n[BlackElo "1689"]\n[TimeControl "180"]\n[Termination "rokaLX won by resignation"]\n[StartTime "16:50:15"]\n[EndDate "2024.01.02"]\n[EndTime "16:52:59"]\n[Link "https://www.chess.com/game/live/97953083141"]\n\n1. e4 {[%clk 0:03:00]} 1... Nf6 {[%clk 0:03:00]} 2. e5 {[%clk 0:02:58.7]} 2... Nd5 {[%clk 0:02:59.5]} 3. d4 {[%clk 0:02:58.6]} 3... d6 {[%clk 0:02:58.3]} 4. Nf3 {[%clk 0:02:57.5]} 4... Bg4 {[%clk 0:02:54.5]} 5. Be2 {[%clk 0:02:56.3]} 5... dxe5 {[%clk 0:02:50.1]} 6. dxe5 {[%clk 0:02:54.3]} 6... Nc6 {[%clk 0:02:47.2]} 7. O-O {[%clk 0:02:49.8]} 7... e6 {[%clk 0:02:45.6]} 8. c4 {[%clk 0:02:47]} 8... Nb6 {[%clk 0:02:43.1]} 9. Bf4 {[%clk 0:02:37.6]} 9... Bc5 {[%clk 0:02:36.3]} 10. Nc3 {[%clk 0:02:30.2]} 10... a6 {[%clk 0:02:29.6]} 11. Rc1 {[%clk 0:02:24.9]} 11... O-O {[%clk 0:02:12.6]} 12. b3 {[%clk 0:02:21.4]} 12... Ba3 {[%clk 0:02:08.8]} 13. Rc2 {[%clk 0:02:14.9]} 13... Qe7 {[%clk 0:02:06.4]} 14. Qd3 {[%clk 0:02:00.2]} 14... Nb4 {[%clk 0:02:03.3]} 15. Qe4 {[%clk 0:01:55.9]} 15... Bf5 {[%clk 0:01:58.1]} 16. Nd5 {[%clk 0:01:47.5]} 16... N6xd5 {[%clk 0:01:49.1]} 17. Qxf5 {[%clk 0:01:43.6]} 17... exf5 {[%clk 0:01:44.8]} 18. cxd5 {[%clk 0:01:43.5]} 18... Nxc2 {[%clk 0:01:42.5]} 0-1\n';

    const result = parseRelevantDataFromPGN(pgn, false);

    expect(result).toEqual({
      startTime: "2024-01-02 16:50:15",
      myClock: "0:01:42.5",
      opponentClock: "0:01:43.5",
      blackClock: "0:01:42.5",
      whiteClock: "0:01:43.5",
      opening: "https://www.chess.com/openings/Alekhines-Defense-Modern-Main-Line-5.Be2",
      numberOfMoves: 18
    });
  });

  it("should return null if unable to parse game PGN", () => {
    const pgn = "malformed pgn";
    const amIPlayingAsWhite = true;

    const result = parseRelevantDataFromPGN(pgn, amIPlayingAsWhite);

    expect(result).toBeNull();
  });
});

describe("parseMovesFromPGN", () => {
  it("should parse moves from PGN", () => {
    const result = parseMovesFromPGN(PGN_1);
    expect(result).toBeDefined();
    expect(result.map(m => m.move)).toContain("d7d6");
    expect(result.length).toBe(36);
  });

  it("should parse moves from PGN adding coordinated moves", () => {
    const result = parseMovesFromPGN(PGN_1);
    expect(result).toBeDefined();
    expect(result.map(m => m.move)).toContain("e2e4");
    expect(result.map(m => m.cumulativeStartPos)).toContain("e2e4");
    expect(result.length).toBe(36);
  });
});
