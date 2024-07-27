import { EndOfGameMode, EngineInput, GameAnalyzisOptions, UCIMoveResult, MoveData, MoveCategory } from "./EngineTypes";

export type GameAnalyzisResult = {
  moves: MoveAnalysis[];
  whitePrecision?: number;
  blackPrecision?: number;
  myFirstMistake?: MoveAnalysis;
  consolidateMoveAnalysis?: ConsolidateMoveAnalysis;
};

export type ConsolidateMoveAnalysis = {
  numberOfBrilliantMoves: number;
  numberOfGreatMoves: number;
  numberOfExcellentMoves: number;
  numberOfGoodMoves: number;
  numberOfInaccuracies: number;
  numberOfMistakes: number;
  numberOfBlunders: number;
  numberOfMisses: number;
  totalMoves: number;
};

export class MoveAnalysis {
  movePlayed: string; // e2e4
  positionScore: MoveData; // { score: 900, mate: 0 } ==> "barrilda!"
  moveScoreDelta: number; // how did the score varied after this move has been played
  category: MoveCategory;
  position?: string;
  nextMoves?: UCIMoveResult[];
  endOfGame: EndOfGameMode;
  isWhiteToMove: boolean;
  rawStockfishOutput?: string;

  isEndOfGame(): boolean {
    return EndOfGameMode.NONE !== this.endOfGame;
  }

  inMateWeb(): boolean {
    return this.positionScore.mate !== null && this.positionScore.mate > 0;
  }

  toString(): string {
    if (this.endOfGame) {
      return `game ended with this move ${this.movePlayed}`;
    }

    const positionScoreString = this.positionScore.score
      ? `Score: ${this.positionScore.score}`
      : `Mate in ${this.positionScore.mate}`;

    return `Move Played: ${this.movePlayed}, Next Best Move: ${this.nextMoves[0]?.move}, Position Score: ${positionScoreString}, Move Score Delta: ${this.moveScoreDelta}, Result: ${this.category}, Position: ${this.position}`;
  }
}
