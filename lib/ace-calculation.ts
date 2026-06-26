import type { StormTrackPoint } from "@/types/storms";

export function calculateACEForInterval(windKnots: number): number {
  if (windKnots < 34) return 0;

  return windKnots ** 2 / 10000;
}

export function calculateTotalStormACE(
  parTrackPoints: StormTrackPoint[],
): number {
  const synopticPoints = parTrackPoints.filter((point) => {
    const hours = new Date(point.timestamp).getUTCHours();
    return hours === 0 || hours === 6 || hours === 12 || hours === 18;
  });

  return synopticPoints.reduce(
    (total, point) => total + calculateACEForInterval(point.windKnots),
    0,
  );
}
