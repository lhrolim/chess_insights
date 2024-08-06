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
