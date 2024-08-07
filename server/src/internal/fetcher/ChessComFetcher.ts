import { GameResultDTO, GameSearchDto, SortCriteria } from "@api/dtos/GameDtos";
import getLogger from "@infra/logging/logger";
import { ChessGameDAO } from "@internal/database/ChessGameDAO";
import { ChessGame } from "@internal/database/ChessGameModel";
import { ChessGameScanDAO } from "@internal/database/ChessGameScanDAO";
import { Site } from "@internal/database/ChessGameScanModel";
import { convertGameResultDTOToChessGame, convertToDTO, parseGamesFromApiResponse } from "@util/Converters";
import { YearAndMonth, getPastDate } from "@util/dateutil";
import axios from "axios";
import * as Collections from "typescript-collections";
import { SiteFetcher, SiteFetcherResultDTO } from "./SiteFetcher";

const logger = getLogger(__filename);

const MAX_MONTHS_TO_LOOK_BACK_FOR_GAME = 12;

export const sortFunction = (gameSearchDTO: GameSearchDto) => {
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

export class ChessCOMFetcher implements SiteFetcher {
  public async fetchBestAnalyzedGamesOverPastMonths(gameSearchDTO: GameSearchDto): Promise<GameResultDTO[]> {
    // ChessGameScanDAO.deleteAllEntriesForUser(gameSearchDTO.user);
    // ChessGameDAO.deleteAllEntriesForUser(gameSearchDTO.user);
    const userName = gameSearchDTO.user;
    const results = new Collections.BSTree<GameResultDTO>(sortFunction(gameSearchDTO));
    const lastDateAvailable = await ChessGameScanDAO.locateDatesAlreadyScanned(userName, Site.chessCom);
    await this.mergeGamesFromDBWithNewGames(userName, lastDateAvailable, gameSearchDTO.months);
    const games = await ChessGameDAO.bringGamesMatchingCriteria(userName, gameSearchDTO);
    for (const game of games) {
      const gameResult = convertToDTO(game);
      if (!!gameResult) {
        results.add(gameResult);
      }
    }
    console.log(`Found ${Math.min(gameSearchDTO.maxGames, results.size())} games matching the criteria`);
    return results.toArray().slice(0, gameSearchDTO.maxGames);
  }

  public async fetchSingleGame(userName: string, url: string): Promise<SiteFetcherResultDTO> {
    logger.info(`Fetching game from chess.com at ${url}`);
    const alreadyStored = await ChessGameDAO.findById(url);
    if (alreadyStored) {
      return { url: url, pgn: alreadyStored.pgn };
    }

    const lastDateAvailable = await ChessGameScanDAO.locateDatesAlreadyScanned(userName, Site.chessCom);
    await this.mergeGamesFromDBWithNewGames(
      userName,
      lastDateAvailable,
      MAX_MONTHS_TO_LOOK_BACK_FOR_GAME,
      (chessGamesFound: ChessGame[]) => {
        return chessGamesFound.some(game => game.url === url);
      }
    );
    const game = await ChessGameDAO.findById(url);
    if (!game) {
      logger.error(`Game not found at chess.com at ${url}`);
      return null;
    }
    logger.info(`Returning game from chess.com at ${url}`);
    return { url: url, pgn: game.pgn };
  }

  private async mergeGamesFromDBWithNewGames(
    userName: string,
    alreadyPresentAtDB: YearAndMonth[],
    maxMonths: number,
    callbackStopCondition?: (chessGamesFound: ChessGame[]) => boolean
  ) {
    for (let i = 0; i < maxMonths; i++) {
      const date = getPastDate(i);
      const presentAtDB = alreadyPresentAtDB.some(d => d.year === date.year && d.month === date.month);
      console.log(`Fetching games for ${date.year}-${date.month} for ${userName}`);
      if (presentAtDB) {
        console.log(`Skipping api call ${date.year}-${date.month} as it is already present at the database`);
        continue;
      }
      const allGames = await this.findAllgamesFromAPIAtDate(userName, date);
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
      if (callbackStopCondition && callbackStopCondition(bulkList)) {
        break;
      }
    }
  }

  private async findAllgamesFromAPIAtDate(userName: string, date: YearAndMonth): Promise<any[]> {
    const result: any[] = [];
    const url = `https://api.chess.com/pub/player/${userName}/games/${date.year}/${date.month}`;
    console.log(`Fetching at chess.com api for ${userName} at ${url}`);
    const response = await axios.get(url);
    const games = response.data.games;
    for (const game of games) {
      result.push(game);
    }
    return result;
  }
}
