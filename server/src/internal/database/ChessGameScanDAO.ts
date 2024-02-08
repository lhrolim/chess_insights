import { YearAndMonth } from "@internal/util/dateutil";
import ChessGameScanModel, { Site } from "./ChessGameScanModel";

export class ChessGameScanDAO {
  public static async locateDatesAlreadyScanned(user: string, site: Site): Promise<YearAndMonth[]> {
    const result = await ChessGameScanModel.findOne({ user, site }).select("datesScanned -_id");
    if (!result || !result.datesScanned) {
      return [];
    }

    // Convert the datesScanned array from string format "YYYY-MM" to YearAndMonth objects
    const datesScannedAsYearMonth: YearAndMonth[] = result.datesScanned.map(dateStr => {
      const [year, month] = dateStr.split("-");
      return { year, month };
    });

    return datesScannedAsYearMonth;
  }

  public static async markAsScanned(user: string, site: Site, date: YearAndMonth): Promise<void> {
    const dateStr = `${date.year}-${date.month}`;
    await ChessGameScanModel.updateOne(
      { user, site },
      { $addToSet: { datesScanned: dateStr } }, // Use $addToSet to avoid duplicates
      { upsert: true } // Create a new document if one doesn't exist
    );
  }

  public static async deleteAllEntriesForUser(user: string): Promise<void> {
    try {
      await ChessGameScanModel.deleteMany({ user });
      console.log(`All entries for user ${user} have been deleted.`);
    } catch (error) {
      console.error("Error in deleteAllEntriesForUser:", error);
      throw error;
    }
  }
}
