import * as net from "net";
import config from "../../config";
import { UCIUtil } from "./UCIUtil";

export class StockfishClient {
  private client: net.Socket | null = null;
  private retryInterval: number = 1000; // Retry every 1000ms
  private maxRetries: number = 3; // Maximum of 3 retry attempts
  private retryCount: number = 0;
  private port: number;
  private host: string;
  private resolveAnalysis: ((result: string) => void) | null = null;
  private currentBufferedAnalyzer: ((data: Buffer) => void) | null = null;

  constructor() {
    this.port = parseInt(config.server.stockfish.port);
    this.host = config.server.stockfish.host;
    this.connect();
  }

  private connect(): void {
    this.client = net.createConnection({ port: this.port, host: this.host }, () => {
      console.log("Connected to Stockfish engine.");
      this.retryCount = 0;
    });

    this.client.on("error", err => {
      console.error("Connection error:", err);
      this.client = null;
      // Try to reconnect if maximum retries has not been reached
      if (this.retryCount < this.maxRetries) {
        setTimeout(() => {
          console.log(`Retrying connection attempt ${this.retryCount + 1}/${this.maxRetries}...`);
          this.retryCount++;
          this.connect();
        }, this.retryInterval);
      } else {
        console.log("Maximum retry attempts reached. Giving up.");
      }
    });

    this.client.on("end", () => {
      console.log("Disconnected from Stockfish engine.");
      // Handle disconnection if needed
    });
  }

  public disconnect(): void {
    if (this.client) {
      this.client.end(() => {
        console.log("Connection to Stockfish engine closed.");
      });
      this.client = null; // Clear the reference to the socket
    } else {
      console.log("Not connected to Stockfish engine.");
    }
  }

  public sendCommand(command: string): void {
    if (this.client) {
      this.client.write(`${command}\n`);
    } else {
      console.log("Not connected to Stockfish engine.");
    }
  }

  public fullGameAnalysis(
    moves: string[],
    options: GameAnalyzisOptions = { depth: 20, lines: 3 }
  ): Promise<GameAnalyzisResult> {
    return new Promise(resolve => {});
  }

  // Async utility to analyze a single position
  async analyzeSingleMove(
    startPos: string,
    depth: number,
    lines: number,
    shouldAnalyzeMove: boolean
  ): Promise<MoveAnalysis> {
    return new Promise(resolve => {
      const bufferedAnalyzer = (data: Buffer) => {
        const output = data.toString().trim();
        const outputLines = output.split("\n");
        const filteredLines = outputLines.filter(line => UCIUtil.matchesDepth(line, depth));
        for (const line of filteredLines) {
          console.log("Received");
          console.log(line);
          resolve({ move: "e2e4", score: 100, result: MoveResult.Best });
        }
      };
      if (this.currentBufferedAnalyzer) {
        this.client?.removeListener("data", this.currentBufferedAnalyzer);
      }
      // Attach the new listener
      this.client?.on("data", bufferedAnalyzer);
      this.currentBufferedAnalyzer = bufferedAnalyzer; // Store the reference

      const command = `position startpos moves ${startPos}`;
      console.log(`Sending command: ${command}`);
      this.sendCommand(command);
      if (lines > 1) {
        this.sendCommand(`setoption name MultiPV value ${lines}`);
      }
      this.sendCommand(`go depth ${depth}`);
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
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      startPos += move + " ";
      // Accumulate moves up to the current one for each analysis
      const currentMoves = moves.slice(0, i + 1);
      const parityToCheck = amIWhite ? 0 : 1;
      const adjusteLines = UCIUtil.getRecommendedLines(i, options.lines);
      const adjustedDepth = UCIUtil.getRecommendedDepth(i, options.depth);
      const shouldAnalyzeMove = i % 2 === parityToCheck;
      if (shouldAnalyzeMove) {
        console.log(`Analyzing my move ${startPos}`);
      } else {
        console.log("Ignoring opponent's move analysis");
      }
      const result = await this.analyzeSingleMove(startPos, adjustedDepth, adjusteLines, shouldAnalyzeMove);
    }
    try {
      this.disconnect();
    } catch (e) {
      console.error("Error disconnecting:", e);
    }
    return analysisResults;
  }

  public returnMoveCandidates(moves: string[], depth: number = 20, lines: number = 3): Promise<MoveAnalysis[]> {
    return new Promise(resolve => {
      const result: MoveAnalysis[] = [];
      const moveAnalyses: { [key: number]: Partial<MoveAnalysis> & { scoreType?: string } } = {};
      const movesString = this.joinMoves(moves);

      this.sendCommand(`position startpos moves ${lines}`);
      this.sendCommand(`position startpos moves ${movesString}`);
      //   this.sendCommand('d');
      this.sendCommand(`go depth ${depth} multipv ${lines}`);
      const onDataHandler = (data: Buffer) => {
        const output = data.toString().trim();
        const outputLines = output.split("\n");
        for (const line of outputLines) {
          console.log("Received:", line);
          if (!line.startsWith("info") || !line.includes("multipv")) {
            continue;
          }
          this.doAnalyzeStockfishLine(line, moveAnalyses);
        }

        const finalMoveAnalyses = Object.values(moveAnalyses).filter(ma => ma.move && ma.score);

        for (const ma of finalMoveAnalyses) {
          const moveCategory = UCIUtil.categorizeMove(ma.score!);
          result.push({ move: ma.move!, score: ma.score!, result: moveCategory });
        }

        if (Object.keys(moveAnalyses).length === lines && Object.values(moveAnalyses).every(ma => ma.result)) {
          this.client?.removeListener("data", onDataHandler);
          resolve(result);
        }
      };
      this.client?.on("data", onDataHandler);
    });
  }

  private joinMoves(moves: string[]) {
    return moves
      .join(" ")
      .replace(/\d+\.\s*/g, "")
      .replace(/\s+/g, " ");
  }

  private doAnalyzeStockfishLine(
    line: string,
    moveAnalyses: { [key: number]: Partial<MoveAnalysis> & { scoreType?: string } }
  ) {
    const multipvMatch = line.match(/multipv (\d+)/);
    const scoreMatch = line.match(/score cp (-?\d+)/);
    const moveMatch = line.match(/pv\s+([a-h][1-8][a-h][1-8](?:[qrbn])?)/);

    if (multipvMatch) {
      const multipv = parseInt(multipvMatch[1], 10);
      moveAnalyses[multipv] = moveAnalyses[multipv] || {};

      if (scoreMatch) {
        moveAnalyses[multipv].score = parseInt(scoreMatch[1], 10);
        moveAnalyses[multipv].scoreType = scoreMatch[1];
      }

      if (moveMatch) {
        moveAnalyses[multipv].move = moveMatch[1];
      }
    }
  }

  // Additional methods as needed...
}

export type GameAnalyzisOptions = {
  depth: number;
  lines: number;
};

export enum MoveResult {
  Brilliant = "brilliant",
  Great = "great",
  Best = "best",
  Good = "good",
  Innacuracy = "inaccuracy",
  Mistake = "mistake",
  Blunder = "blunder"
}

export type MoveAnalysis = {
  move: string;
  score: number;
  result: MoveResult;
};

export type GameAnalyzisResult = {
  white: MoveAnalysis[];
  black: MoveAnalysis[];
  whitePrecision?: number;
  blackPrecision?: number;
};
