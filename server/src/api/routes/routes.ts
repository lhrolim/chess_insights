import { Request, Response, Router } from "express";

import { GameFormat } from "@internal/fetcher/chesscom";
import { fetchBestAnalyzedGamesOverPastMonths } from "@internal/fetcher/chesscom";

export const subRoute = "/api/games";

const router = Router();

router.get("/best", async (req: Request, res: Response) => {
  let {
    user: userName,
    format: gameFormat,
    months,
    minmoves,
    maxGames: max
  } = req.query as {
    user: string;
    format?: string;
    months?: string;
    minmoves?: string;
    maxGames?: string;
  };
  if (!userName) {
    res.status(400).send("Please provide a username");
    res.end();
    return;
  }

  let monthsToLookBack = months ? parseInt(months) : 1;
  let maxGamesToReturn = max ? parseInt(max) : 20;
  let minNumberOfMoves = max ? parseInt(minmoves) : 0;
  const gameFormatEnum: GameFormat = gameFormat ? (gameFormat.toLowerCase() as GameFormat) : null;

  const games = await fetchBestAnalyzedGamesOverPastMonths(
    userName,
    monthsToLookBack,
    maxGamesToReturn,
    gameFormatEnum,
    minNumberOfMoves
  );

  res.send(games);
  res.end();
});

export default router;
