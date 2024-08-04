export class MoveUtil {
  public static shouldSkipMove(i: number, startMove: number): boolean {
    //adding one as the array begins at 0
    return Math.ceil((i + 1) / 2) <= startMove - 1;
  }
}
