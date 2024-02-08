import moment from "moment";

export const convertEpochToFormattedDate = (epoch: number): string => {
  return moment.unix(epoch).format("YYYY-MM-DD hh:mm");
};

export const formattedDate = (date: Date): string => {
  return moment(date).format("YYYY-MM-DD hh:mm");
};

export const getPastDate = (months: number): YearAndMonth => {
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() - months);

  const year = currentDate.getFullYear().toString();
  // Get the month and add 1 because getMonth() returns 0-11
  const month = (currentDate.getMonth() + 1).toString();

  // Pad the month with a leading zero if it is less than 10
  const formattedMonth = month.padStart(2, "0");

  return { year, month: formattedMonth };
};

export const numberOfMonthsToCheck = (currentDate: Date, maxMonths: number, referenceDate?: YearAndMonth): number => {
  if (!referenceDate) {
    return maxMonths;
  }
  const givenDate = new Date(parseInt(referenceDate.year), parseInt(referenceDate.month) - 1);

  // Ensure givenDate is set to the first of the month to avoid day-of-month issues
  givenDate.setDate(1);
  currentDate.setDate(1);

  const yearsDifference = currentDate.getFullYear() - givenDate.getFullYear();
  const monthsDifference = currentDate.getMonth() - givenDate.getMonth();
  const totalMonthsDifference = yearsDifference * 12 + monthsDifference;

  // Adding one extra month to the result
  return totalMonthsDifference + 1;
};

export interface YearAndMonth {
  year: string;
  month: string;
}
