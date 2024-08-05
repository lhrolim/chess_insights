import { MoveData } from "../domain/EngineTypes";
import { MoveAnalysisDTO } from "../domain/MoveAnalysisDTO";

export class MoveAnalysisPOTO {
  public static inMateWeb(moves: number = 2, wasWhiteMove: boolean = true, movePlayed?: string): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.wasWhiteMove = wasWhiteMove;
    moveAnalysis.movePlayed = movePlayed;
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: new MoveData(null, moves) },
      { move: "d6d8", data: new MoveData(null, 4) },
      { move: "h2h3", data: new MoveData(955, null) }
    ];
    moveAnalysis.position = "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16"; //to avoid a book move analysis
    return moveAnalysis;
  }

  public static with3EqualOptionsForWhite(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: new MoveData(50, null) },
      { move: "d6d8", data: new MoveData(20, null) },
      { move: "d6d7", data: new MoveData(10, null) }
    ];
    return moveAnalysis;
  }

  public static withOnlyOneDecent(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: new MoveData(150, null) },
      { move: "d6d8", data: new MoveData(-120, null) },
      { move: "d6d7", data: new MoveData(-300, null) }
    ];
    return moveAnalysis;
  }

  public static withOnlyOneVeryGood(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: new MoveData(350, null) },
      { move: "d6d8", data: new MoveData(-200, null) },
      { move: "d6d7", data: new MoveData(-300, null) }
    ];
    return moveAnalysis;
  }

  public static withOnlyOneVeryGoodBlack(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: new MoveData(-350, null) },
      { move: "d6d8", data: new MoveData(200, null) },
      { move: "d6d7", data: new MoveData(300, null) }
    ];
    return moveAnalysis;
  }

  public static with3MovesLostPositionForWhite(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: new MoveData(-210, null) },
      { move: "d6d8", data: new MoveData(-220, null) },
      { move: "d6d7", data: new MoveData(-250, null) }
    ];
    return moveAnalysis;
  }

  public static with3MovesLostPositionCompletelyWhite(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [
      { move: "b7b8", data: new MoveData(-547, null) },
      { move: "g2f3", data: new MoveData(-800, null) },
      { move: "d3f3", data: new MoveData(0, 15) }
    ];
    return moveAnalysis;
  }

  public static with3EqualOptionsForBlack(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: new MoveData(-50, null) },
      { move: "d6d8", data: new MoveData(-20, null) },
      { move: "d6d7", data: new MoveData(-10, null) }
    ];
    return moveAnalysis;
  }

  public static with3OptionsWhiteAdvantage250(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.wasWhiteMove = true;
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: new MoveData(250, null) },
      { move: "d6d8", data: new MoveData(220, null) },
      { move: "d6d7", data: new MoveData(210, null) }
    ];
    return moveAnalysis;
  }

  public static with3OptionsWhiteAdvantage350(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.wasWhiteMove = true;
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: new MoveData(350, null) },
      { move: "d6d8", data: new MoveData(220, null) },
      { move: "d6d7", data: new MoveData(210, null) }
    ];
    return moveAnalysis;
  }

  public static with3OptionsBlackAdvantage250(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: new MoveData(-250, null) },
      { move: "d6d8", data: new MoveData(-220, null) },
      { move: "d6d7", data: new MoveData(-210, null) }
    ];
    return moveAnalysis;
  }

  public static decisiveBlack(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: new MoveData(-450, null) },
      { move: "d6d8", data: new MoveData(-440, null) },
      { move: "d6d7", data: new MoveData(-430, null) }
    ];
    return moveAnalysis;
  }

  public static blackMistake(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.wasWhiteMove = false;
    moveAnalysis.nextMoves = [
      { move: "h4g6", data: new MoveData(null, 7) },
      { move: "g5g6", data: new MoveData(null, 11) },
      { move: "h2h3", data: new MoveData(921, null) }
    ];
    return moveAnalysis;
  }

  public static withScore(score: number, whiteMove: boolean = true, nextBestMove = "e6e7"): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [{ move: nextBestMove, data: new MoveData(score, null) }];
    moveAnalysis.position = "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16"; //to avoid a book move analysis
    moveAnalysis.wasWhiteMove = whiteMove;
    return moveAnalysis;
  }
}
