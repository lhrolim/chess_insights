import { Request, Response, Router } from "express";

import { GameFormat, GameSearchDto, SortCriteria } from "@api/dtos/GameDtos";
import { asyncHandler } from "@infra/middlewares/asyncHandler";
import { EngineAnalyzer } from "@internal/engine/core/EngineAnalyzer";
import { StockfishClient } from "@internal/engine/core/StockfishClient";
import { EngineInput } from "@internal/engine/domain/EngineInput";
import { ChessCOMFetcher } from "@internal/fetcher/ChessComFetcher";
import { PGNParserUtil } from "@internal/util/pgnparserutil";
export const subRoute = "/api/games";

const router = Router();
const engineAnalyzer = new EngineAnalyzer(new StockfishClient());
const chessComFetcher = new ChessCOMFetcher();

router.get("/best", async (req: Request, res: Response) => {
  let {
    user: userName,
    format: gameFormat,
    months,
    minmoves,
    minprecision,
    maxgames
  } = req.query as {
    user: string;
    format?: string;
    months?: string;
    minmoves?: string;
    minprecision?: string;
    maxgames?: string;
  };
  if (!userName) {
    res.status(400).send("Please provide a username");
    res.end();
    return;
  }

  let monthsToLookBack = months ? parseInt(months) : 1;
  let maxGamesToReturn = maxgames ? parseInt(maxgames) : 20;
  let minNumberOfMoves = minmoves ? parseInt(minmoves) : 0;
  let minPrecision = minprecision ? parseInt(minprecision) : 0;
  const gameFormatEnum: GameFormat = gameFormat ? (gameFormat.toLowerCase() as GameFormat) : null;

  const searchDTO: GameSearchDto = {
    user: userName,
    months: monthsToLookBack,
    minMoves: minNumberOfMoves,
    gameFormat: gameFormatEnum,
    maxGames: maxGamesToReturn,
    minAccuracy: minPrecision,
    sortDTO: {
      criteria: SortCriteria.PRECISION,
      desc: true
    }
  };

  const games = await chessComFetcher.fetchBestAnalyzedGamesOverPastMonths(searchDTO);

  res.send(games);
  res.end();
});

export default router;
