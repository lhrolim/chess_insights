import { Piece } from "chess.js";
import { PiecesToRecapture } from "./PieceContextData";

export type ChessJSContextData = {
  whiteContextData?: ColorSpecificContextData;
  blackContextData?: ColorSpecificContextData;
  materialBalance?: number;
  piecesToRecapture?: { [key: string]: PiecesToRecapture };
  hangingPieces?: { [key: string]: Piece };
};

export type ColorSpecificContextData = {
  hasBishopPair?: boolean;
  hasPassedPawn?: boolean;
  hasIsolatedPawn?: boolean;
  hasDoubledPawn?: boolean;
  hasBackwardPawn?: boolean;
  hasPawnMajorityQueen?: boolean;
  hasPawnMajorityKing?: boolean;
  hasPawnMajorityCenter?: boolean;
  isKingSafe?: boolean;
  isKingInCenter?: boolean;
  allPiecesDeveloped?: boolean;
};
