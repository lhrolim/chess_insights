import axios from "axios";
import { fetchBestAnalyzedGamesOverPastMonths } from "./chesscom"; // Adjust the import path accordingly
import { GameFormat, GameResultDTO, MatchResult, EndMatchMode, GameSearchDto, SortCriteria } from "@api/dtos/GameDtos";

// Mock the axios module
jest.mock("axios");

const GENERIC_GAME = {
  url: "https://www.chess.com/game/live/97858866315",
  pgn: '[Event "Live Chess"]\n[Site "Chess.com"]\n[Date "2024.01.01"]\n[Round "-"]\n[White "2Grizzly"]\n[Black "lhrolim"]\n[Result "1-0"]\n[CurrentPosition "1r1n4/1r2qk2/4p3/1B1p1pRp/P2N1P1P/3Q4/1P6/1K1R4 b - -"]\n[Timezone "UTC"]\n[ECO "D00"]\n[ECOUrl "https://www.chess.com/openings/Queens-Pawn-Opening-Chigorin-Variation-2...Nf6"]\n[UTCDate "2024.01.01"]\n[UTCTime "14:38:09"]\n[WhiteElo "1927"]\n[BlackElo "1937"]\n[TimeControl "600"]\n[Termination "2Grizzly won by resignation"]\n[StartTime "14:38:09"]\n[EndDate "2024.01.01"]\n[EndTime "14:53:09"]\n[Link "https://www.chess.com/game/live/97858866315"]\n\n1. d4 {[%clk 0:10:00]} 1... Nf6 {[%clk 0:10:00]} 2. Nc3 {[%clk 0:09:58]} 2... d5 {[%clk 0:09:58.5]} 3. Bf4 {[%clk 0:09:55.9]} 3... c6 {[%clk 0:09:56.5]} 4. e3 {[%clk 0:09:54.8]} 4... e6 {[%clk 0:09:54.7]} 5. Nf3 {[%clk 0:09:53.4]} 5... Bd6 {[%clk 0:09:54]} 6. Ne5 {[%clk 0:09:51.3]} 6... O-O {[%clk 0:09:51.6]} 7. g4 {[%clk 0:09:49.5]} 7... c5 {[%clk 0:09:38.3]} 8. g5 {[%clk 0:09:44.5]} 8... cxd4 {[%clk 0:09:08.6]} 9. gxf6 {[%clk 0:09:32.7]} 9... Qxf6 {[%clk 0:09:06.8]} 10. Ng4 {[%clk 0:09:18.3]} 10... Qd8 {[%clk 0:08:57.4]} 11. Bxd6 {[%clk 0:09:11.3]} 11... Qxd6 {[%clk 0:08:57.3]} 12. Ne2 {[%clk 0:09:06]} 12... dxe3 {[%clk 0:08:55]} 13. Nxe3 {[%clk 0:09:03.1]} 13... Nc6 {[%clk 0:08:42]} 14. Qd2 {[%clk 0:08:53.2]} 14... f5 {[%clk 0:08:32.1]} 15. O-O-O {[%clk 0:08:47.1]} 15... Bd7 {[%clk 0:08:18.5]} 16. f4 {[%clk 0:08:44.9]} 16... Qc5 {[%clk 0:08:13.4]} 17. Qc3 {[%clk 0:08:37.9]} 17... Qb6 {[%clk 0:08:11.8]} 18. Nd4 {[%clk 0:08:32.2]} 18... Na5 {[%clk 0:08:01.4]} 19. a3 {[%clk 0:08:18.8]} 19... Rfc8 {[%clk 0:07:58.4]} 20. Qb4 {[%clk 0:08:17.6]} 20... Qc7 {[%clk 0:07:48.4]} 21. Bd3 {[%clk 0:08:09.3]} 21... a6 {[%clk 0:07:36.4]} 22. Kb1 {[%clk 0:08:02.7]} 22... b5 {[%clk 0:07:34.5]} 23. Rhg1 {[%clk 0:07:29.1]} 23... Kf7 {[%clk 0:07:26.2]} 24. Qe1 {[%clk 0:07:14.8]} 24... g6 {[%clk 0:07:10.9]} 25. Qh4 {[%clk 0:07:09.2]} 25... Kg8 {[%clk 0:06:34.4]} 26. Nf3 {[%clk 0:07:01]} 26... Be8 {[%clk 0:06:04.6]} 27. Ne5 {[%clk 0:06:42.4]} 27... Qg7 {[%clk 0:05:37.2]} 28. Qf2 {[%clk 0:06:18.5]} 28... Rab8 {[%clk 0:05:20]} 29. h4 {[%clk 0:05:56.1]} 29... h5 {[%clk 0:05:14.8]} 30. Rg5 {[%clk 0:05:50.2]} 30... Nc6 {[%clk 0:05:07.2]} 31. Nf3 {[%clk 0:04:47]} 31... b4 {[%clk 0:04:55.4]} 32. Bxa6 {[%clk 0:04:31.6]} 32... Rc7 {[%clk 0:04:40.2]} 33. a4 {[%clk 0:04:26.8]} 33... b3 {[%clk 0:04:36.1]} 34. Bb5 {[%clk 0:04:21.3]} 34... bxc2+ {[%clk 0:04:33.2]} 35. Nxc2 {[%clk 0:04:15]} 35... Rcb7 {[%clk 0:04:19.2]} 36. Ncd4 {[%clk 0:03:58.2]} 36... Qf6 {[%clk 0:03:53.1]} 37. Qe3 {[%clk 0:03:42.5]} 37... Nd8 {[%clk 0:03:02.5]} 38. Qd3 {[%clk 0:03:19.8]} 38... Bf7 {[%clk 0:02:52.8]} 39. Ne5 {[%clk 0:03:11.5]} 39... Qe7 {[%clk 0:02:45.3]} 40. Nxg6 {[%clk 0:03:03.7]} 40... Bxg6 {[%clk 0:02:43.6]} 41. Rxg6+ {[%clk 0:03:02.1]} 41... Kf7 {[%clk 0:02:43.5]} 42. Rg5 {[%clk 0:02:52.6]} 1-0\n',
  time_control: "600",
  end_time: 1704120789,
  rated: true,
  accuracies: {
    white: 60.51,
    black: 55.33
  },
  tcn: "lB!TbsZJcDYQmu0Sgv9RvK8!oEQIEMIBMT7TKET7DR7RsmBuEu5Qdl1Lec6ZnDRIlsIPmBQGiq96szPYftWOcbXHhg!1ze2UeF1!BvZ8vKY2Fn45pF3NgMGQKvHztO6YqyzrOHrkukYXkB2TnuQ7ut81vKT0KU1UMU!1UM",
  uuid: "66400cca-a8b3-11ee-8c7e-6cfe544c0428",
  initial_setup: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  fen: "1r1n4/1r2qk2/4p3/1B1p1pRp/P2N1P1P/3Q4/1P6/1K1R4 b - -",
  time_class: "rapid",
  rules: "chess",
  white: {
    rating: 1927,
    result: "win",
    "@id": "https://api.chess.com/pub/player/2grizzly",
    username: "2Grizzly",
    uuid: "d94f8058-87ee-11e5-8048-000000000000"
  },
  black: {
    rating: 1937,
    result: "resigned",
    "@id": "https://api.chess.com/pub/player/lhrolim",
    username: "lhrolim",
    uuid: "b79c822c-ac02-11e3-8006-000000000000"
  }
};

const GENERIC_GAME_2 = {
  url: "https://www.chess.com/game/live/97858866315",
  pgn: '[Event "Live Chess"]\n[Site "Chess.com"]\n[Date "2024.01.01"]\n[Round "-"]\n[White "2Grizzly"]\n[Black "lhrolim"]\n[Result "1-0"]\n[CurrentPosition "1r1n4/1r2qk2/4p3/1B1p1pRp/P2N1P1P/3Q4/1P6/1K1R4 b - -"]\n[Timezone "UTC"]\n[ECO "D00"]\n[ECOUrl "https://www.chess.com/openings/Queens-Pawn-Opening-Chigorin-Variation-2...Nf6"]\n[UTCDate "2024.01.01"]\n[UTCTime "14:38:09"]\n[WhiteElo "1927"]\n[BlackElo "1937"]\n[TimeControl "600"]\n[Termination "2Grizzly won by resignation"]\n[StartTime "14:38:09"]\n[EndDate "2024.01.01"]\n[EndTime "14:53:09"]\n[Link "https://www.chess.com/game/live/97858866315"]\n\n1. d4 {[%clk 0:10:00]} 1... Nf6 {[%clk 0:10:00]} 2. Nc3 {[%clk 0:09:58]} 2... d5 {[%clk 0:09:58.5]} 3. Bf4 {[%clk 0:09:55.9]} 3... c6 {[%clk 0:09:56.5]} 4. e3 {[%clk 0:09:54.8]} 4... e6 {[%clk 0:09:54.7]} 5. Nf3 {[%clk 0:09:53.4]} 5... Bd6 {[%clk 0:09:54]} 6. Ne5 {[%clk 0:09:51.3]} 6... O-O {[%clk 0:09:51.6]} 7. g4 {[%clk 0:09:49.5]} 7... c5 {[%clk 0:09:38.3]} 8. g5 {[%clk 0:09:44.5]} 8... cxd4 {[%clk 0:09:08.6]} 9. gxf6 {[%clk 0:09:32.7]} 9... Qxf6 {[%clk 0:09:06.8]} 10. Ng4 {[%clk 0:09:18.3]} 10... Qd8 {[%clk 0:08:57.4]} 11. Bxd6 {[%clk 0:09:11.3]} 11... Qxd6 {[%clk 0:08:57.3]} 12. Ne2 {[%clk 0:09:06]} 12... dxe3 {[%clk 0:08:55]} 13. Nxe3 {[%clk 0:09:03.1]} 13... Nc6 {[%clk 0:08:42]} 14. Qd2 {[%clk 0:08:53.2]} 14... f5 {[%clk 0:08:32.1]} 15. O-O-O {[%clk 0:08:47.1]} 15... Bd7 {[%clk 0:08:18.5]} 16. f4 {[%clk 0:08:44.9]} 16... Qc5 {[%clk 0:08:13.4]} 17. Qc3 {[%clk 0:08:37.9]} 17... Qb6 {[%clk 0:08:11.8]} 18. Nd4 {[%clk 0:08:32.2]} 18... Na5 {[%clk 0:08:01.4]} 19. a3 {[%clk 0:08:18.8]} 19... Rfc8 {[%clk 0:07:58.4]} 20. Qb4 {[%clk 0:08:17.6]} 20... Qc7 {[%clk 0:07:48.4]} 21. Bd3 {[%clk 0:08:09.3]} 21... a6 {[%clk 0:07:36.4]} 22. Kb1 {[%clk 0:08:02.7]} 22... b5 {[%clk 0:07:34.5]} 23. Rhg1 {[%clk 0:07:29.1]} 23... Kf7 {[%clk 0:07:26.2]} 24. Qe1 {[%clk 0:07:14.8]} 24... g6 {[%clk 0:07:10.9]} 25. Qh4 {[%clk 0:07:09.2]} 25... Kg8 {[%clk 0:06:34.4]} 26. Nf3 {[%clk 0:07:01]} 26... Be8 {[%clk 0:06:04.6]} 27. Ne5 {[%clk 0:06:42.4]} 27... Qg7 {[%clk 0:05:37.2]} 28. Qf2 {[%clk 0:06:18.5]} 28... Rab8 {[%clk 0:05:20]} 29. h4 {[%clk 0:05:56.1]} 29... h5 {[%clk 0:05:14.8]} 30. Rg5 {[%clk 0:05:50.2]} 30... Nc6 {[%clk 0:05:07.2]} 31. Nf3 {[%clk 0:04:47]} 31... b4 {[%clk 0:04:55.4]} 32. Bxa6 {[%clk 0:04:31.6]} 32... Rc7 {[%clk 0:04:40.2]} 33. a4 {[%clk 0:04:26.8]} 33... b3 {[%clk 0:04:36.1]} 34. Bb5 {[%clk 0:04:21.3]} 34... bxc2+ {[%clk 0:04:33.2]} 35. Nxc2 {[%clk 0:04:15]} 35... Rcb7 {[%clk 0:04:19.2]} 36. Ncd4 {[%clk 0:03:58.2]} 36... Qf6 {[%clk 0:03:53.1]} 37. Qe3 {[%clk 0:03:42.5]} 37... Nd8 {[%clk 0:03:02.5]} 38. Qd3 {[%clk 0:03:19.8]} 38... Bf7 {[%clk 0:02:52.8]} 39. Ne5 {[%clk 0:03:11.5]} 39... Qe7 {[%clk 0:02:45.3]} 40. Nxg6 {[%clk 0:03:03.7]} 40... Bxg6 {[%clk 0:02:43.6]} 41. Rxg6+ {[%clk 0:03:02.1]} 41... Kf7 {[%clk 0:02:43.5]} 42. Rg5 {[%clk 0:02:52.6]} 1-0\n',
  time_control: "600",
  end_time: 1704120789,
  rated: true,
  accuracies: {
    white: 60.51,
    black: 55.33
  },
  tcn: "lB!TbsZJcDYQmu0Sgv9RvK8!oEQIEMIBMT7TKET7DR7RsmBuEu5Qdl1Lec6ZnDRIlsIPmBQGiq96szPYftWOcbXHhg!1ze2UeF1!BvZ8vKY2Fn45pF3NgMGQKvHztO6YqyzrOHrkukYXkB2TnuQ7ut81vKT0KU1UMU!1UM",
  uuid: "66400cca-a8b3-11ee-8c7e-6cfe544c0428",
  initial_setup: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  fen: "1r1n4/1r2qk2/4p3/1B1p1pRp/P2N1P1P/3Q4/1P6/1K1R4 b - -",
  time_class: "rapid",
  rules: "chess",
  white: {
    rating: 1927,
    result: "win",
    "@id": "https://api.chess.com/pub/player/2grizzly",
    username: "2Grizzly",
    uuid: "d94f8058-87ee-11e5-8048-000000000000"
  },
  black: {
    rating: 1937,
    result: "resigned",
    "@id": "https://api.chess.com/pub/player/lhrolim",
    username: "lhrolim",
    uuid: "b79c822c-ac02-11e3-8006-000000000000"
  }
};
describe.skip("fetchBestAnalyzedGamesOverPastMonths", () => {
  it("should fetch the best analyzed games over the past months", async () => {
    // Mock the axios library
    jest.mock("axios");

    const mockApiResponse = {
      data: {
        games: [GENERIC_GAME]
      }
    };
    (axios.get as jest.Mock).mockResolvedValue(mockApiResponse);

    // Call the function to be tested
    const searchDTO: GameSearchDto = {
      user: "myUsername",
      months: 2,
      minAccuracy: 5,
      gameFormat: GameFormat.Rapid,
      maxGames: 30,
      sortDTO: {
        criteria: SortCriteria.PRECISION,
        desc: true
      }
    };
    const games = await fetchBestAnalyzedGamesOverPastMonths(searchDTO);

    // Assert the expected results
    expect(games).toEqual([
      {
        url: "https://www.chess.com/game/live/97858866315",
        myPrecision: 55.33,
        opponentPrecision: 60.51,
        opponentUserName: "2Grizzly",
        myRating: 1937,
        opponentRating: 1927,
        format: GameFormat.Rapid,
        timestamp: "2024-01-01 14:38:09",
        opening: "https://www.chess.com/openings/Queens-Pawn-Opening-Chigorin-Variation-2...Nf6",
        result: MatchResult.Lost,
        endMatchMode: EndMatchMode.Resign,
        numberOfMoves: 42,
        myClock: "0:02:43.5",
        opponentClock: "0:02:52.6",
        matchTimeInSeconds: "600",
        whiteData: {
          country: undefined,
          finalClock: "0:02:52.6",
          precision: 60.51,
          rating: 1927,
          result: "win",
          username: "2Grizzly"
        },
        blackData: {
          country: undefined,
          finalClock: "0:02:43.5",
          precision: 55.33,
          rating: 1937,
          result: "resigned",
          username: "lhrolim"
        }
      }
      // Add more expected game results here
    ]);
  });
});
