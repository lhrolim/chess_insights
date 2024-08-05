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
  fen?: string;
  coordinatedMove?: string;
  materialAfter?: number;
  isGambito?: boolean;
};

export const DEFAULT_CHESS_JS_MOVE_DATA: ChessJSMoveData = {
  isSacrifice: false,
  isDevelopmentMove: false,
  isRookLift: false,
  isCapture: false,
  isFork: false,
  isCheck: false,
  isPin: false,
  isControllingOpenFile: false,
  isControllingSemiOpenFile: false,
  isTempoLost: false,
  isDoublePawnPush: false,
  fen: "",
  coordinatedMove: "",
  materialAfter: 0,
  isGambito: false
};