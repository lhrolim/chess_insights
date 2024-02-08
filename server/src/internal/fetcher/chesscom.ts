import axios from "axios";
import * as Collections from "typescript-collections";
import { YearAndMonth, formattedDate, getPastDate } from "@util/dateutil";
import { GameResultDTO, GameSearchDto, SortCriteria } from "@api/dtos/GameDtos";
import { ChessGameDAO } from "@internal/database/ChessGameDAO";
import { ChessGame } from "@internal/database/ChessGameModel";
import { convertGameResultDTOToChessGame, convertToDTO, parseGamesFromApiResponse } from "@util/Converters";
import { ChessGameScanDAO } from "@internal/database/ChessGameScanDAO";
import { Site } from "@internal/database/ChessGameScanModel";

export const fetchBestAnalyzedGamesOverPastMonths = async (gameSearchDTO: GameSearchDto): Promise<GameResultDTO[]> => {
  // ChessGameScanDAO.deleteAllEntriesForUser(gameSearchDTO.user);
  // ChessGameDAO.deleteAllEntriesForUser(gameSearchDTO.user);
  const userName = gameSearchDTO.user;
  const results = new Collections.BSTree<GameResultDTO>(sortFunction(gameSearchDTO));
  const lastDateAvailable = await ChessGameScanDAO.locateDatesAlreadyScanned(userName, Site.chessCom);
  await mergeGamesFromDBWithNewGames(userName, lastDateAvailable, gameSearchDTO.months);
  const games = await ChessGameDAO.bringGamesMatchingCriteria(userName, gameSearchDTO);
  for (const game of games) {
    const gameResult = convertToDTO(game);
    if (!!gameResult) {
      results.add(gameResult);
    }
  }
  console.log(`Found ${Math.min(gameSearchDTO.maxGames, results.size())} games matching the criteria`);
  return results.toArray().slice(0, gameSearchDTO.maxGames);
};

const sortFunction = (gameSearchDTO: GameSearchDto) => {
  return (a: GameResultDTO, b: GameResultDTO) => {
    const sortDTO = gameSearchDTO.sortDTO;
    const higherObject = sortDTO.desc ? b : a;
    const lowerObject = sortDTO.desc ? a : b;
    const dateComparison = new Date(higherObject.timestamp).getTime() - new Date(lowerObject.timestamp).getTime();
    if (sortDTO.criteria === SortCriteria.PRECISION) {
      const basePrecisionComparision = higherObject.myPrecision - lowerObject.myPrecision;
      return basePrecisionComparision === 0 ? dateComparison : basePrecisionComparision;
    }
    if (sortDTO.criteria === SortCriteria.DATE) {
      return new Date(higherObject.timestamp).getTime() - new Date(lowerObject.timestamp).getTime();
    }
    if (sortDTO.criteria === SortCriteria.MOVES) {
      const numberComparison = higherObject.numberOfMoves - lowerObject.numberOfMoves;
      return numberComparison === 0 ? dateComparison : numberComparison;
    }
  };
};

const mergeGamesFromDBWithNewGames = async (
  userName: string,
  alreadyPresentAtDB: YearAndMonth[],
  maxMonths: number
) => {
  for (let i = 0; i < maxMonths; i++) {
    const date = getPastDate(i);
    const presentAtDB = alreadyPresentAtDB.some(d => d.year === date.year && d.month === date.month);
    console.log(`Fetching games for ${date.year}-${date.month} for ${userName}`);
    if (presentAtDB) {
      console.log(`Skipping api call ${date.year}-${date.month} as it is already present at the database`);
      continue;
    }
    const allGames = await findAllgamesFromAPIAtDate(userName, date);
    let bulkList: ChessGame[] = [];
    let j = 1;
    for (const game of allGames) {
      const gameResult = parseGamesFromApiResponse(userName, game);
      if (gameResult === null) {
        continue;
      }
      bulkList.push(convertGameResultDTOToChessGame(gameResult, game.pgn));
      if (bulkList.length === 50) {
        console.log(`[Bulk${j}]: Inserting 50 games for ${userName} at ${date.year}-${date.month}`);
        await ChessGameDAO.insertGamesBulk(bulkList);
        bulkList = [];
        j++;
      }
    }
    console.log(`[Bulk${j}]: Inserting ${bulkList.length} games for ${userName} at ${date.year}-${date.month}`);
    await ChessGameDAO.insertGamesBulk(bulkList);
    if (i !== 0) {
      //avoid marking current month as scanned as users would play more games
      await ChessGameScanDAO.markAsScanned(userName, Site.chessCom, date);
    }
  }
};

const findAllgamesFromAPIAtDate = async (userName: string, date: YearAndMonth): Promise<any[]> => {
  const result: any[] = [];
  const url = `https://api.chess.com/pub/player/${userName}/games/${date.year}/${date.month}`;
  console.log(`Fetching at chess.com api for ${userName} at ${url}`);
  const response = await axios.get(url);
  const games = response.data.games;
  for (const game of games) {
    result.push(game);
  }
  return result;
};
