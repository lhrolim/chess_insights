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
    if (pgnResult.moves.length < 2) {
      // abandonement
      return null;
    }
    const tags = pgnResult.tags as any;
    const numberOfMoves = pgnResult.moves[pgnResult.moves.length - 1].moveNumber;
    const opening = tags.ECOUrl;
    let startTime = undefined;
    if (tags.StartTime) {
      // time is more precise from pgn
      startTime = (tags.UTCDate.value + " " + tags.StartTime).replace(/\./g, "-");
    }
    const isLastMoveWhite = (pgnResult.moves.length -1) % 2 === 0;
    const lastMove = pgnResult.moves[pgnResult.moves.length - 1];
    const moveBeforeLast = pgnResult.moves[pgnResult.moves.length - 2];
    let myClock = undefined;
    let opponentClock = undefined;
    const whiteClock = isLastMoveWhite ? lastMove.commentDiag.clk : moveBeforeLast.commentDiag.clk;
    const blackClock = isLastMoveWhite ? moveBeforeLast.commentDiag.clk : lastMove.commentDiag.clk;

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
