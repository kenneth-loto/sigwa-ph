import { describe, expect, test } from "bun:test";
import {
  groupRecordsIntoStorms,
  parseIBTraCSCSV,
  parseIBTraCSNumber,
} from "../ibtracs-parser";

const FIXTURE_CSV = `SID,NAME,SEASON,LAT,LON,WMO_WIND,WMO_PRES,ISO_TIME,TRACK_TYPE,NATURE
SID,NAME,Year,deg_north,deg_east,knots,mb,UTC,,,
2013306N07151,HAIYAN,2013,8.0,133.0,140,890,2013-11-07 00:00:00,MAIN,TS
2013306N07151,HAIYAN,2013,9.0,129.0,155,858,2013-11-07 06:00:00,MAIN,TS
2013306N07151,HAIYAN,2013,11.0,125.0,170,895,2013-11-08 00:00:00,MAIN,TS
2013306N07151,HAIYAN,2013,14.0,112.0,60,970,2013-11-09 00:00:00,MAIN,ET
2009262N12148,KETSANA,2009,12.0,121.0,60,985,2009-09-26 00:00:00,MAIN,TS
2009262N12148,KETSANA,2009,14.0,118.0,55,990,2009-09-26 06:00:00,MAIN,TS
2013999N99999,GHOSTSPUR,2013,11.0,125.0,100,950,2013-11-07 00:00:00,SPUR,TS
2020999N99999,FARAWAY,2020,30.0,135.0,80,960,2020-09-01 00:00:00,MAIN,TS
2021999N99999,MISSINGWIND,2021,10.0,125.0, ,990,2021-01-01 00:00:00,MAIN,TS
2021999N99999,MISSINGWIND,2021,11.0,124.0,70,985,2021-01-01 06:00:00,MAIN,TS`;

describe("parseIBTraCSNumber", () => {
  test("parses valid numeric strings", () => {
    expect(parseIBTraCSNumber("140")).toBe(140);
    expect(parseIBTraCSNumber("8.5")).toBe(8.5);
  });

  test("returns NaN for empty string", () => {
    expect(Number.isNaN(parseIBTraCSNumber(""))).toBe(true);
  });

  test("returns NaN for whitespace-only string — not 0", () => {
    expect(Number.isNaN(parseIBTraCSNumber(" "))).toBe(true);
  });

  test("returns NaN for undefined", () => {
    expect(Number.isNaN(parseIBTraCSNumber(undefined))).toBe(true);
  });

  test("returns NaN for non-numeric string", () => {
    expect(Number.isNaN(parseIBTraCSNumber("knots"))).toBe(true);
  });
});

describe("parseIBTraCSCSV", () => {
  test("skips the units row — does not produce a garbage storm from it", () => {
    const records = parseIBTraCSCSV(FIXTURE_CSV);
    expect(records.every((r) => !Number.isNaN(r.season))).toBe(true);
  });

  test("excludes SPUR tracks entirely", () => {
    const records = parseIBTraCSCSV(FIXTURE_CSV);
    expect(records.some((r) => r.name === "GHOSTSPUR")).toBe(false);
  });

  test("excludes ET (extratropical) intervals", () => {
    const records = parseIBTraCSCSV(FIXTURE_CSV);
    const haiyanRecords = records.filter((r) => r.name === "HAIYAN");
    // 3 TS points kept, 1 ET point dropped
    expect(haiyanRecords).toHaveLength(3);
  });

  test("drops rows with space-padded missing wind", () => {
    const records = parseIBTraCSCSV(FIXTURE_CSV);
    const missingWindRecords = records.filter((r) => r.name === "MISSINGWIND");
    expect(missingWindRecords).toHaveLength(1);
    expect(missingWindRecords[0].wind).toBe(70);
  });

  test("parses field values into correct types", () => {
    const records = parseIBTraCSCSV(FIXTURE_CSV);
    const first = records.find((r) => r.name === "HAIYAN");
    expect(first).toBeDefined();
    expect(typeof first?.season).toBe("number");
    expect(typeof first?.lat).toBe("number");
    expect(typeof first?.wind).toBe("number");
  });
});

describe("groupRecordsIntoStorms", () => {
  test("drops storms that never entered PAR", () => {
    const records = parseIBTraCSCSV(FIXTURE_CSV);
    const storms = groupRecordsIntoStorms(records);
    expect(storms.some((s) => s.name === "FARAWAY")).toBe(false);
  });

  test("keeps storms with at least one PAR point", () => {
    const records = parseIBTraCSCSV(FIXTURE_CSV);
    const storms = groupRecordsIntoStorms(records);
    expect(storms.some((s) => s.name === "HAIYAN")).toBe(true);
    expect(storms.some((s) => s.name === "KETSANA")).toBe(true);
  });

  test("parIntervalCount matches PAR-only point count", () => {
    const records = parseIBTraCSCSV(FIXTURE_CSV);
    const storms = groupRecordsIntoStorms(records);
    const haiyan = storms.find((s) => s.name === "HAIYAN");
    expect(haiyan).toBeDefined();
    expect(haiyan?.parIntervalCount).toBe(3);
  });

  test("peakWind is highest wind among PAR points only", () => {
    const records = parseIBTraCSCSV(FIXTURE_CSV);
    const storms = groupRecordsIntoStorms(records);
    const haiyan = storms.find((s) => s.name === "HAIYAN");
    expect(haiyan?.peakWind).toBe(170);
  });

  test("totalACE is scaled (windKnots² / 10000) across PAR points", () => {
    const records = parseIBTraCSCSV(FIXTURE_CSV);
    const storms = groupRecordsIntoStorms(records);
    const haiyan = storms.find((s) => s.name === "HAIYAN");
    expect(haiyan?.totalACE).toBeCloseTo(7.2525, 4);
  });

  test("MISSINGWIND storm keeps only its one valid PAR point", () => {
    const records = parseIBTraCSCSV(FIXTURE_CSV);
    const storms = groupRecordsIntoStorms(records);
    const missingWind = storms.find((s) => s.name === "MISSINGWIND");
    expect(missingWind).toBeDefined();
    expect(missingWind?.parIntervalCount).toBe(1);
  });

  test("returns empty array for empty input", () => {
    expect(groupRecordsIntoStorms([])).toEqual([]);
  });
});
