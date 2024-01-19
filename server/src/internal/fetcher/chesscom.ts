import axios from "axios";
import * as Collections from "typescript-collections";
import { ICompareFunction } from "typescript-collections/dist/lib/util";

export interface GameResult {
  url: string;
  myPrecision: number;
  opponentPrecision: number;
  opponentUserName: string;
  myRating?: number;
  opponentRating?: number;
  format: GameFormat;
  timestamp: number;
  result: MatchResult;
  endMatchMode: EndMatchMode;
}

export enum GameFormat {
  Bullet = "bullet",
  Blitz = "blitz",
  Daily = "daily",
  Rapid = "rapid"
}

export enum MatchResult {
  Draw = "draw",
  Lost = "lost",
  Won = "won",
  Unknown = "unknown" // This should never happen, but just in case it does, we'll have a default optio
}

export enum EndMatchMode {
  Checkmated = "checkmated",
  Resign = "resigned",
  Timeout = "timeout",
  StaleMate = "stalemate",
  TimeVsInsufficient = "timevsinsufficient",
  Insufficient = "insufficient",
  Unknown = "unknown"
}

interface YearAndMonth {
  year: string;
  month: string;
}

export const fetchBestAnalyzedGamesOverPastMonths = async (
  username: string,
  months: number,
  numberOfGames: number,
  gameFormat?: GameFormat
): Promise<GameResult[]> => {
  let ignoredGames = 0;
  const results = new Collections.BSTree<GameResult>(
    (a: GameResult, b: GameResult) => b.myPrecision - a.myPrecision
  );
  for (let i = 0; i < months; i++) {
    const date = getPastDate(months - 1);
    const url = `https://api.chess.com/pub/player/${username}/games/${date.year}/${date.month}`;
    console.log(`Fetching games for ${username} at ${url}`);
    const response = await axios.get(url);
    const games = response.data.games;
    for (const game of games) {
      if (!game.accuracies) {
        ignoredGames++;
        continue;
      }
      if (gameFormat && game.time_class !== gameFormat.toString().toLowerCase()) {
        ignoredGames++;
        continue;
      }
      const gameResult = parseGamesFromApiResponse(username, game);
      results.add(gameResult);
    }
  }

  return results.toArray().slice(0, numberOfGames);
};

const parseMatchResult = (
  myResult: string,
  opponentResult: string
): [MatchResult, EndMatchMode] => {
  if (myResult === "win") {
    return [MatchResult.Won, opponentResult as EndMatchMode];
  }
  if (
    myResult === "insufficient" ||
    myResult === "agreed" ||
    myResult === "repetition" ||
    myResult === "50move" ||
    myResult === "stalemate" ||
    myResult === "timevsinsufficient"
  ) {
    return [MatchResult.Draw, myResult as EndMatchMode];
  }

  if (
    myResult === "resigned" ||
    myResult === "timeout" ||
    myResult === "abandoned" ||
    myResult === "checkmated"
  ) {
    return [MatchResult.Lost, myResult as EndMatchMode];
  }
  return [MatchResult.Lost, EndMatchMode.Unknown];
};

const getPastDate = (months: number): YearAndMonth => {
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() - months);

  const year = currentDate.getFullYear().toString();
  // Get the month and add 1 because getMonth() returns 0-11
  const month = (currentDate.getMonth() + 1).toString();

  // Pad the month with a leading zero if it is less than 10
  const formattedMonth = month.padStart(2, "0");

  return { year, month: formattedMonth };
};

const parseGamesFromApiResponse = (userName: string, game: any) => {
  const amIPlayingAsWhite = game.white.username === userName ? true : false;
  const opponentUserName = amIPlayingAsWhite ? game.black.username : game.white.username;
  const myResult = amIPlayingAsWhite ? game.white.result : game.black.result;
  const opponentResult = amIPlayingAsWhite ? game.black.result : game.white.result;
  const matchResult = parseMatchResult(myResult, opponentResult);
  if (!matchResult || matchResult[0] == MatchResult.Unknown) {
    console.log("matchResult is null" + game);
    throw new Error("matchResult is null");
  }

  return {
    url: game.url,
    myPrecision: amIPlayingAsWhite ? game.accuracies.white : game.accuracies.black,
    opponentPrecision: amIPlayingAsWhite ? game.accuracies.black : game.accuracies.white,
    myRating: amIPlayingAsWhite ? game.white.rating : game.black.rating,
    opponentRating: amIPlayingAsWhite ? game.black.rating : game.white.rating,
    opponentUserName,
    format: game.time_class,
    timestamp: game.start_time,
    result: matchResult[0],
    endMatchMode: matchResult[1]
  };
};
