import { ClockUtil } from "../ClockUtil";

describe("convert to ms", () => {
  it("should convert time string to milliseconds", () => {
    expect(ClockUtil.timeStringToMilliseconds("0:03:00:0")).toEqual(180000);
  });

  it("should convert time string to milliseconds 2", () => {
    expect(ClockUtil.timeStringToMilliseconds("0:03:00:0 ")).toEqual(180000);
  });

  it("should convert time string to milliseconds 3", () => {
    expect(ClockUtil.timeStringToMilliseconds("0:10:00:0 ")).toEqual(600000);
  });

  it("should convert time string to milliseconds 4", () => {
    expect(ClockUtil.timeStringToMilliseconds("1:30:00:0 ")).toEqual(5400000);
  });

  it("should convert time string to milliseconds 5", () => {
    expect(ClockUtil.timeStringToMilliseconds("0:03:00")).toEqual(180000);
  });

  it("should convert time string to milliseconds 5", () => {
    expect(ClockUtil.timeStringToMilliseconds("0:02:58.7")).toEqual(178700);
  });

  it("should return NAN if undefined", () => {
    expect(ClockUtil.timeStringToMilliseconds(null)).toEqual(NaN);
  });
});
