import { MoveUtil } from "../MoveUtil";

describe("MoveUtil", () => {
  const startMove = 1;
  it("should skip move", () => {
    expect(MoveUtil.shouldSkipMove(0, 1).shouldSkipEntirely).toBeFalsy();
  });

  it("should skip move", () => {
    expect(MoveUtil.shouldSkipMove(50, 26).shouldSkipEntirely).toBeFalsy();
    expect(MoveUtil.shouldSkipMove(48, 26).shouldSkipOnlyResult).toBeTruthy();
    expect(MoveUtil.shouldSkipMove(48, 26).shouldSkipEntirely).toBeFalsy();
    expect(MoveUtil.shouldSkipMove(49, 26).shouldSkipEntirely).toBeFalsy();
    expect(MoveUtil.shouldSkipMove(47, 26).shouldSkipEntirely).toBeTruthy();
    expect(MoveUtil.shouldSkipMove(47, 26).shouldSkipOnlyResult).toBeTruthy();
  });

  it("should skip move", () => {
    expect(MoveUtil.shouldSkipMove(25, 26).shouldSkipEntirely).toBeTruthy();
  });
});

describe("FenData", () => {
  it("move is a passive sacrifice", () => {
    const traxlerCounterAttackLine = [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bc4",
      "Nf6",
      "Ng5",
      "Bc5",
      "Nxf7",
      "Bxf2+",
      "Kxf2",
      "Nxe4+",
      "Ke3",
      "Qh4"
    ];
    MoveUtil.buildEngineMoves(traxlerCounterAttackLine);
  });

  it("move is an active sacrifice", () => {
    const italianVariationLine = ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Nc3", "Nxe4"];
    const moves = MoveUtil.buildEngineMoves(italianVariationLine);
    expect(moves[moves.length - 1].chessJSData?.isCapture).toBeTruthy();
    expect(moves[moves.length - 1].chessJSData?.isSacrifice).toBeTruthy();
  });

  it("move is not an active sacrifice", () => {
    const italianVariationLine = ["e4", "h6", "Bc4", "e6"];
    const moves = MoveUtil.buildEngineMoves(italianVariationLine);
    expect(moves[moves.length - 1].chessJSData?.isCapture).toBeFalsy();
    expect(moves[moves.length - 1].chessJSData?.isSacrifice).toBeFalsy();
  });

  it("move is not an active sacrifice, rather exchange", () => {
    const italianVariationLine = ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6", "Bxc6", "bxc6"];
    const moves = MoveUtil.buildEngineMoves(italianVariationLine);
    expect(moves[moves.length - 2].chessJSData?.isCapture).toBeTruthy();
    expect(moves[moves.length - 2].chessJSData?.isSacrifice).toBeFalsy();
    expect(moves[moves.length - 2].chessJSData?.isExchangeCapture).toBeFalsy();
    expect(moves[moves.length - 2].chessJSData?.materialBalance).toBe(3);
    expect(moves[moves.length - 1].chessJSData?.isCapture).toBeTruthy();
    expect(moves[moves.length - 1].chessJSData?.isSacrifice).toBeFalsy();
    expect(moves[moves.length - 1].chessJSData?.isExchangeCapture).toBeTruthy();
    expect(moves[moves.length - 1].chessJSData?.materialBalance).toBe(0);
  });

  it("already one pawn up move is not an active sacrifice, rather exchange", () => {
    const italianVariationLine = ["e4", "e5", "Nf3", "h6", "Nxe5", "Nc6", "Nxc6", "bxc6"];
    const moves = MoveUtil.buildEngineMoves(italianVariationLine);
    expect(moves[moves.length - 2].chessJSData?.isCapture).toBeTruthy();
    expect(moves[moves.length - 2].chessJSData?.isSacrifice).toBeFalsy();
    expect(moves[moves.length - 2].chessJSData?.isExchangeCapture).toBeFalsy();
    expect(moves[moves.length - 2].chessJSData?.materialBalance).toBe(4);
    expect(moves[moves.length - 1].chessJSData?.isCapture).toBeTruthy();
    expect(moves[moves.length - 1].chessJSData?.isSacrifice).toBeFalsy();
    expect(moves[moves.length - 1].chessJSData?.materialBalance).toBe(1);
    expect(moves[moves.length - 1].chessJSData?.isExchangeCapture).toBeTruthy();
  });

  it("move is not an active sacrifice, rather exchange of pawns", () => {
    const italianVariationLine = ["e4", "e5", "d4"];
    const moves = MoveUtil.buildEngineMoves(italianVariationLine);
    expect(moves[moves.length - 1].chessJSData?.isCapture).toBeFalsy();
    expect(moves[moves.length - 1].chessJSData?.isSacrifice).toBeFalsy();
  });

  it("move is not an active sacrifice, rather exchange of pawns 2", () => {
    const line = [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bc4",
      "Bc5",
      "d3",
      "Nf6",
      "O-O",
      "d6",
      "c3",
      "a5",
      "Bb3",
      "Ba7",
      "Qe2",
      "O-O",
      "Bg5",
      "h6",
      "Be3",
      "Ne7",
      "Nh4",
      "a4",
      "Bc2",
      "Bg4",
      "Nf3",
      "Ng6",
      "d4"
    ];
    const moves = MoveUtil.buildEngineMoves(line);
    expect(moves[moves.length - 1].chessJSData?.isCapture).toBeFalsy();
    expect(moves[moves.length - 1].chessJSData?.isSacrifice).toBeFalsy();
  });
});
