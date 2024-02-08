import { ParseTree, parse as pgnParser } from "@mliebelt/pgn-parser";

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
