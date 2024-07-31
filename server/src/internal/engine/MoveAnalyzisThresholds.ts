export class MoveAnalysisThresholds {
  public static EXCELLENT_CONSTANT = 15; //after that we consider it only a good move
  public static GOOD_CONSTANT = 30; //after that we consider it an innacuracy
  public static INNACURACY_CONSTANT = 50; // after that we consider it a mistake
  public static BLUNDER_CONSTANT = 200; // after that we consider it a mistake

  public static GREAT_CONSTANT = 150;
  public static BRILLIANT_CONSTANT = 300;

  public static EQUALITY_CONSTANT = 50;
  public static DECISIVE_ADVANTAGE = 250;

  public static OPENING_THRESHOLD = 5; //number of moves to consider under a lower depth
}
