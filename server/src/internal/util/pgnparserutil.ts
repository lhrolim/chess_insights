import { ParseTree, parse as pgnParser } from "@mliebelt/pgn-parser";
import getLogger from "@infra/logging/logger";
const logger = getLogger(__filename);

import { Chess } from "chess.js";
import { EngineMove } from "@internal/engine/domain/EngineInput";
const chess = new Chess();

export type PGNParsedData = {
  startTime: string;
  myClock: string;
  opponentClock: string;
  opening: string;
  numberOfMoves: number;
  whiteClock: string;
  blackClock: string;
};

export const parseRelevantDataFromPGN = (pgn: string, amIPlayingAsWhite: boolean): PGNParsedData | null => {
  if (!pgn) {
    return null;
  }

  try {
    const pgnResult = pgnParser(pgn, { startRule: "game" }) as ParseTree;
    const tags = pgnResult.tags as any;
    const numberOfMoves = pgnResult.moves[pgnResult.moves.length - 1].moveNumber;
    const opening = tags.ECOUrl;
    let startTime = undefined;
    if (tags.StartTime) {
      // time is more precise from pgn
      startTime = (tags.UTCDate.value + " " + tags.StartTime).replace(/\./g, "-");
    }
    const isLastMoveWhite = (pgnResult.moves.length - 1) % 2 === 0;
    const lastMove = pgnResult.moves[pgnResult.moves.length - 1];
    let myClock = undefined;
    let opponentClock = undefined;
    //edge case when there's abandonement at first move
    const moveBeforeLast = pgnResult.moves.length >= 2 ? pgnResult.moves[pgnResult.moves.length - 2] : null;
    const moveBeforeLastClock = moveBeforeLast ? moveBeforeLast.commentDiag.clk : null;
    const whiteClock = isLastMoveWhite ? lastMove.commentDiag.clk : moveBeforeLastClock;
    const blackClock = isLastMoveWhite ? moveBeforeLastClock : lastMove.commentDiag.clk;

    myClock = amIPlayingAsWhite ? whiteClock : blackClock;
    opponentClock = amIPlayingAsWhite ? blackClock : whiteClock;

    return {
      startTime,
      myClock,
      opponentClock,
      opening: opening,
      numberOfMoves: numberOfMoves,
      whiteClock,
      blackClock
    };
  } catch (e) {
    console.error("unable to parse game pgn", e);
    return null;
  }
};

export const parseMovesFromPGN = (pgn: string): EngineMove[] => {
  const moves = parseRawMoves(pgn);
  return buildEngineMoves(moves);
};

export const buildEngineMoves = (moves: string[]): EngineMove[] => {
  const engineMoves = Array<EngineMove>();
  chess.reset();

  let startPos = "";
  moves.forEach(move => {
    const validMove = chess.move(move);
    if (!validMove) {
      throw new Error("Invalid move");
    }
    const { from, to } = validMove;
    const coordinateMove = from + to;
    startPos += " " + coordinateMove;
    engineMoves.push(new EngineMove(coordinateMove, chess.fen(), startPos.trim()));
  });

  return engineMoves;
};

const parseRawMoves = (pgn: string): string[] => {
  try {
    const pgnResult = pgnParser(pgn, { startRule: "game" }) as ParseTree;
    const moveArray = pgnResult.moves.map(move => move.notation.notation);
    return moveArray;
  } catch (e) {
    logger.error("unable to parse game pgn", e);
  }
};
