import { ParseTree, parse as pgnParser } from "@mliebelt/pgn-parser";
import getLogger from "@infra/logging/logger";
const logger = getLogger(__filename);

import { Chess } from "chess.js";
import { EngineMove } from "@internal/engine/domain/EngineInput";
import { forEach } from "typescript-collections/dist/lib/arrays";
import { ClockUtil } from "./ClockUtil";
import { ChessJSDataUtil } from "./ChessJSDataUtil";
import { ChessJSMoveData } from "@internal/chessjs/domain/ChessJSMoveData";
import { MoveUtil, PGNMove } from "./MoveUtil";
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
  return MoveUtil.buildEngineMoves(moves);
};

const parseRawMoves = (pgn: string): Array<PGNMove> => {
  try {
    const moveArray = new Array<PGNMove>();
    const pgnResult = pgnParser(pgn, { startRule: "game" }) as ParseTree;
    let currentClockWhite = NaN;
    let currentClockBlack = NaN;
    for (let i = 0; i < pgnResult.moves.length; i++) {
      const move = pgnResult.moves[i];
      const moveString = move.notation.notation;
      const currentClock = ClockUtil.timeStringToMilliseconds(move.commentDiag.clk);
      const isWhiteMove = i % 2 === 0;
      let timeTaken = NaN;
      if (i % 2 === 0) {
        timeTaken = isNaN(currentClockWhite) ? 0 : currentClockWhite - currentClock;
        currentClockWhite = currentClock;
        if (isNaN(currentClockBlack)) {
          //TODO: fix cases where there are different times
          currentClockBlack = currentClock;
        }
      } else {
        timeTaken = isNaN(currentClockBlack) ? 0 : Math.max(currentClockBlack - currentClock, 0); //avoid negative time which could arise due to different timers
        currentClockBlack = currentClock;
      }
      moveArray.push({ move: moveString, timeTaken: timeTaken });
    }
    return moveArray;
  } catch (e) {
    logger.error("unable to parse game pgn", e);
  }
};
