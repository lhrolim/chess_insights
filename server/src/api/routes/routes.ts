import { Request, Response, Router } from "express";

import { GameFormat, GameSearchDto, SortCriteria } from "@api/dtos/GameDtos";
import { fetchBestAnalyzedGamesOverPastMonths } from "@internal/fetcher/chesscom";

export const subRoute = "/api/games";

const router = Router();

router.get("/best", async (req: Request, res: Response) => {
  let {
    user: userName,
    format: gameFormat,
    months,
    minmoves,
    minprecision,
    maxGames
  } = req.query as {
    user: string;
    format?: string;
    months?: string;
    minmoves?: string;
    minprecision?: string;
    maxGames?: string;
  };
  if (!userName) {
    res.status(400).send("Please provide a username");
    res.end();
    return;
  }

  let monthsToLookBack = months ? parseInt(months) : 1;
  let maxGamesToReturn = maxGames ? parseInt(maxGames) : 20;
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

  const games = await fetchBestAnalyzedGamesOverPastMonths(searchDTO);

  res.send(games);
  res.end();
});

export default router;
