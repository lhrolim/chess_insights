import {
  EndOfGameMode,
  EngineInput,
  GameAnalyzisOptions,
  MoveAnalysis,
  UCIMoveResult,
  UCIResult
} from "./EngineTypes";
import { GameAnalyzisResult } from "./GameAnalyseResult";
import { StockfishClient } from "./StockfishClient";
import { UCIUtil } from "./UCIUtil";

export class EngineAnalyzer {
  client: StockfishClient;
  private resolveAnalysis: ((result: string) => void) | null = null;
  private currentBufferedAnalyzer: ((data: Buffer) => void) | null = null;

  constructor() {
    this.client = new StockfishClient();
  }

  public fullGameAnalysis(
    moves: string[],
    options: GameAnalyzisOptions = { depth: 20, lines: 3 }
  ): Promise<GameAnalyzisResult> {
    return new Promise(resolve => {});
  }

  // Async utility to analyze a single position
  private async analyzeSingleMove(
    engineInput: EngineInput,
    depth: number,
    lines: number,
    pastMoveAnalysis: MoveAnalysis
  ): Promise<MoveAnalysis> {
    return new Promise(resolve => {
      const bufferedAnalyzer = (data: Buffer) => {
        const output = data.toString().trim();
        const isWhiteToMove = engineInput.isWhiteToMove();
        const analyzedNextMoves = this.parseUCIResult(output, depth, isWhiteToMove);
        if (analyzedNextMoves.ignored) {
          //ignoring received entry, could be a stockfish info result as a result of uci
          return;
        }
        let previousScore = pastMoveAnalysis?.positionScore || { score: 0, mate: null, isWhiteToMove };
        const result = new MoveAnalysis();
        result.movePlayed = engineInput.lastMove();
        result.isWhiteToMove = isWhiteToMove;
        result.position = engineInput.startPos;
        result.endOfGame = UCIUtil.isEndOfGame(output, isWhiteToMove);;
        if (result.isEndOfGame()) {
          return resolve(result);
        }
        // the score of the position assuming opponent will play the best move
        result.positionScore = analyzedNextMoves.moves[0].score;
        result.nextMoves = analyzedNextMoves.moves;
        result.moveScoreDelta = UCIUtil.calculateDeltaScore(result.positionScore, previousScore);
        result.category = UCIUtil.categorizeMove(result, pastMoveAnalysis);
        console.log(result);
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

  // Method to analyze all moves
  public async myMovesAnalysis(
    moves: string[],
    options: GameAnalyzisOptions = { depth: 20, lines: 3 }
  ): Promise<GameAnalyzisResult> {
    let analysisResults = [];
    let startPos = "";
    let previousAnalyis: MoveAnalysis = null;
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      startPos += move + " ";
      const adjusteLines = UCIUtil.getRecommendedLines(i, options.lines); //no point in bringing multiple lines at initial positions
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
    return { moves: analysisResults };
  }

  private parseUCIResult(uciAnswer: string, depth: number, isWhiteToMove: boolean): UCIResult {
    const endOfGameCheck = UCIUtil.isEndOfGame(uciAnswer, isWhiteToMove);
    if (endOfGameCheck && endOfGameCheck !== EndOfGameMode.NONE) {
      console.log("Received:\n" + uciAnswer);
      return { moves: [], endOfGame: endOfGameCheck, ignored: false };
    }
    const filteredLines = uciAnswer.split("\n").filter(line => UCIUtil.matchesDepth(line, depth));
    if (filteredLines.length === 0) {
      return { moves: [], endOfGame: endOfGameCheck, ignored: true };
    }
    console.log("Received:\n" + filteredLines);
    const movesResult: UCIMoveResult[] = [];
    for (const line of filteredLines) {
      //if multipv is enabled we will have several move options
      const score = UCIUtil.parseScore(line, isWhiteToMove);
      const move = UCIUtil.parseMove(line);
      movesResult.push({ move, score });
    }
    return { moves: movesResult, endOfGame: endOfGameCheck, ignored: false };
  }

  public returnMoveCandidates(engineInput: EngineInput, depth: number = 20, lines: number = 3): Promise<UCIResult> {
    return new Promise(resolve => {
      const result: MoveAnalysis[] = [];
      const onDataHandler = (data: Buffer) => {
        const output = data.toString().trim();
        const uciResult = this.parseUCIResult(output, depth, engineInput.isWhiteToMove());
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
