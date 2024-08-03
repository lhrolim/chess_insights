export class ClockUtil {
  /**
   * Converts a time string to milliseconds.
   *
   * @param timeStr - The time string in the format `h:mm:ss:ms` or `h:mm:ss.s`
   * @returns The equivalent time in milliseconds
   */
  public static timeStringToMilliseconds(timeStr: string): number {
    if (!timeStr) {
      return NaN;
    }

    const parts = timeStr.split(":");

    let milliseconds = 0;

    if (parts.length === 3) {
      // Format is `h:mm:ss.s` or `h:mm:ss`
      const [hoursStr, minutesStr, secondsStr] = parts;
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      const seconds = parseInt(secondsStr, 10);
      let ms = 0;
      if (secondsStr.includes(".")) {
        ms = 100 * parseInt(secondsStr.split(".")[1]);
      }

      milliseconds += minutes * 60 * 1000; // Convert minutes to milliseconds
      milliseconds += Math.floor(seconds) * 1000; // Convert seconds to milliseconds
      milliseconds += (seconds % 1) * 1000; // Add decimal part of seconds as milliseconds
      milliseconds += ms; // Add milliseconds part if exists
    } else if (parts.length === 4) {
      // Format is `h:mm:ss:ms`
      const [hoursStr, minutesStr, secondsStr, msStr] = parts;
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      const seconds = parseInt(secondsStr, 10);
      const ms = parseInt(msStr, 10);

      milliseconds += hours * 60 * 60 * 1000; // Convert hours to milliseconds
      milliseconds += minutes * 60 * 1000; // Convert minutes to milliseconds
      milliseconds += seconds * 1000; // Convert seconds to milliseconds
      milliseconds += ms; // Add milliseconds
    } else {
      throw new Error("Invalid time format");
    }

    return milliseconds;
  }
}
