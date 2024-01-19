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
    maxGames: max
  } = req.query as {
    user: string;
    format?: string;
    months?: string;
    maxGames?: string;
  };
  if (!userName) {
    res.status(400).send("Please provide a username");
    res.end();
    return;
  }

  let monthsToLookBack = months ? parseInt(months) : 1;
  let maxGamesToReturn = max ? parseInt(max) : 10;
  const gameFormatEnum: GameFormat = gameFormat ? (gameFormat.toLowerCase() as GameFormat) : null;

  const games = await fetchBestAnalyzedGamesOverPastMonths(
    userName,
    monthsToLookBack,
    maxGamesToReturn,
    gameFormatEnum
  );

  res.send(games);
  res.end();
});

export default router;
