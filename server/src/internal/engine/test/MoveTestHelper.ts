import { MoveAnalysis } from "../GameAnalyseResult";
import { UCIMoveResult } from "../EngineTypes";

export class MoveAnalysisPOTO {
  public static inMateWeb(): MoveAnalysis {
    const moveAnalysis = new MoveAnalysis();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: 900, mate: 2 } },
      { move: "d6d8", data: { score: 900, mate: 4 } }
    ];
    return moveAnalysis;
  }

  public static with3EqualOptionsForWhite(): MoveAnalysis {
    const moveAnalysis = new MoveAnalysis();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: 50, mate: null } },
      { move: "d6d8", data: { score: 20, mate: null } },
      { move: "d6d7", data: { score: 10, mate: null } }
    ];
    return moveAnalysis;
  }

  public static withOnlyOneDecent(): MoveAnalysis {
    const moveAnalysis = new MoveAnalysis();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: 150, mate: null } },
      { move: "d6d8", data: { score: -120, mate: null } },
      { move: "d6d7", data: { score: -300, mate: null } }
    ];
    return moveAnalysis;
  }

  public static withOnlyOneVeryGood(): MoveAnalysis {
    const moveAnalysis = new MoveAnalysis();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: 350, mate: null } },
      { move: "d6d8", data: { score: -200, mate: null } },
      { move: "d6d7", data: { score: -300, mate: null } }
    ];
    return moveAnalysis;
  }

  public static withOnlyOneVeryGoodBlack(): MoveAnalysis {
    const moveAnalysis = new MoveAnalysis();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: -350, mate: null } },
      { move: "d6d8", data: { score: 200, mate: null } },
      { move: "d6d7", data: { score: 300, mate: null } }
    ];
    return moveAnalysis;
  }

  public static with3MovesLostPositionForWhite(): MoveAnalysis {
    const moveAnalysis = new MoveAnalysis();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: -210, mate: null } },
      { move: "d6d8", data: { score: -220, mate: null } },
      { move: "d6d7", data: { score: -250, mate: null } }
    ];
    return moveAnalysis;
  }

  public static with3EqualOptionsForBlack(): MoveAnalysis {
    const moveAnalysis = new MoveAnalysis();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: -50, mate: null } },
      { move: "d6d8", data: { score: -20, mate: null } },
      { move: "d6d7", data: { score: -10, mate: null } }
    ];
    return moveAnalysis;
  }

  public static with3OptionsWhiteAdvantage250(): MoveAnalysis {
    const moveAnalysis = new MoveAnalysis();
    moveAnalysis.wasWhiteMove = true;
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: 250, mate: null } },
      { move: "d6d8", data: { score: 220, mate: null } },
      { move: "d6d7", data: { score: 210, mate: null } }
    ];
    return moveAnalysis;
  }

  public static with3OptionsWhiteAdvantage350(): MoveAnalysis {
    const moveAnalysis = new MoveAnalysis();
    moveAnalysis.wasWhiteMove = true;
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: 350, mate: null } },
      { move: "d6d8", data: { score: 220, mate: null } },
      { move: "d6d7", data: { score: 210, mate: null } }
    ];
    return moveAnalysis;
  }

  public static with3OptionsBlackAdvantage250(): MoveAnalysis {
    const moveAnalysis = new MoveAnalysis();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: -250, mate: null } },
      { move: "d6d8", data: { score: -220, mate: null } },
      { move: "d6d7", data: { score: -210, mate: null } }
    ];
    return moveAnalysis;
  }

  public static withScore(score: number, whiteMove?: boolean): MoveAnalysis {
    const moveAnalysis = new MoveAnalysis();
    moveAnalysis.nextMoves = [{ move: "e6e7", data: { score, mate: null } }];
    moveAnalysis.wasWhiteMove = whiteMove;
    return moveAnalysis;
  }
}
