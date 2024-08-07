export type Piece = {
  piece: string;
  color: string;
  material: number;
};

export type PiecesToRecapture = Piece & {
  material: number;
  capturedMaterial: number;
  isExchange: boolean;
  capturedPiece: string;
};
