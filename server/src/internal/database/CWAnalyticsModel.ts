import { Schema } from "mongoose";

export interface CWANalytics {
  numberOfBrilliantMoves?: number;
  numberOfGreatMoves?: number;
  numberOfBestMoves?: number;
  numberOfExcellentMoves?: number;
  numberOfGoodMoves?: number;
  numberOfInaccuracies?: number;
  numberOfMistakes?: number;
  numberOfBlunders?: number;
  numberOfMisses?: number;
  numberOfBookMoves?: number;
  totalMoves?: number;
  cwPrecision?: number;
}

export const cwAnalytics = new Schema<CWANalytics>(
  {
    numberOfBrilliantMoves: { type: Number, required: false },
    numberOfGreatMoves: { type: Number, required: false },
    numberOfBestMoves: { type: Number, required: false },
    numberOfExcellentMoves: { type: Number, required: false },
    numberOfGoodMoves: { type: Number, required: false },
    numberOfInaccuracies: { type: Number, required: false },
    numberOfMistakes: { type: Number, required: false },
    numberOfBlunders: { type: Number, required: false },
    numberOfMisses: { type: Number, required: false },
    numberOfBookMoves: { type: Number, required: false },
    totalMoves: { type: Number, required: false }
  },
  { _id: false }
);
