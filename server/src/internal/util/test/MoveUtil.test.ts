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
