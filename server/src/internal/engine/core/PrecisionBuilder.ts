import { MoveAnalysisDTO } from "../domain/MoveAnalysisDTO";

interface RatingToCPLMapping {
  [rating: number]: number;
}

const ratingToCPL: RatingToCPLMapping = {
  1000: 0.5,
  1100: 0.47,
  1200: 0.44,
  1300: 0.41,
  1400: 0.38,
  1500: 0.35,
  1600: 0.32,
  1700: 0.29,
  1800: 0.26,
  1900: 0.23,
  2000: 0.2,
  2100: 0.17,
  2200: 0.14,
  2300: 0.11,
  2400: 0.08,
  2500: 0.05
};

export class PrecisionBuilder {}
