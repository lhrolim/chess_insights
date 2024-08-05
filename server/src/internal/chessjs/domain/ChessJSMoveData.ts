export type ChessJSMoveData = {
  isSacrifice?: boolean;
  isDevelopmentMove?: boolean;
  isRookLift?: boolean;
  isCapture?: boolean;
  isFork?: boolean;
  isCheck?: boolean;
  isPin?: boolean;
  isControllingOpenFile?: boolean;
  isControllingSemiOpenFile?: boolean;
  isTempoLost?: boolean;
  isDoublePawnPush?: boolean;
  fen: string;
  coordinatedMove: string;
  materialAfter?: number;
  isGambito?: boolean;
};
