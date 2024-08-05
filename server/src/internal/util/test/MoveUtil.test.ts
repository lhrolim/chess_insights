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

  xit("move is an active sacrifice", () => {
    const italianVariationLine = ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Nc3", "Nxe4"];
    const moves = MoveUtil.buildEngineMoves(italianVariationLine);
    expect(moves[moves.length - 1].fenData?.isSacrifice).toBeTruthy();
    expect(moves[moves.length - 1].fenData?.isCapture).toBeTruthy();
  });
});
