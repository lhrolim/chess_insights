import { MoveAnalysisDTO } from "../domain/MoveAnalysisDTO";

export class MoveAnalysisPOTO {
  public static inMateWeb(moves: number = 2, wasWhiteMove: boolean = true, movePlayed?: string): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.wasWhiteMove = wasWhiteMove;
    moveAnalysis.movePlayed = movePlayed;
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: null, mate: moves } },
      { move: "d6d8", data: { score: null, mate: 4 } },
      { move: "h2h3", data: { score: 955, mate: null } }
    ];
    moveAnalysis.position = "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16"; //to avoid a book move analysis
    return moveAnalysis;
  }

  public static with3EqualOptionsForWhite(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: 50, mate: null } },
      { move: "d6d8", data: { score: 20, mate: null } },
      { move: "d6d7", data: { score: 10, mate: null } }
    ];
    return moveAnalysis;
  }

  public static withOnlyOneDecent(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: 150, mate: null } },
      { move: "d6d8", data: { score: -120, mate: null } },
      { move: "d6d7", data: { score: -300, mate: null } }
    ];
    return moveAnalysis;
  }

  public static withOnlyOneVeryGood(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: 350, mate: null } },
      { move: "d6d8", data: { score: -200, mate: null } },
      { move: "d6d7", data: { score: -300, mate: null } }
    ];
    return moveAnalysis;
  }

  public static withOnlyOneVeryGoodBlack(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: -350, mate: null } },
      { move: "d6d8", data: { score: 200, mate: null } },
      { move: "d6d7", data: { score: 300, mate: null } }
    ];
    return moveAnalysis;
  }

  public static with3MovesLostPositionForWhite(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: -210, mate: null } },
      { move: "d6d8", data: { score: -220, mate: null } },
      { move: "d6d7", data: { score: -250, mate: null } }
    ];
    return moveAnalysis;
  }

  public static with3EqualOptionsForBlack(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: -50, mate: null } },
      { move: "d6d8", data: { score: -20, mate: null } },
      { move: "d6d7", data: { score: -10, mate: null } }
    ];
    return moveAnalysis;
  }

  public static with3OptionsWhiteAdvantage250(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.wasWhiteMove = true;
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: 250, mate: null } },
      { move: "d6d8", data: { score: 220, mate: null } },
      { move: "d6d7", data: { score: 210, mate: null } }
    ];
    return moveAnalysis;
  }

  public static with3OptionsWhiteAdvantage350(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.wasWhiteMove = true;
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: 350, mate: null } },
      { move: "d6d8", data: { score: 220, mate: null } },
      { move: "d6d7", data: { score: 210, mate: null } }
    ];
    return moveAnalysis;
  }

  public static with3OptionsBlackAdvantage250(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: -250, mate: null } },
      { move: "d6d8", data: { score: -220, mate: null } },
      { move: "d6d7", data: { score: -210, mate: null } }
    ];
    return moveAnalysis;
  }

  public static decisiveBlack(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [
      { move: "e6e7", data: { score: -450, mate: null } },
      { move: "d6d8", data: { score: -440, mate: null } },
      { move: "d6d7", data: { score: -430, mate: null } }
    ];
    return moveAnalysis;
  }

  public static blackMistake(): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.wasWhiteMove = false;
    moveAnalysis.nextMoves = [
      { move: "h4g6", data: { score: null, mate: 7 } },
      { move: "g5g6", data: { score: null, mate: 11 } },
      { move: "h2h3", data: { score: 921, mate: null } }
    ];
    return moveAnalysis;
  }

  public static withScore(score: number, whiteMove: boolean = true, nextBestMove = "e6e7"): MoveAnalysisDTO {
    const moveAnalysis = new MoveAnalysisDTO();
    moveAnalysis.nextMoves = [{ move: nextBestMove, data: { score, mate: null } }];
    moveAnalysis.position = "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16"; //to avoid a book move analysis
    moveAnalysis.wasWhiteMove = whiteMove;
    return moveAnalysis;
  }
}
