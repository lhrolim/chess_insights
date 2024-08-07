import { ChessCOMFetcher } from "./ChessComFetcher";
import { SiteFetcher } from "./SiteFetcher";

export class SiteFetcherFactory {
  public static getSiteFetcher(url: string): SiteFetcher {
    if (url.startsWith("https://www.chess.com")) {
      return new ChessCOMFetcher();
    } else if (url.startsWith("https://lichess.org")) {
      throw new Error("Lichess fetcher not implemented yet");
    } else {
      throw new Error("Invalid URL: Only Chess.com and Lichess.org URLs are supported");
    }
  }
}
