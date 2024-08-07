import { ChessJSContextData } from "./ChessJSContextData";

export type ChessJSMoveData = {
  isSacrifice?: boolean;
  isDevelopmentMove?: boolean;
  isRookLift?: boolean;
  isCapture?: boolean;
  isExchangeCapture?: boolean;
  isFork?: boolean;
  isCheck?: boolean;
  isPin?: boolean;
  isControllingOpenFile?: boolean;
  isControllingSemiOpenFile?: boolean;
  isTempoLost?: boolean;
  isDoublePawnPush?: boolean;
  fen?: string;
  coordinatedMove?: string;
  materialBalance?: number;
  isGambito?: boolean;
  contextBeforeMove?: ChessJSContextData;
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
  materialBalance: 0,
  isGambito: false
};
