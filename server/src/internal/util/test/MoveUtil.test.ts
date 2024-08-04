import { MoveUtil } from "../MoveUtil";

describe("MoveUtil", () => {
  const startMove = 1;
  it("should skip move", () => {
    expect(MoveUtil.shouldSkipMove(0, 1)).toBeFalsy();
  });

  it("should skip move", () => {
    expect(MoveUtil.shouldSkipMove(50, 26)).toBeFalsy();
  });

  it("should skip move", () => {
    expect(MoveUtil.shouldSkipMove(25, 26)).toBeTruthy();
  });
});
