import axios from "axios";
import * as Collections from "typescript-collections";
import { convertEpochToFormattedDate } from "@util/dateutil";
import { PGNParsedData, parseRelevantDataFromPGN } from "@util/pgnparserutil";
import {
  GameResult,
  MatchResult,
  EndMatchMode,
  GameSearchDto,
  SortCriteria,
  gameSearchDtoToString
} from "@api/dtos/GameDtos";

export const fetchBestAnalyzedGamesOverPastMonths = async (gameSearchDTO: GameSearchDto): Promise<GameResult[]> => {
  let ignoredGames = 0;
  const userName = gameSearchDTO.user;
  const sortFunction = (a: GameResult, b: GameResult) => {
    const sortDTO = gameSearchDTO.sortDTO;
    const higherObject = sortDTO.desc ? b : a;
    const lowerObject = sortDTO.desc ? a : b;
    if (sortDTO.criteria === SortCriteria.PRECISION) {
      return higherObject.myPrecision - lowerObject.myPrecision;
    }
    if (sortDTO.criteria === SortCriteria.DATE) {
      return new Date(higherObject.timestamp).getTime() - new Date(lowerObject.timestamp).getTime();
    }
    if (sortDTO.criteria === SortCriteria.MOVES) {
      return higherObject.numberOfMoves - lowerObject.numberOfMoves;
    }
  };
  const results = new Collections.BSTree<GameResult>(sortFunction);
  for (let i = 0; i < gameSearchDTO.months; i++) {
    const date = getPastDate(i);
    const url = `https://api.chess.com/pub/player/${userName}/games/${date.year}/${date.month}`;
    console.log(`Fetching games for ${gameSearchDTO.user} at ${url}`);
    console.log(`applying additional filter ${gameSearchDtoToString(gameSearchDTO)}`);
    const response = await axios.get(url);
    const games = response.data.games;
    for (const game of games) {
      if (!game.accuracies) {
        ignoredGames++;
        continue;
      }
      if (gameSearchDTO.gameFormat && game.time_class !== gameSearchDTO.gameFormat.toString().toLowerCase()) {
        ignoredGames++;
        continue;
      }
      const gameResult = parseGamesFromApiResponse(userName, game);
      if (gameResult.numberOfMoves < gameSearchDTO.minMoves) {
        ignoredGames++;
        continue;
      }
      if (gameResult.myPrecision < gameSearchDTO.minAccuracy) {
        ignoredGames++;
        continue;
      }
      if (!!gameResult) {
        results.add(gameResult);
      }
    }
  }

  return results.toArray().slice(0, gameSearchDTO.maxGames);
};

const parseMatchResult = (myResult: string, opponentResult: string): [MatchResult, EndMatchMode] => {
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

  if (myResult === "resigned" || myResult === "timeout" || myResult === "abandoned" || myResult === "checkmated") {
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

const parseGamesFromApiResponse = (userName: string, game: any): GameResult => {
  const amIPlayingAsWhite = game.white.username === userName ? true : false;
  const opponentUserName = amIPlayingAsWhite ? game.black.username : game.white.username;
  const myResult = amIPlayingAsWhite ? game.white.result : game.black.result;
  const opponentResult = amIPlayingAsWhite ? game.black.result : game.white.result;
  const matchResult = parseMatchResult(myResult, opponentResult);
  if (!matchResult || matchResult[0] == MatchResult.Unknown) {
    console.log("matchResult is null" + game);
    return null;
  }
  let time = convertEpochToFormattedDate(game.end_time);
  const pgnParsedData: PGNParsedData = parseRelevantDataFromPGN(game.pgn, amIPlayingAsWhite);

  return {
    url: game.url,
    myPrecision: amIPlayingAsWhite ? game.accuracies.white : game.accuracies.black,
    opponentPrecision: amIPlayingAsWhite ? game.accuracies.black : game.accuracies.white,
    myRating: amIPlayingAsWhite ? game.white.rating : game.black.rating,
    opponentRating: amIPlayingAsWhite ? game.black.rating : game.white.rating,
    opponentUserName,
    format: game.time_class,
    timestamp: pgnParsedData.startTime ?? time,
    result: matchResult[0],
    endMatchMode: matchResult[1],
    numberOfMoves: pgnParsedData.numberOfMoves,
    opening: pgnParsedData.opening,
    myClock: pgnParsedData.myClock,
    opponentClock: pgnParsedData.opponentClock,
    matchTimeInSeconds: game.time_control,
    whiteData: {
      username: game.white.username,
      country: game.white.country,
      rating: game.white.rating,
      result: game.white.result,
      precision: game.accuracies.white,
      finalClock: pgnParsedData.whiteClock
    },
    blackData: {
      username: game.black.username,
      country: game.black.country,
      rating: game.black.rating,
      result: game.black.result,
      precision: game.accuracies.black,
      finalClock: pgnParsedData.blackClock
    }
  };
};

interface YearAndMonth {
  year: string;
  month: string;
}
