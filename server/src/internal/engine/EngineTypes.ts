export type GameAnalyzisOptions = {
  depth: number;
  lines: number;
};

export enum MoveResult {
  Brilliant = "brilliant",
  Great = "great",
  Best = "best",
  Good = "good",
  Innacuracy = "inaccuracy",
  Mistake = "mistake",
  Blunder = "blunder",
  Miss = "miss"
}

export type UCIMoveResult = {
  move: string;
  score: MoveScore;
};

export type MoveScore = {
  score: number;
  mate: number;
};

export class MoveAnalysis {
  movePlayed: string;
  positionScore: MoveScore;
  moveScoreDelta: number;
  result: MoveResult;
  position?: string;
  nextMoves?: UCIMoveResult[];
  endOfGame: boolean;

  toString(): string {
    if (this.endOfGame) {
      return `game ended with this move ${this.movePlayed}`;
    }

    const positionScoreString = this.positionScore.score
      ? `Score: ${this.positionScore.score}`
      : `Mate in ${this.positionScore.mate}`;

    return `Move Played: ${this.movePlayed}, Next Best Move: ${this.nextMoves[0]?.move}, Position Score: ${positionScoreString}, Move Score Delta: ${this.moveScoreDelta}, Result: ${this.result}, Position: ${this.position}`;
  }
}

export type GameAnalyzisResult = {
  white: MoveAnalysis[];
  black: MoveAnalysis[];
  whitePrecision?: number;
  blackPrecision?: number;
};
