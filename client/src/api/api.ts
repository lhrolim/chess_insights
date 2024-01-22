import Config from "../config";
import { GameResult } from "@ctypes/gameresult";

export async function findBestGames(userName: string, months: number): Promise<Array<GameResult>> {
  const parameters = new URLSearchParams();
  parameters.append("user", userName);
  parameters.append("months", months.toString());
  const url = `${Config.api.root}/api/games/best?${parameters}`;
  console.log(`Fetching ${url}`); 

  try{
    const result = await fetch(url);
    const jsonData =  await result.json() as any;
    return jsonData as Array<GameResult>;
  }catch (err){
    console.error(err);
    return [];
  }
  
}
