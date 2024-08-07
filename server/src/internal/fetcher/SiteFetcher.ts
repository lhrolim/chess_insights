import { GameSearchDto, GameResultDTO } from "@api/dtos/GameDtos";

export interface SiteFetcher {
  fetchBestAnalyzedGamesOverPastMonths(gameSearchDTO: GameSearchDto): Promise<GameResultDTO[]>;

  fetchSingleGame(username: string, url: any): Promise<SiteFetcherResultDTO>;
}

export interface SiteFetcherResultDTO {
  url: string;
  pgn: string;
}
