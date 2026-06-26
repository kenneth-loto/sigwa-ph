import { describe, expect, test } from "bun:test";
import {
  calculateACEForInterval,
  calculateTotalStormACE,
} from "../ace-calculation";

describe("ACE Calculation", () => {
  test("single interval at 100 knots returns 1.0", () => {
    expect(calculateACEForInterval(100)).toBe(1);
  });

  test("single interval at 170 knots (Yolanda peak) returns 2.89", () => {
    expect(calculateACEForInterval(170)).toBeCloseTo(2.89, 2);
  });

  test("two-point storm sums correctly", () => {
    const track = [
      {
        lat: 11,
        lon: 125,
        windKnots: 100,
        timestamp: new Date("2013-11-08T00:00:00Z"),
      },
      {
        lat: 12,
        lon: 124,
        windKnots: 60,
        timestamp: new Date("2013-11-08T06:00:00Z"),
      },
    ];
    expect(calculateTotalStormACE(track)).toBeCloseTo(1.36, 2);
  });

  test("empty track returns 0, not NaN", () => {
    expect(calculateTotalStormACE([])).toBe(0);
  });

  test("returns 0 for sub-tropical-storm winds below 34 knots", () => {
    expect(calculateACEForInterval(0)).toBe(0);
    expect(calculateACEForInterval(33)).toBe(0);
  });

  test("counts interval at exactly 34 knots (tropical storm threshold)", () => {
    expect(calculateACEForInterval(34)).toBeCloseTo(0.1156, 4);
  });

  test("sub-threshold points contribute 0 to total storm ACE", () => {
    const track = [
      {
        lat: 11,
        lon: 125,
        windKnots: 33,
        timestamp: new Date("2013-11-08T00:00:00Z"),
      },
      {
        lat: 12,
        lon: 124,
        windKnots: 100,
        timestamp: new Date("2013-11-08T06:00:00Z"),
      },
    ];
    expect(calculateTotalStormACE(track)).toBeCloseTo(1.0, 4);
  });
  test("non-synoptic hour points are excluded from ACE total", () => {
    const track = [
      {
        lat: 11,
        lon: 125,
        windKnots: 100,
        timestamp: new Date("2013-11-08T00:00:00Z"),
      }, // synoptic
      {
        lat: 11,
        lon: 125,
        windKnots: 100,
        timestamp: new Date("2013-11-08T03:00:00Z"),
      }, // non-synoptic, excluded
      {
        lat: 12,
        lon: 124,
        windKnots: 60,
        timestamp: new Date("2013-11-08T06:00:00Z"),
      }, // synoptic
    ];
    // only 00:00 and 06:00 count: (100² + 60²) / 10000 = 1.36
    expect(calculateTotalStormACE(track)).toBeCloseTo(1.36, 2);
  });
});
