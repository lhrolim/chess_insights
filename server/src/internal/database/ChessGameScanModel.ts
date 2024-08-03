import mongoose, { Schema, Document } from "mongoose";

export enum Site {
  chessCom = "chess.com",
  lichess = "lichess.org"
}

/**
 * Represents a Chess Game Scan, used to keep track of the dates already scanned for a user
 */
export interface ChessGameScan extends Document {
  user: string;
  site: Site;
  datesScanned: string[];
}

const chessGameScanSchema = new Schema<ChessGameScan>({
  user: { type: String, required: true },
  site: { type: String, enum: Object.values(Site), required: true },
  datesScanned: { type: [String], required: true }
});

const ChessGameScanModel = mongoose.model<ChessGameScan>("ChessGameScan", chessGameScanSchema);

export default ChessGameScanModel;
