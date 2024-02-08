import { GameSearchDto } from "@api/dtos/GameDtos";
import ChessGameModel, { ChessGame } from "./ChessGameModel"; // Adjust the import path as necessary
import { YearAndMonth } from "@internal/util/dateutil";

export class ChessGameDAO {
  // Method to insert a new chess game into the database
  public static async insertGame(gameData: ChessGame): Promise<ChessGame> {
    const game = new ChessGameModel(gameData);
    await game.save();
    return game;
  }

  public static async insertGamesBulk(games: ChessGame[]): Promise<void> {
    try {
      const operations = games.map(game => ({
        updateOne: {
          filter: { url: game.url }, // Use the URL as the unique identifier
          update: { $setOnInsert: game }, // Set the fields if inserting
          upsert: true // This tells MongoDB to insert a new document if one doesn't exist
        }
      }));

      const result = await ChessGameModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error in insertGamesBulk:", error);
      throw error; // Re-throw the error or handle it as preferred
    }
  }

  public static async bringGamesMatchingCriteria(user: string, criteria: GameSearchDto): Promise<ChessGame[]> {
    const now = new Date();
    const pastDate = new Date(now.setMonth(now.getMonth() - criteria.months));

    let query = ChessGameModel.find({
      user: { $eq: user },
      timestamp: { $gte: pastDate.toISOString() },
      ...(criteria.minAccuracy && { myPrecision: { $gte: criteria.minAccuracy } }),
      ...(criteria.minOpponentRating && { opponentRating: { $gte: criteria.minOpponentRating } }),
      ...(criteria.minMoves && { numberOfMoves: { $gte: criteria.minMoves } }),
      ...(criteria.opening && { opening: criteria.opening }),
      ...(criteria.gameFormat && { format: criteria.gameFormat })
    })
      .limit(criteria.maxGames)
      .sort({ [criteria.sortDTO.criteria]: criteria.sortDTO.desc ? -1 : 1 });

    return query.exec();
  }

  public static async deleteAllEntriesForUser(user: string): Promise<void> {
    try {
      await ChessGameModel.deleteMany({ user });
      console.log(`All entries for user ${user} have been deleted.`);
    } catch (error) {
      console.error("Error in deleteAllEntriesForUser:", error);
      throw error;
    }
  }

  public static async getLastMonthAndYearForUser(user: string): Promise<YearAndMonth | null> {
    try {
      const latestGame = await ChessGameModel.findOne({
        user: { $eq: user }
      })
        .sort({ timestamp: -1 })
        .exec(); // Sort in descending order to get the most recent document

      if (latestGame) {
        const timestamp = new Date(latestGame.timestamp);
        const year = timestamp.getFullYear().toString();
        const month = (timestamp.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed, add 1 to match calendar months

        return { year, month };
      }
      return null;
    } catch (error) {
      console.error("Error in getLastMonthAndYearForUser:", error);
      throw error; // Re-throw the error or handle it as preferred
    }
  }
}
