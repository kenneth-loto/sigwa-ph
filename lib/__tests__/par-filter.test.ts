import { describe, expect, test } from "bun:test";
import { filterTrackToPAR, isInsidePAR } from "../par-filter";

describe("PAR Filter", () => {
  test("Yolanda landfall (11°N, 125°E) is inside PAR", () => {
    expect(isInsidePAR(11, 125)).toBe(true);
  });

  test("Point near Japan (35°N, 135°E) is outside PAR", () => {
    expect(isInsidePAR(35, 135)).toBe(false);
  });

  test("Point far west (10°N, 90°E) is outside PAR", () => {
    expect(isInsidePAR(10, 90)).toBe(false);
  });

  test("NW wedge (23°N, 117°E) is outside PAR — bounding box would wrongly pass this", () => {
    expect(isInsidePAR(23, 117)).toBe(false);
  });

  test("Point near jog vertex (20°N, 122°E) is inside PAR", () => {
    expect(isInsidePAR(20, 122)).toBe(true);
  });

  test("filterTrackToPAR keeps only in-PAR points", () => {
    const track = [
      { lat: 11, lon: 125, windKnots: 170, timestamp: new Date() },
      { lat: 35, lon: 135, windKnots: 60, timestamp: new Date() },
    ];
    expect(filterTrackToPAR(track)).toHaveLength(1);
  });

  test("filterTrackToPAR returns empty array for empty input", () => {
    expect(filterTrackToPAR([])).toEqual([]);
  });
});
