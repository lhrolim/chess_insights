import { GameFormat, GameSearchDto, SortCriteria } from "@api/dtos/GameDtos";
import { SQSProducer } from "@infra/sqs/SQSProducer";
import { fetchBestAnalyzedGamesOverPastMonths } from "@internal/fetcher/chesscom";
import { Request, Response, Router } from "express";

export const subRoute = "/api/games/batch";

import Config from "../../config";

const router = Router();
const producer = new SQSProducer();

import getLogger from "@infra/logging/logger";
import { asyncHandler } from "@infra/middlewares/asyncHandler";
const logger = getLogger(__filename);

router.get(
  "/analyze",
  asyncHandler(async (req: Request, res: Response) => {
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

    const games = await fetchBestAnalyzedGamesOverPastMonths(searchDTO);
    games.forEach(game => {
      logger.info(`Sending game ${game.url} to SQS`);
      producer.sendMessage(Config.server.aws.sqs.topic_names.pgn, game.url);
    });
    res.send(games.map(game => game.url));
  })
);

export default router;
