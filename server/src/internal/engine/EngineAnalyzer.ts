import { EndOfGameMode, GameAnalyzisOptions, UCIMoveResult, UCIResult } from "./EngineTypes";
import { GameAnalyzisResult, MoveAnalysis } from "./GameAnalyseResult";
import { IEngineAnalyzer } from "./IEngineAnalyzer";
import { StockfishClient } from "./StockfishClient";
import { UCIUtil } from "./UCIUtil";
import getLogger from "@infra/logging/logger";
import config from "../../config";
import { EngineInput } from "./EngineInput";

const logger = getLogger(__filename);

export class EngineAnalyzer implements IEngineAnalyzer {
  client: StockfishClient;
  private resolveAnalysis: ((result: string) => void) | null = null;
  private currentBufferedAnalyzer: ((data: string) => void) | null = null;

  constructor(stockFishClient?: StockfishClient) {
    this.client = stockFishClient;
  }

  // Async utility to analyze a single position
  private async analyzeSingleMove(
    engineInput: EngineInput,
    depth: number,
    lines: number,
    pastMoveAnalysis: MoveAnalysis
  ): Promise<MoveAnalysis> {
    return new Promise(resolve => {
      const bufferedAnalyzer = (output: string) => {
        const isWhiteToMove = engineInput.isWhiteToMove();
        const analyzedNextMoves = UCIUtil.parseUCIResult(output, depth, isWhiteToMove);
        if (analyzedNextMoves.ignored) {
          //ignoring received entry, could be a stockfish info result as a result of uci
          return;
        }
        let previousScore = pastMoveAnalysis?.positionScore || { score: 0, mate: null, isWhiteToMove };
        const result = new MoveAnalysis();
        result.movePlayed = engineInput.lastMove();
        result.isWhiteToMove = isWhiteToMove;
        result.position = engineInput.startPos;
        result.endOfGame = UCIUtil.isEndOfGame(output, isWhiteToMove);
        if (result.isEndOfGame()) {
          return resolve(result);
        }
        // the score of the position assuming opponent will play the best move
        result.positionScore = analyzedNextMoves.moves[0].data;
        result.nextMoves = analyzedNextMoves.moves;
        result.moveScoreDelta = UCIUtil.calculateDeltaScore(result.positionScore, previousScore);
        result.category = UCIUtil.categorizeMove(result, pastMoveAnalysis);
        result.rawStockfishOutput = output;
        logger.debug(result);
        resolve(result);
      };

      if (this.currentBufferedAnalyzer) {
        this.client?.removeDataListener(this.currentBufferedAnalyzer);
      }
      // Attach the new listener
      this.client?.addBufferedListener(bufferedAnalyzer);
      this.currentBufferedAnalyzer = bufferedAnalyzer; // Store the reference
      this.sendUCICommandsForAnalyzis(engineInput, lines, depth);
    });
  }

  private sendUCICommandsForAnalyzis(input: EngineInput, lines: number, depth: number) {
    let command = "position";
    if (input.startPos) {
      command += ` startpos moves ${input.startPos}`;
    } else if (input.fen) {
      command += ` fen ${input.fen}`;
    } else {
      command += ` startpos moves ${input.moves.join(" ")}`;
    }
    console.log(`Sending command: ${command}`);
    this.client.sendCommand(command);
    // this.client.sendCommand("d");
    if (lines > 1) {
      this.client.sendCommand(`setoption name MultiPV value ${lines}`);
    }
    this.client.sendCommand(`go depth ${depth}`);
  }

  public async analyzeGame(engineInput: EngineInput, options?: GameAnalyzisOptions): Promise<GameAnalyzisResult> {
    logger.info(`Analyzing game: ${engineInput.moves}`);
    const start = performance.now();
    const result = await this.myMovesAnalysis(engineInput.moves, options);
    const finish = performance.now();
    logger.info(`Analysis done took ${finish - start} milliseconds`);
    return result;
  }

  // Method to analyze all moves
  public async myMovesAnalysis(
    moves: string[],
    options: GameAnalyzisOptions = { depth: 20, lines: 3 }
  ): Promise<GameAnalyzisResult> {
    let analysisResults = Array<MoveAnalysis>();
    let startPos = "";
    let previousAnalyis: MoveAnalysis = null;
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      startPos += move + " ";
      // const adjusteLines = UCIUtil.getRecommendedLines(i, options.lines); //no point in bringing multiple lines at initial positions
      const adjusteLines = 3;
      const adjustedDepth = UCIUtil.getRecommendedDepth(i, options.depth); //no point in high depth at initial positions
      console.log(`Analyzing game ${startPos}`);
      const result = await this.analyzeSingleMove(
        EngineInput.fromStartPos(startPos),
        adjustedDepth,
        adjusteLines,
        previousAnalyis
      );
      console.log("analysis:" + result.toString());
      analysisResults.push(result);
      previousAnalyis = result;
    }
    try {
      this.client.disconnect();
    } catch (e) {
      console.error("Error disconnecting:", e);
    }
    console.log(config.server.env);
    if (config.server.isLocal()) {
      logFullStockFishOutput(analysisResults);
    }
    return { moves: analysisResults };
  }

  public returnMoveCandidates(engineInput: EngineInput, depth: number = 20, lines: number = 3): Promise<UCIResult> {
    return new Promise(resolve => {
      const result: MoveAnalysis[] = [];
      const onDataHandler = (output: string) => {
        const uciResult = UCIUtil.parseUCIResult(output, depth, engineInput.isWhiteToMove());
        if (uciResult.ignored) {
          //ignoring this line
          return;
        }
        resolve(uciResult);
      };
      this.sendUCICommandsForAnalyzis(engineInput, lines, depth);
      this.client?.addBufferedListener(onDataHandler);
    });
  }

  // Additional methods as needed...
}
function logFullStockFishOutput(analysisResults: Array<MoveAnalysis>) {
  logger.debug("Full analysis results:");
  analysisResults.forEach((analysis, index) => {
    const moveNumber = Math.floor((index + 2) / 2);
    logger.debug(`Move ${moveNumber} ${analysis.isWhiteToMove ? "W" : "B"}: ${analysis.movePlayed}`);
    logger.debug(`Position: ${analysis.position}`);
    logger.debug(`Output: ${analysis.rawStockfishOutput}`);
  });
}
