import * as net from "net";
import { getConfig } from "../../../config";
const config = getConfig();
import getLogger from "@infra/logging/logger";
import { EngineMove } from "../domain/EngineInput";

const logger = getLogger(__filename);

export class StockfishClient {
  private client: net.Socket | null = null;
  private retryInterval: number = 1000; // Retry every 1000ms
  private maxRetries: number = 3; // Maximum of 3 retry attempts
  private retryCount: number = 0;
  private port: number;
  private host: string;
  private commands: string[] = [];
  private skillLevel: number;
  private eloRating: number;
  private threads: number;
  private hashSize: number;
  private optionsSet: boolean = false;
  private connected: boolean = false;
  private initialized: boolean = false;

  constructor() {
    this.port = parseInt(config.server.stockfish.port);
    this.host = config.server.stockfish.host;
    this.connect();
  }

  private initialize(): void {
    if (this.client && !this.initialized) {
      this.bufferCommand("uci");
      this.bufferCommand("isready");
      this.flush();
      this.client.on("data", data => {
        const response = data.toString();
        if (response.includes("readyok")) {
          this.bufferCommand("setoption name Threads value 2"); // Use 2 threads
          this.bufferCommand("setoption name Hash value 1024"); // Set hash size to 128 MB
          this.flush();
          this.initialized = true;
        }
      });
    }
  }

  private connect(): void {
    this.client = net.createConnection({ port: this.port, host: this.host }, () => {
      logger.debug("Connected to Stockfish engine.");
      this.retryCount = 0;
      this.connected = true;
      this.initialize();
    });

    this.client.on("error", err => {
      logger.error("Connection error:", err);
      this.client = null;
      this.connected = false;
      if (this.retryCount < this.maxRetries) {
        setTimeout(() => {
          logger.info(`Retrying connection attempt ${this.retryCount + 1}/${this.maxRetries}...`);
          this.retryCount++;
          this.connect();
        }, this.retryInterval);
      } else {
        logger.error("Maximum retry attempts reached. Giving up.");
      }
    });

    this.client.on("end", () => {
      logger.info("Disconnected from Stockfish engine.");
      this.connected = false;
    });
  }

  public disconnect(): void {
    if (this.client) {
      this.client.end(() => {
        logger.info("Connection to Stockfish engine closed.");
      });
      this.client = null;
    } else {
      logger.info("Not connected to Stockfish engine.");
    }
  }

  public bufferCommand(command: string): void {
    this.commands.push(command);
  }

  private async waitForConnection(timeout: number): Promise<void> {
    const checkInterval = 100;
    let elapsedTime = 0;

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (this.connected) {
          clearInterval(interval);
          resolve();
        } else if (elapsedTime >= timeout) {
          clearInterval(interval);
          reject(new Error("Connection timeout."));
        }
        elapsedTime += checkInterval;
      }, checkInterval);
    });
  }

  private sendCommand(command: string): void {
    try {
      if (this.client) {
        this.client.write(`${command}\n`);
      } else {
        throw new Error("Not connected to Stockfish engine.");
      }
    } catch (error) {
      throw new Error(`Failed to send command: ${error.message}`);
    }
  }

  private removeListener(event: string, listener: (...args: any[]) => void): void {
    if (this.client) {
      this.client.removeListener(event, listener);
    }
  }

  public removeDataListener(listener: (...args: any[]) => void): void {
    this.removeListener("data", listener);
  }

  public addBufferedListener(listener: (data: string) => void): void {
    if (this.client) {
      this.client.removeAllListeners("data");
      this.client.on("data", (data: Buffer) => {
        const trimmedData = data.toString().trim();
        try {
          listener(trimmedData);
        } catch (err) {
          logger.error("Error in listener:", err);
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

  public async flush(): Promise<void> {
    if (!this.connected) {
      await this.waitForConnection(5000); // Wait up to 5 seconds for the connection
    }
    const batchedCommands = this.commands.join("\n") + "\n";
    this.sendCommand(batchedCommands);
    logger.debug(`Commands sent to Stockfish:\n ${this.commands.join("\n ")}`);
    this.commands = [];
  }

  public async sendUCICommandsForAnalysis(input: EngineMove, lines: number, depth: number) {
    if (!this.optionsSet) {
      this.setOptions();
      this.optionsSet = true;
      if (lines > 1) {
        this.commands.push(`setoption name MultiPV value ${lines}`);
      }
    }
    let command = "position";
    if (input.fenPosition) {
      command += ` fen ${input.fenPosition.trim()}`;
    } else if (input.cumulativeStartPos) {
      command += ` startpos moves ${input.cumulativeStartPos.trim()}`;
    }
    this.commands.push(command);
    this.commands.push(`go depth ${depth}`);
    await this.flush();
  }
}
