import { EngineAnalyzer } from "./EngineAnalyzer";

describe("EngineAnalyzer", () => {
    let engineAnalyzer: EngineAnalyzer;

    beforeEach(() => {
        engineAnalyzer = new EngineAnalyzer();
    });

    afterEach(() => {
        // Clean up any resources used by the EngineAnalyzer instance
    });

    it("should analyze a full game", async () => {
        const moves = ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "g8f6"];
        const options = { depth: 20, lines: 3 };

        const result = await engineAnalyzer.fullGameAnalysis(moves, options);

        // Assert the result of the full game analysis
        expect(result).toBeDefined();
        // Add more assertions as needed
    });


    // Add more test cases for other methods of the EngineAnalyzer class

});
