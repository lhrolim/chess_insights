import { Request, Response, Router } from "express";

import { GameFormat, GameSearchDto, SortCriteria } from "@api/dtos/GameDtos";
import { fetchBestAnalyzedGamesOverPastMonths } from "@internal/fetcher/chesscom";
import { StockfishClient } from "@internal/engine/StockfishClient";
import { EngineAnalyzer } from "@internal/engine/EngineAnalyzer";
import { EngineInput } from "@internal/engine/EngineInput";
export const subRoute = "/api/games";
import { asyncHandler } from "@infra/middlewares/asyncHandler";

const router = Router();

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

  const games = await fetchBestAnalyzedGamesOverPastMonths(searchDTO);

  res.send(games);
  res.end();
});

router.get("/analyze", async (req: Request, res: Response) => {
  // const engine = Stockfish();
  // await analyzeMoves(["1. e4 e5", "2. Nf3 Nc6", "3. Bb5 a6"]);
  const stockfishClient = new EngineAnalyzer(new StockfishClient());
  // const result = await stockfishClient.returnMoveCandidates(["e2e4", "e7e5", "g1f3", "b8c6", "f1b5", "a7a6","b1c3"], true);
  // const result = await stockfishClient.returnMoveCandidates({
  //   moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5", "a7a6", "b1c3"]
  // });

  // const result = await stockfishClient.returnMoveCandidates(EngineInput.fromMoves(["f2f4", "e7e5", "g2g4"]));
  const options = { depth: 10, lines: 3 };
  const input = EngineInput.fromMoves(["f2f4", "e7e5", "g2g4"]);
  const result = await stockfishClient.analyzeGame(input, options);

  // const result = await stockfishClient.returnMoveCandidates({
  //   fen: "4k3/4P3/4K3/8/8/8/8/8 b - - 0 1"
  // });
  console.log("Analysis result:", result);

  res.send(result);
  res.end();
});

router.post(
  "/analyzePGN",
  asyncHandler(async (req: Request, res: Response) => {
    const engineAnalyzer = new EngineAnalyzer(new StockfishClient());
    const { pgn } = req.body;
    const engineInput = EngineInput.fromPGN(pgn);
    const options = { depth: 15, lines: 3, eloRating: 3500, threads: 8 };
    const result = await engineAnalyzer.analyzeGame(engineInput, options);

    res.send(result);
    res.end();
  })
);

router.post(
  "/candidateMoves",
  asyncHandler(async (req: Request, res: Response) => {
    const engineAnalyzer = new EngineAnalyzer(new StockfishClient());
    const { fen, position } = req.body;
    let engineInput: EngineInput;
    if (fen) {
      engineInput = EngineInput.fromFen(fen);
    } else if (position) {
      engineInput = EngineInput.fromStartPos(position);
    }
    const options = { depth: 15, lines: 3, eloRating: 2500, threads: 8 };
    const result = await engineAnalyzer.findCandidateMoves(engineInput.moves[engineInput.moves.length - 1], options);

    res.send(result);
    res.end();
  })
);

export default router;
