import { EndMatchMode, GameFormat, MatchResult } from "@api/dtos/GameDtos";
import mongoose, { Schema, Document } from "mongoose";
import { cwAnalytics, CWANalytics as CWAnalytics } from "./CWAnalyticsModel";

// Assuming GameFormat, MatchResult, and EndMatchMode are enums or types defined elsewhere

interface PlayerData {
  country?: string;
  finalClock: string;
  precision: number;
  rating: number;
  result: string;
  username: string;
  cwAnalytics?: CWAnalytics;
}

export interface ChessGame extends Document {
  user: string;
  url: string;
  pgn: string;
  myPrecision: number;
  opponentPrecision: number;
  opponentUserName: string;
  myRating: number;
  opponentRating: number;
  format: GameFormat;
  timestamp: Date;
  opening: string;
  result: MatchResult;
  endMatchMode: EndMatchMode;
  numberOfMoves: number;
  myClock: string;
  opponentClock: string;
  matchTimeInSeconds: string;
  whiteData: PlayerData;
  blackData: PlayerData;
}

const playerDataSchema = new Schema<PlayerData>(
  {
    country: { type: String, required: false },
    finalClock: { type: String, required: true },
    precision: { type: Number, required: false },
    rating: { type: Number, required: true },
    result: { type: String, required: true },
    username: { type: String, required: true },
    cwAnalytics: { type: cwAnalytics, required: false }
  },
  { _id: false }
);

const chessGameSchema = new Schema<ChessGame>({
  user: { type: String, required: true },
  url: { type: String, required: true },
  pgn: { type: String, required: true },
  myPrecision: { type: Number, required: false },
  opponentPrecision: { type: Number, required: false },
  opponentUserName: { type: String, required: true },
  myRating: { type: Number, required: true },
  opponentRating: { type: Number, required: true },
  format: { type: String, enum: Object.values(GameFormat), required: true },
  timestamp: { type: Date, required: true },
  opening: { type: String, required: true },
  result: { type: String, enum: Object.values(MatchResult), required: true },
  endMatchMode: { type: String, enum: Object.values(EndMatchMode), required: true },
  numberOfMoves: { type: Number, required: true },
  myClock: { type: String, required: true },
  opponentClock: { type: String, required: true },
  matchTimeInSeconds: { type: String, required: true },
  whiteData: { type: playerDataSchema, required: true },
  blackData: { type: playerDataSchema, required: true }
});

chessGameSchema.index({ url: 1 }, { unique: true });

const ChessGameModel = mongoose.model<ChessGame>("ChessGame", chessGameSchema);

export default ChessGameModel;
