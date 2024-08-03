import { getPastDate, numberOfMonthsToCheck } from "../dateutil";

describe("getPastDate", () => {
  it("returns the correct year and month for a given number of months back", () => {
    const monthsBack = 6; // Example: 6 months back
    const expectedDate = new Date();
    expectedDate.setMonth(expectedDate.getMonth() - monthsBack);

    const expectedYear = expectedDate.getFullYear().toString();
    const expectedMonth = (expectedDate.getMonth() + 1).toString().padStart(2, "0");

    const result = getPastDate(monthsBack);

    expect(result.year).toEqual(expectedYear);
    expect(result.month).toEqual(expectedMonth);
  });

  // Additional test cases here...
  it("handles the case for crossing over a year boundary", () => {
    const monthsBack = 12; // Example: 12 months back to test year change
    const expectedDate = new Date();
    expectedDate.setMonth(expectedDate.getMonth() - monthsBack);

    const expectedYear = expectedDate.getFullYear().toString();
    const expectedMonth = (expectedDate.getMonth() + 1).toString().padStart(2, "0");

    const result = getPastDate(monthsBack);

    expect(result.year).toEqual(expectedYear);
    expect(result.month).toEqual(expectedMonth);
  });

  // Test edge cases like 0 months back or very large number of months back
  it("returns the current month and year when 0 months back is given", () => {
    const monthsBack = 0;
    const currentDate = new Date();
    const expectedYear = currentDate.getFullYear().toString();
    const expectedMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");

    const result = getPastDate(monthsBack);

    expect(result.year).toEqual(expectedYear);
    expect(result.month).toEqual(expectedMonth);
  });
});

describe("numberOfMonthsToCheck", () => {
  it("returns max months if not provided", () => {
    const maxMonths = 12;
    const result = numberOfMonthsToCheck(new Date(), maxMonths, null);
    expect(result).toEqual(maxMonths);
  });

  it("calculates diff", () => {
    const maxMonths = 12;
    const date = new Date();
    const pastDate = getPastDate(2);
    const result = numberOfMonthsToCheck(new Date(), maxMonths, pastDate);
    expect(result).toEqual(3);
  });
});
