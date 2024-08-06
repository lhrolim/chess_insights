import { Move } from "chess.js";
import { ChessJSDataUtil } from "../ChessJSDataUtil";

describe("pieces to recapture logic", () => {
  it("considers exchange ruy lopez", () => {
    const move: Move = {
      from: "b7",
      to: "c6",
      piece: "p",
      captured: "n",
      color: "b",
      flags: "",
      san: "",
      lan: "",
      before: "",
      after: ""
    };
    const result = ChessJSDataUtil.buildCapturePieceData(move, {
      c6: {
        material: 3,
        capturedMaterial: 3,
        color: "w",
        isExchange: false,
        piece: "p",
        capturedPiece: "n"
      }
    });

    expect(result).toBeDefined();
    expect(result.material).toBe(1);
    expect(result.capturedMaterial).toBe(3);
    expect(result.isExchange).toBeTruthy();
  });
});

describe("capture exchange logic", () => {
  it("is not a sacrifice if a pawn is defended by 2 paws and attacked by one bishop", () => {
    expect(ChessJSDataUtil.simulateExchanges("b", [3], [1, 1], 0, 1)).toBeFalsy();
  });

  it("is is a sacrifice n for p", () => {
    expect(ChessJSDataUtil.simulateExchanges("b", [3], [], 1, 3)).toBeTruthy();
  });

  it("not a sacrifice q defending pawn", () => {
    expect(ChessJSDataUtil.simulateExchanges("w", [1], [9], 0, 1)).toBeFalsy();
  });

  it("is is a sacrifice b for p", () => {
    expect(ChessJSDataUtil.simulateExchanges("b", [1], [3], 0, 3)).toBeTruthy();
  });


});
