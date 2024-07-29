import * as net from "net";
import config from "../../config";
import { EngineMove } from "./EngineInput";
import getLogger from "@infra/logging/logger";

const logger = getLogger(__filename);

export class StockfishClient {
  private client: net.Socket | null = null;
  private retryInterval: number = 1000; // Retry every 1000ms
  private maxRetries: number = 3; // Maximum of 3 retry attempts
  private retryCount: number = 0;
  private port: number;
  private host: string;
  private commands = [];
  private skillLevel: number;
  private eloRating: number;
  private threads: number;
  private hashSize: number;
  private optionsSet: boolean = false;

  constructor() {
    this.port = parseInt(config.server.stockfish.port);
    this.host = config.server.stockfish.host;
    this.connect();
  }

  private connect(): void {
    this.client = net.createConnection({ port: this.port, host: this.host }, () => {
      logger.debug("Connected to Stockfish engine.");
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

  public bufferCommand(command: string): void {
    this.commands.push(command);
  }

  private sendCommand(command: string): void {
    if (this.client) {
      this.client.write(`${command}\n`);
    } else {
      console.log("Not connected to Stockfish engine.");
    }
  }

  public removeListener(event: string, listener: (...args: any[]) => void): void {
    if (this.client) {
      this.client.removeListener(event, listener);
    }
  }

  public removeDataListener(listener: (...args: any[]) => void): void {
    if (this.client) {
      this.client.removeListener("data", listener);
    }
  }

  public addBufferedListener(listener: (data: string) => void): void {
    if (this.client) {
      this.client.on("data", (data: Buffer) => {
        const trimmedData = data.toString().trim();
        try {
          listener(trimmedData);
        } catch (err) {
          console.error("Error in listener:", err);
        }
      });
    }
  }

  public setSkillLevel = (level: number) => {
    if (level < 0 || level > 20) {
      throw new Error("Skill level must be between 0 and 20");
    }
    this.bufferCommand(`setoption name Skill Level value ${level}`);
  };

  public setEloRating = (elo: number) => {
    // if (elo < 1350 || elo > 2850) {
    //   throw new Error("Elo rating must be between 1350 and 2850");
    // }
    this.bufferCommand(`setoption name UCI_LimitStrength value true`);
    this.bufferCommand(`setoption name UCI_Elo value ${elo}`);
  };

  public setThreads = (threads: number) => {
    this.bufferCommand(`setoption name Threads value ${threads}`);
  };

  private setHashSize = (sizeMb: number) => {
    this.bufferCommand(`setoption name Hash value ${sizeMb}`);
  };

  public setStockfishOptions(options: {
    skillLevel?: number;
    eloRating?: number;
    threads?: number;
    hashSize?: number;
  }) {
    this.skillLevel = options.skillLevel;
    this.eloRating = options.eloRating;
    this.threads = options.threads;
    this.hashSize = options.hashSize;
  }

  private setOptions() {
    if (this.skillLevel !== undefined) this.setSkillLevel(this.skillLevel);
    if (this.eloRating !== undefined) this.setEloRating(this.eloRating);
    if (this.threads !== undefined) this.setThreads(this.threads);
    if (this.hashSize !== undefined) this.setHashSize(this.hashSize);
  }

  public flush(): void {
    for (let i = 0; i < this.commands.length; i++) {
      this.sendCommand(this.commands[i]);
    }
    logger.debug(`Commands sent to Stockfish:\n ${this.commands.join("\n ")}`);
    this.commands = [];
    this.optionsSet = false;
  }

  public sendUCICommandsForAnalyzis(input: EngineMove, lines: number, depth: number) {
    if (!this.optionsSet) {
      this.setOptions();
      this.optionsSet = true;
    }
    let command = "position";
    if (input.fenPosition) {
      command += ` fen ${input.fenPosition.trim()}`;
    } else if (input.cumulativeStartPos) {
      command += ` startpos moves ${input.cumulativeStartPos.trim()}`;
    }
    this.commands.push(command);
    if (lines > 1) {
      this.commands.push(`setoption name MultiPV value ${lines}`);
    }
    this.commands.push(`go depth ${depth}`);
    this.flush();
  }
}




