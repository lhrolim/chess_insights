import {
  EngineInput,
  GameAnalyzisOptions,
  GameAnalyzisResult,
  MoveAnalysis,
  MoveCategory,
  UCIMoveResult,
  UCIResult
} from "./EngineTypes";
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
    previousScore: number
  ): Promise<MoveAnalysis> {
    return new Promise(resolve => {
      const bufferedAnalyzer = (data: Buffer) => {
        const output = data.toString().trim();
        const outputLines = output.split("\n");
        const isWhiteToMove = engineInput.isWhiteToMove();
        const result = new MoveAnalysis();
        result.movePlayed = engineInput.lastMove();
        result.isWhiteToMove = isWhiteToMove;
        result.position = engineInput.startPos;
        const isEndOfGame = UCIUtil.isEndOfGame(outputLines, isWhiteToMove);
        const analyzedNextMoves = this.parseUCIResult(output, depth, isWhiteToMove);
        if (analyzedNextMoves.ignored) {
          //ignoring received entry, could be a stockfish info result as a result of uci
          return;
        }
        if (isEndOfGame) {
          result.endOfGame = true;
          resolve(result);
        }
        // the score of the position assuming opponent will play the best move
        result.positionScore = analyzedNextMoves.moves[0].score;
        result.nextMoves = analyzedNextMoves.moves;
        result.moveScoreDelta = UCIUtil.calculateDeltaScore(previousScore, result.positionScore);
        result.result = UCIUtil.categorizeMove(result.moveScoreDelta, lines);
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
    amIWhite: boolean,
    options: GameAnalyzisOptions = { depth: 20, lines: 3 }
  ): Promise<GameAnalyzisResult> {
    let analysisResults = { white: [], black: [] };
    let startPos = "";
    let positionScore = 0;
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      startPos += move + " ";
      // Accumulate moves up to the current one for each analysis
      const currentMoves = moves.slice(0, i + 1);
      const parityToCheck = amIWhite ? 0 : 1;
      const adjusteLines = UCIUtil.getRecommendedLines(i, options.lines);
      const adjustedDepth = UCIUtil.getRecommendedDepth(i, options.depth);
      const logMsg = i % 2 === parityToCheck ? "my move" : "opponent's move";
      console.log(`Analyzing ${logMsg} ${startPos}`);
      const result = await this.analyzeSingleMove(
        EngineInput.fromStartPos(startPos),
        adjustedDepth,
        adjusteLines,
        positionScore
      );
      console.log("analysis:" + result.toString());
      // positionScore = result.positionScore;
    }
    try {
      this.client.disconnect();
    } catch (e) {
      console.error("Error disconnecting:", e);
    }
    return analysisResults;
  }

  private parseUCIResult(uciAnswer: string, depth: number, isWhiteToMove: boolean): UCIResult {
    const lines = uciAnswer.split("\n"); //multi pv mode
    const endOfGameCheck = UCIUtil.isEndOfGame(lines, isWhiteToMove);
    if (endOfGameCheck.isEndOfGame) {
      console.log("Received:\n" + lines);
      return { moves: [], endOfGame: endOfGameCheck, ignored: false };
    }
    const filteredLines = lines.filter(line => UCIUtil.matchesDepth(line, depth));
    if (filteredLines.length === 0) {
      return { moves: [], endOfGame: null, ignored: true };
    }
    console.log("Received:\n" + filteredLines);
    const movesResult: UCIMoveResult[] = [];
    for (const line of filteredLines) {
      //if multipv is enabled we will have several move options
      const score = UCIUtil.parseScore(line, isWhiteToMove);
      const move = UCIUtil.parseMove(line);
      movesResult.push({ move, score });
    }
    return { moves: movesResult, endOfGame: null, ignored: false };
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