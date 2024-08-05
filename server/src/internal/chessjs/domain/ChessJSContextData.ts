export type ChessJSContextData = {
  hasBishopPair: boolean;
  hasPassedPawn: boolean;
  hasIsolatedPawn: boolean;
  hasDoubledPawn: boolean;
  hasBackwardPawn: boolean;
  hasPawnMajorityQueen: boolean;
  hasPawnMajorityKing: boolean;
  hasPawnMajorityCenter: boolean;
  isKingSafe: boolean;
  isKingInCenter: boolean;
  allPiecesDeveloped: boolean;
};
