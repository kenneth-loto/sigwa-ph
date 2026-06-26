import Papa from "papaparse";
import { calculateTotalStormACE } from "@/lib/ace-calculation";
import { filterTrackToPAR } from "@/lib/par-filter";
import type {
  IBTraCSRecord,
  StormTrackPoint,
  TyphoonStorm,
} from "@/types/storms";

const ACCEPTED_TRACK_TYPES = new Set(["MAIN"]);
const ACCEPTED_NATURE_VALUES = new Set(["TS"]);

export function parseIBTraCSNumber(rawValue: string | undefined): number {
  const trimmed = (rawValue ?? "").trim();
  if (trimmed === "") return NaN;
  return Number(trimmed);
}

export function parseIBTraCSCSV(rawCSV: string): IBTraCSRecord[] {
  const parsed = Papa.parse<Record<string, string>>(rawCSV, {
    header: true,
    skipEmptyLines: true,
  });

  const dataRows = parsed.data.filter((row, index) => {
    if (index === 0) {
      const seasonValue = row.SEASON ?? row.season;
      return (
        seasonValue !== undefined &&
        !Number.isNaN(parseIBTraCSNumber(seasonValue))
      );
    }
    return true;
  });

  const records: IBTraCSRecord[] = [];

  for (const row of dataRows) {
    const trackType = (row.TRACK_TYPE ?? "").trim().toUpperCase();
    const nature = (row.NATURE ?? "").trim().toUpperCase();

    if (!ACCEPTED_TRACK_TYPES.has(trackType)) continue;
    if (!ACCEPTED_NATURE_VALUES.has(nature)) continue;

    const wind = parseIBTraCSNumber(row.WMO_WIND);
    const lat = parseIBTraCSNumber(row.LAT);
    const lon = parseIBTraCSNumber(row.LON);
    const season = parseIBTraCSNumber(row.SEASON);

    if (
      Number.isNaN(wind) ||
      Number.isNaN(lat) ||
      Number.isNaN(lon) ||
      Number.isNaN(season)
    ) {
      continue;
    }

    records.push({
      sid: row.SID,
      name: row.NAME,
      season,
      lat,
      lon,
      wind,
      pres: parseIBTraCSNumber(row.WMO_PRES) || 0,
      time: row.ISO_TIME,
      track_type: trackType,
      nature,
    });
  }

  return records;
}

/**
 * Converts a single IBTraCSRecord into a StormTrackPoint.
 */
function recordToTrackPoint(record: IBTraCSRecord): StormTrackPoint {
  return {
    lat: record.lat,
    lon: record.lon,
    windKnots: record.wind,
    timestamp: new Date(`${record.time}Z`),
    rawTime: record.time,
  };
}

export function groupRecordsIntoStorms(
  records: IBTraCSRecord[],
): TyphoonStorm[] {
  const bySid = new Map<string, IBTraCSRecord[]>();
  for (const record of records) {
    const existing = bySid.get(record.sid);
    if (existing) {
      existing.push(record);
    } else {
      bySid.set(record.sid, [record]);
    }
  }

  const storms: TyphoonStorm[] = [];

  for (const [sid, stormRecords] of bySid) {
    const allTrackPoints = stormRecords.map(recordToTrackPoint);
    const parTrackPoints = filterTrackToPAR(allTrackPoints);

    if (parTrackPoints.length === 0) continue;

    const totalACE = calculateTotalStormACE(parTrackPoints);
    const peakWind = Math.max(...parTrackPoints.map((p) => p.windKnots));
    const { name, season } = stormRecords[0];

    const parIntervalCount = parTrackPoints.filter((p) => {
      const hours = p.timestamp.getUTCHours();
      return hours === 0 || hours === 6 || hours === 12 || hours === 18;
    }).length;

    storms.push({
      sid,
      name,
      season,
      trackPoints: parTrackPoints,
      totalACE,
      peakWind,
      parIntervalCount,
    });
  }

  return storms;
}
