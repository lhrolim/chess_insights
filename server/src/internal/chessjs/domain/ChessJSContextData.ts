export type ChessJSContextData = {
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
  materialBalance?: number;
  piecesToRecapture: { [key: string]: PiecesToRecapture };
};

export type PiecesToRecapture = {
  material: number;
  capturedMaterial: number;
  color: string;
  // moveNumber: number;
  isExchange: boolean;
  piece: string;
  capturedPiece: string;
};
