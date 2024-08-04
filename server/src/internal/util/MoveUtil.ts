export class MoveUtil {
  public static shouldSkipMove(i: number, startMove: number): MoveSkipData {
    //adding one as the array begins at 0
    const shouldSkipEntirely = Math.ceil((i + 1) / 2) <= startMove - 2;
    const shouldSkipOnlyResult = Math.ceil((i + 1) / 2) <= startMove - 1;
    return { shouldSkipEntirely, shouldSkipOnlyResult };
  }
}

export type MoveSkipData = {
  shouldSkipEntirely: boolean;
  shouldSkipOnlyResult: boolean;
};
