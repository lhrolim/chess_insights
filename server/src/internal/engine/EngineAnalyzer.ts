import { GameAnalyzisOptions, GameAnalyzisResult, MoveAnalysis, MoveResult, UCIMoveResult } from "./EngineTypes";
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
    startPos: string,
    depth: number,
    lines: number,
    previousScore: number
  ): Promise<MoveAnalysis> {
    return new Promise(resolve => {
      const bufferedAnalyzer = (data: Buffer) => {
        const moveAnalyses: { [key: number]: Partial<MoveAnalysis> & { scoreType?: string } } = {};
        const output = data.toString().trim();
        const outputLines = output.split("\n");
        const isEndOfGame = UCIUtil.isEndOfGame(outputLines);
        const result = new MoveAnalysis();
        const lastMove = startPos.trim().split(" ").pop();
        result.movePlayed = lastMove;
        if (isEndOfGame) {
          result.endOfGame = true;
          resolve(result);
          return;
        }
        const filteredLines = outputLines.filter(line => UCIUtil.matchesDepth(line, depth));
        if (filteredLines.length === 0) {
          //avoid resolving the promise while the depth is not reached
          return;
        }
        const rejoinedOutput = filteredLines.join("\n");
        console.log("received");
        console.log(rejoinedOutput);
        const analyzedNextMoves = this.parseUCIResult(rejoinedOutput);
        console.log(analyzedNextMoves[0].score);
        result.position = startPos;
        // the score of the position assuming opponent will play the best move
        result.positionScore = analyzedNextMoves[0].score;
        result.nextMoves = analyzedNextMoves;
        result.moveScoreDelta = UCIUtil.calculateDeltaScore(previousScore, analyzedNextMoves[0].score);
        result.movePlayed = lastMove;
        result.result = UCIUtil.categorizeMove(result.moveScoreDelta, lines);
        resolve(result);
      };

      if (this.currentBufferedAnalyzer) {
        this.client?.removeDataListener(this.currentBufferedAnalyzer);
      }
      // Attach the new listener
      this.client?.addBufferedListener(bufferedAnalyzer);
      this.currentBufferedAnalyzer = bufferedAnalyzer; // Store the reference

      const command = `position startpos moves ${startPos}`;
      console.log(`Sending command: ${command}`);
      this.client.sendCommand(command);
      if (lines > 1) {
        this.client.sendCommand(`setoption name MultiPV value ${lines}`);
      }
      this.client.sendCommand(`go depth ${depth}`);
    });
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
      const result = await this.analyzeSingleMove(startPos, adjustedDepth, adjusteLines, positionScore);
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

  private parseUCIResult(uciAnswer: string): UCIMoveResult[] {
    const lines = uciAnswer.split("\n"); //multi pv mode
    const result: UCIMoveResult[] = [];
    for (const line of lines) {
      //if multipv is enabled we will have several move options
      const score = UCIUtil.parseScore(line);
      const move = UCIUtil.parseMove(line);
      result.push({ move, score });
    }
    return result;
  }

  // public returnMoveCandidates(moves: string[], depth: number = 20, lines: number = 3): Promise<MoveAnalysis[]> {
  //   return new Promise(resolve => {
  //     const result: MoveAnalysis[] = [];
  //     const moveAnalyses: { [key: number]: Partial<MoveAnalysis> & { scoreType?: string } } = {};
  //     const movesString = UCIUtil.joinMoves(moves);

  //     this.client.sendCommand(`position startpos moves ${movesString}`);
  //     //   this.sendCommand('d');
  //     this.client.sendCommand(`go depth ${depth} multipv ${lines}`);
  //     const onDataHandler = (data: Buffer) => {
  //       const output = data.toString().trim();
  //       const outputLines = output.split("\n");
  //       const uciResult = this.parseUCIResult(output);

  //       const finalMoveAnalyses = Object.values(moveAnalyses).filter(ma => ma.nextBestMove && ma.moveScoreDelta);

  //       // for (const ma of finalMoveAnalyses) {
  //       //   const moveCategory = UCIUtil.categorizeMove(ma.moveScoreDelta!);
  //       //   result.push({
  //       //     move: ma.move!,
  //       //     moveScoreDelta: ma.moveScoreDelta!,
  //       //     result: moveCategory,
  //       //     positionScore: ma.positionScore!
  //       //   });
  //       // }

  //       if (Object.keys(moveAnalyses).length === lines && Object.values(moveAnalyses).every(ma => ma.result)) {
  //         this.client?.removeDataListener(onDataHandler);
  //         resolve(result);
  //       }
  //     };
  //     this.client?.addBufferedListener(onDataHandler);
  //   });
  // }

  // Additional methods as needed...
}
