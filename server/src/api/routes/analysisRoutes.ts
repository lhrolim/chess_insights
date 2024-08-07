import { Request, Response, Router } from "express";

import { GameFormat, GameSearchDto, SortCriteria } from "@api/dtos/GameDtos";
import { asyncHandler } from "@infra/middlewares/asyncHandler";
import { EngineAnalyzer } from "@internal/engine/core/EngineAnalyzer";
import { StockfishClient } from "@internal/engine/core/StockfishClient";
import { EngineInput } from "@internal/engine/domain/EngineInput";
import { ChessCOMFetcher } from "@internal/fetcher/ChessComFetcher";
import { PGNParserUtil } from "@internal/util/pgnparserutil";
import { SiteFetcherFactory } from "@internal/fetcher/SiteFetcherFactory";
import validator from "validator";
import getLogger, { LogTypes } from "@infra/logging/logger";

export const subRoute = "/api/games/analysis/";

const logger = getLogger(__filename);
const router = Router();
const engineAnalyzer = new EngineAnalyzer(new StockfishClient());

function validateLinkParameters(urlString: string, res: Response<any, Record<string, any>>, userName: string) {
  const isValidUrl = urlString.startsWith("https://www.chess.com") || urlString.startsWith("https://lichess.org");
  const isUrl = validator.isURL(urlString);

  if (!isValidUrl || !isUrl) {
    res.status(400).json({ error: "Invalid URL" });
    res.end();
  }

  if (!userName) {
    res.status(400).json({ error: "Invalid user" });
    res.end();
  }
}

router.get("/test", async (req: Request, res: Response) => {
  // const engine = Stockfish();
  // await analyzeMoves(["1. e4 e5", "2. Nf3 Nc6", "3. Bb5 a6"]);
  const stockfishClient = new EngineAnalyzer(new StockfishClient());
  const moves: string[] = [
    "e2e4",
    "e7e5",
    "g1f3",
    "b8c6",
    "f1c4",
    "f8c5",
    "d2d3",
    "g8f6",
    "e1g1",
    "d7d6",
    "c2c3",
    "a7a5",
    "c4b3",
    "c5a7",
    "d1e2",
    "e8g8",
    "c1g5",
    "h7h6",
    "g5e3",
    "c6e7",
    "f3h4",
    "a5a4",
    "b3c2",
    "c8g4",
    "h4f3",
    "e7g6",
    "d3d4",
    "f6h5",
    "b1d2",
    "h5f4",
    "e3f4",
    "g6f4",
    "e2e3",
    "d8f6",
    "c2a4",
    "g4h3",
    "f3e1",
    "e5d4",
    "c3d4",
    "a7d4",
    "e3f3",
    "f6g5"
  ];

  const input = EngineInput.fromStartPos(
    "e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 d2d3 g8f6 e1g1 d7d6 c2c3 a7a5 c4b3 c5a7 d1e2 e8g8 c1g5 h7h6 g5e3 c6e7 f3h4 a5a4 b3c2 c8g4 h4f3 e7g6 d3d4 f6h5 b1d2 h5f4 e3f4 g6f4 e2e3 d8f6 c2a4 g4h3 f3e1 e5d4 c3d4 a7d4 e3f3 f6g5"
  );
  const result = await stockfishClient.findCandidateMoves(input.moves[input.moves.length - 1], {
    depth: 20,
    lines: 3,
    eloRating: 2500,
    threads: 8
  });
  // const result = await stockfishClient.returnMoveCandidates({
  //   moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5", "a7a6", "b1c3"]
  // });

  // const result = await stockfishClient.returnMoveCandidates(EngineInput.fromMoves(["f2f4", "e7e5", "g2g4"]));
  // const options = { depth: 10, lines: 3 };
  // const input = EngineInput.fromMoves(["f2f4", "e7e5", "g2g4"]);
  // const result = await stockfishClient.analyzeGame(input, options);

  // const result = await stockfishClient.returnMoveCandidates({
  //   fen: "4k3/4P3/4K3/8/8/8/8/8 b - - 0 1"
  // });
  console.log("Analysis result:", result);

  res.send(result);
  res.end();
});

router.post(
  "/pgn",
  asyncHandler(async (req: Request, res: Response) => {
    const { pgn, startmove, depth } = req.body;
    const engineInput = EngineInput.fromPGN(pgn);
    const gameMetadata = PGNParserUtil.parseGameMetadata(pgn, true);
    const depthToUse = depth ? parseInt(depth) : 20;
    const options = { depth: depthToUse, lines: 3, eloRating: 3500, threads: 8, startMove: startmove };
    const result = await engineAnalyzer.analyzeGame(engineInput, options, gameMetadata);

    res.send(result);
    res.end();
  })
);

router.post(
  "/candidates",
  asyncHandler(async (req: Request, res: Response) => {
    const { fen, position } = req.body;
    let engineInput: EngineInput;
    if (fen) {
      engineInput = EngineInput.fromFen(fen);
    } else if (position) {
      engineInput = EngineInput.fromStartPos(position);
    }
    const options = { depth: 20, lines: 3, eloRating: 2500, threads: 8 };
    const result = await engineAnalyzer.findCandidateMoves(engineInput.moves[engineInput.moves.length - 1], options);

    res.send(result);
    res.end();
  })
);

router.get(
  "/link",
  asyncHandler(async (req: Request, res: Response) => {
    const { url, depth, user } = req.query;
    // Ensure the parameters are of the expected type
    const urlString = typeof url === "string" ? url : "";
    const depthToUse = typeof depth === "string" ? parseInt(depth, 10) : 0;
    const userName = typeof user === "string" ? user : "";

    // Validate the URL
    validateLinkParameters(urlString, res, userName);

    const options = { depth: depthToUse, lines: 3, eloRating: 2500, threads: 8 };
    const siteFetcher = SiteFetcherFactory.getSiteFetcher(urlString);
    const game = await siteFetcher.fetchSingleGame(userName, urlString);
    if (game === null) {
      logger.info(`Game not found at ${urlString}`);
      res.status(404).json({ error: "Game not found" });
    }
    const pgn = game.pgn;
    const engineInput = EngineInput.fromPGN(pgn);
    const gameMetadata = PGNParserUtil.parseGameMetadata(pgn, true);
    const result = await engineAnalyzer.analyzeGame(engineInput, options, gameMetadata);

    res.send(result);
    res.end();
  })
);

export default router;
