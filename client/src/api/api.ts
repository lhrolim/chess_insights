import Config from "../config";
import { GameResult, GameSearchDto } from "@ctypes/gameresult";

export async function findBestGames({
  user,
  months,
  minAccuracy,
  minOpponentRating,
  minMoves,
  opening,
  gameFormat,
  maxGames,
  sortDTO: { criteria, desc }
}: GameSearchDto): Promise<Array<GameResult>> {
  const parameters = new URLSearchParams();
  parameters.append("user", user);
  parameters.append("months", months.toString());
  parameters.append("minmoves", (minMoves ?? 0).toString());
  parameters.append("minprecision", (minAccuracy ?? 0).toString());
  parameters.append("maxgames", maxGames.toString());
  parameters.append("sortcriteria", criteria.toString());
  parameters.append("sortdesc", desc.toString());
  const url = `${Config.api.root}/api/games/best?${parameters}`;
  console.log(`Fetching ${url}`);

  try {
    const result = await fetch(url);
    const jsonData = (await result.json()) as any;
    return jsonData as Array<GameResult>;
  } catch (err) {
    console.error(err);
    return [];
  }
}
