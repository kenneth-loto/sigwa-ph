import { describe, expect, test } from "bun:test";
import type { TyphoonStorm } from "@/types/storms";
import {
  calculateHistoricalPercentile,
  getACEDistribution,
  getHistoricalMetrics,
  groupBySeason,
  rankStormsByACE,
} from "../storm-analytics";

const makeStorm = (
  name: string,
  season: number,
  totalACE: number,
): TyphoonStorm => ({
  sid: `${season}-${name}`,
  name,
  season,
  trackPoints: [],
  totalACE,
  peakWind: 0,
  parIntervalCount: 1,
});

const sampleStorms: TyphoonStorm[] = [
  makeStorm("HAIYAN", 2013, 13.85),
  makeStorm("KETSANA", 2009, 1.58),
  makeStorm("MINOR_A", 2009, 0.5),
  makeStorm("MINOR_B", 2020, 0.9),
  makeStorm("MID_RANGE", 2020, 3.0),
];

describe("rankStormsByACE", () => {
  test("sorts descending by totalACE", () => {
    const ranked = rankStormsByACE(sampleStorms);
    expect(ranked.map((s) => s.name)).toEqual([
      "HAIYAN",
      "MID_RANGE",
      "KETSANA",
      "MINOR_B",
      "MINOR_A",
    ]);
  });

  test("does not mutate the input array", () => {
    const input = [makeStorm("A", 2020, 5), makeStorm("B", 2020, 10)];
    rankStormsByACE(input);
    expect(input[0].name).toBe("A");
  });

  test("returns empty array for empty input", () => {
    expect(rankStormsByACE([])).toEqual([]);
  });
});

describe("groupBySeason", () => {
  test("groups correctly and sorts ascending by year", () => {
    const summaries = groupBySeason(sampleStorms);
    expect(summaries.map((s) => s.year)).toEqual([2009, 2013, 2020]);
  });

  test("computes correct stormCount per season", () => {
    const summaries = groupBySeason(sampleStorms);
    const season2009 = summaries.find((s) => s.year === 2009);
    expect(season2009).toBeDefined();
    expect(season2009?.stormCount).toBe(2);
  });

  test("identifies mostEnergeticStorm correctly", () => {
    const summaries = groupBySeason(sampleStorms);
    const season2009 = summaries.find((s) => s.year === 2009);
    expect(season2009).toBeDefined();
    expect(season2009?.mostEnergeticStorm?.name).toBe("KETSANA");
  });

  test("totalACE is sum of all storms in season", () => {
    const summaries = groupBySeason(sampleStorms);
    const season2009 = summaries.find((s) => s.year === 2009);
    expect(season2009).toBeDefined();
    expect(season2009?.totalACE).toBeCloseTo(2.08, 2);
  });

  test("returns empty array for empty input", () => {
    expect(groupBySeason([])).toEqual([]);
  });
});

describe("getHistoricalMetrics", () => {
  test("returns null for empty input", () => {
    expect(getHistoricalMetrics([])).toBeNull();
  });

  test("identifies all-time top storm correctly", () => {
    const metrics = getHistoricalMetrics(sampleStorms);
    expect(metrics).not.toBeNull();
    expect(metrics?.allTimeTopStorm.name).toBe("HAIYAN");
  });

  test("identifies most active season correctly", () => {
    const metrics = getHistoricalMetrics(sampleStorms);
    expect(metrics).not.toBeNull();
    expect(metrics?.mostActiveSeason.year).toBe(2013);
  });

  test("totalStormsOnRecord matches input length", () => {
    const metrics = getHistoricalMetrics(sampleStorms);
    expect(metrics).not.toBeNull();
    expect(metrics?.totalStormsOnRecord).toBe(5);
  });

  test("avgACEPerStorm is correct", () => {
    const metrics = getHistoricalMetrics(sampleStorms);
    expect(metrics).not.toBeNull();
    const expected = (13.85 + 1.58 + 0.5 + 0.9 + 3.0) / 5;
    expect(metrics?.avgACEPerStorm).toBeCloseTo(expected, 5);
  });
});

describe("getACEDistribution", () => {
  test("all buckets present even if count is 0", () => {
    const buckets = getACEDistribution(sampleStorms);
    expect(buckets).toHaveLength(5);
  });

  test("buckets storms into correct ranges", () => {
    const buckets = getACEDistribution(sampleStorms);
    const byLabel = Object.fromEntries(buckets.map((b) => [b.label, b.count]));
    expect(byLabel["0–1"]).toBe(2);
    expect(byLabel["1–2.5"]).toBe(1);
    expect(byLabel["2.5–5"]).toBe(1);
    expect(byLabel["5–10"]).toBe(0);
    expect(byLabel["10+"]).toBe(1);
  });

  test("returns all-zero buckets for empty input", () => {
    const buckets = getACEDistribution([]);
    expect(buckets.every((b) => b.count === 0)).toBe(true);
  });
});

describe("calculateHistoricalPercentile", () => {
  test("returns 0 for empty historical set", () => {
    expect(calculateHistoricalPercentile(5, [])).toBe(0);
  });

  test("returns 0 for ACE below all historical storms", () => {
    expect(calculateHistoricalPercentile(0, sampleStorms)).toBe(0);
  });

  test("returns 100 for ACE above all historical storms", () => {
    expect(calculateHistoricalPercentile(999, sampleStorms)).toBe(100);
  });

  test("correctly computes mid-range percentile", () => {
    expect(calculateHistoricalPercentile(2.0, sampleStorms)).toBe(60);
  });

  test("uses strict greater-than, not >=", () => {
    expect(calculateHistoricalPercentile(1.58, sampleStorms)).toBe(40);
  });
});
