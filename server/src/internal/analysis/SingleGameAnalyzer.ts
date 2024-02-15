import { Worker } from "worker_threads";
import path from 'path';




// This function simulates analyzing moves using Stockfish in a worker thread
// In this example, we'll just send moves to the worker and log its responses
export async function analyzeMoves(moves: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
      const workerPath = path.resolve(__dirname, 'workerBootstrap.js');
    // Assuming the worker script is 'stockfishWorker.js'
    // You will need to create this worker script as per the structure shown after this code block
    const worker = new Worker(workerPath);

    worker.on("message", result => {
      console.log("Worker message:", result);
      resolve();
    });

    worker.on("error", err => {
      console.error("Worker error:", err);
      reject(err);
    });

    worker.on("exit", code => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });

    // Send the PGN moves to the worker for analysis
    worker.postMessage(moves);
  });
}

// Example usage
const pgn = ["1. e4 e5", "2. Nf3 Nc6", "3. Bb5 a6"];
// analyzeMoves(pgn)
//     .then(() => console.log('Analysis complete.'))
//     .catch(err => console.error('Error analyzing moves:', err));
