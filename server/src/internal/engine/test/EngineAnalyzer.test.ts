import { EngineAnalyzer } from "../EngineAnalyzer";
import { EngineInput } from "../EngineInput";
import { MoveAnalysis } from "../GameAnalyseResult";
import { StockfishClient } from "../StockfishClient";

jest.mock("../StockfishClient");

describe("EngineAnalyzer", () => {
  let engineAnalyzer: EngineAnalyzer;

  let mockStockfishClient: jest.Mocked<StockfishClient>;

  beforeEach(() => {
    mockStockfishClient = new StockfishClient() as jest.Mocked<StockfishClient>;
    mockStockfishClient.addBufferedListener = jest.fn();
    mockStockfishClient.flush = jest.fn();
    mockStockfishClient.removeDataListener = jest.fn();
    mockStockfishClient.disconnect = jest.fn();
    mockStockfishClient.sendUCICommandsForAnalyzis = jest.fn();

    engineAnalyzer = new EngineAnalyzer(mockStockfishClient);
  });

  afterEach(() => {
    // Clean up any resources used by the EngineAnalyzer instance
  });

  it("should analyze a single move", async () => {
    const engineInput = EngineInput.fromStartPos("e2e4 e7e5");
    const pastMoveAnalysis = new MoveAnalysis();
    const output = `info depth 20 seldepth 26 multipv 1 score cp 33 nodes 2470973 nps 934205 hashfull 800 tbhits 0 time 2645 pv g8f6 g1f3 d7d5 e2e3 c8f5 b2b3 e7e6 c1b2 f8e7 f1e2 c7c5 f3e5 f6d7 g2g4 f5e4 e1g1 d7e5 b2e5 e8g8 d2d3\n`;

    // Simulate the behavior of the client receiving data
    mockStockfishClient.addBufferedListener.mockImplementation((listener: (data: string) => void) => {
      setTimeout(() => {
        listener(output);
      }, 0);
    });

    const result = await engineAnalyzer.analyzeGame(engineInput);

    expect(result.moves).toBeDefined();
    expect(mockStockfishClient.sendUCICommandsForAnalyzis).toHaveBeenCalledWith(engineInput.moves[0], 3, 20);
    expect(mockStockfishClient.sendUCICommandsForAnalyzis).toHaveBeenCalledWith(engineInput.moves[1], 3, 20);
  });

  // Add more test cases for other methods of the EngineAnalyzer class
});
