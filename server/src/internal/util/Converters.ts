import { EndMatchMode, GameResultDTO, MatchResult } from "@api/dtos/GameDtos";
import ChessGameModel, { ChessGame } from "@internal/database/ChessGameModel";
import { PGNParserUtil } from "./pgnparserutil";
import { convertEpochToFormattedDate, formattedDate } from "./dateutil";
import { GameMetadata } from "@internal/engine/domain/GameMetadata";

export const convertGameResultDTOToChessGame = (dto: GameResultDTO, pgn: string): ChessGame => {
  // Note: Adjust the creation logic based on actual required and optional fields
  const chessGame = new ChessGameModel({
    ...dto,
    timestamp: new Date(dto.timestamp),
    pgn
  });

  return chessGame;
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

export function convertToDTO(game: ChessGame): GameResultDTO {
  const gameObj = game.toObject({ versionKey: false }); // Exclude the __v field if present

  // Handle specific transformations or exclusions
  const { _id, __v, pgn, ...dto } = gameObj;

  // Convert matchTimeInSeconds from string to number if necessary
  dto.matchTimeInSeconds = parseInt(dto.matchTimeInSeconds, 10);

  // Format timestamp or other properties as needed
  dto.timestamp = formattedDate(new Date(dto.timestamp));

  return dto as GameResultDTO;
}

export const parseGamesFromApiResponse = (userName: string, game: any): GameResultDTO => {
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
  const pgnParsedData: GameMetadata = PGNParserUtil.parseGameMetadata(game.pgn, amIPlayingAsWhite);
  if (pgnParsedData == null) {
    console.log("pgnParsedData is null" + game);
    return null;
  }
  const whiteAccuracy = game.accuracies?.white ?? null;
  const blackAccuracy = game.accuracies?.black ?? null;

  return {
    user: userName,
    url: game.url,
    myPrecision: amIPlayingAsWhite ? whiteAccuracy : blackAccuracy,
    opponentPrecision: amIPlayingAsWhite ? blackAccuracy : whiteAccuracy,
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
      precision: whiteAccuracy,
      finalClock: pgnParsedData.whiteFinalClock
    },
    blackData: {
      username: game.black.username,
      country: game.black.country,
      rating: game.black.rating,
      result: game.black.result,
      precision: blackAccuracy,
      finalClock: pgnParsedData.blackFinalClock
    }
  };
};
