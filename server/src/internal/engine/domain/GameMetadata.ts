import { DateTime } from "aws-sdk/clients/devicefarm";

export type GameMetadata = {
  url?: string;
  whitePlayer: string;
  blackPlayer: string;
  startTime: string;
  myClock?: string;
  opponentClock?: string;
  opening: string;
  numberOfMoves: number;
  whiteFinalClock: string;
  blackFinalClock: string;
  whiteElo: number;
  blackElo: number;
  result: string;
  timeControl: string;
  modality: GameModality;
};

export enum GameModality {
  Bullet = "Bullet",
  Blitz = "Blitz",
  Rapid = "Rapid",
  Classical = "Classical"
}
