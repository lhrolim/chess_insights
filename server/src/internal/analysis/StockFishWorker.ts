// If you're using "worker_threads", ensure to import the necessary parts
import { parentPort } from "worker_threads";
// import Stockfish from "stockfish";
// const engine = Stockfish();
console.log(__dirname);
// const loadEngine = require("../engine/load_engine.js");
// const engine = loadEngine(require("path").join(__dirname, "../engine/stockfish.js"));
const Stockfish = require("stockfish.wasm");
const stockfish = Stockfish();

parentPort.on("message", (moves: string[]) => {
  console.log("Received moves:", moves);
  // Assuming "stockfish" is imported correctly

  stockfish.addEventListener = function (event: any) {
    console.log(event);
    parentPort.postMessage("Analysis done");
  };

  //   engine.onmessage = function (event: any) {
  // console.log(event.data);
  // parentPort.postMessage("Analysis done");
  //   };

  stockfish.postMessage("uci");
  stockfish.postMessage("ucinewgame");

  moves.forEach((move: string) => {
    stockfish.postMessage(`position startpos moves ${move}`);
    stockfish.postMessage("go depth 20");
  });
});
