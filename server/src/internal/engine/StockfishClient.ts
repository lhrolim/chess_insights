import * as net from "net";
import config from "../../config";

export class StockfishClient {
  private client: net.Socket | null = null;
  private retryInterval: number = 1000; // Retry every 1000ms
  private maxRetries: number = 3; // Maximum of 3 retry attempts
  private retryCount: number = 0;
  private port: number;
  private host: string;

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
        listener(trimmedData);
      });
    }
  }
}


