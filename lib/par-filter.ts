import type { StormTrackPoint } from "@/types/storms";
import { PAR_POLYGON } from "./constants";

function isPointInsidePolygon(
  lat: number,
  lon: number,
  polygon: ReadonlyArray<readonly [number, number]>,
): boolean {
  let inside = false;
  const vertexCount = polygon.length;

  for (let i = 0, j = vertexCount - 1; i < vertexCount; j = i++) {
    const [latI, lonI] = polygon[i];
    const [latJ, lonJ] = polygon[j];

    const crossesEdge =
      latI > lat !== latJ > lat &&
      lon < ((lonJ - lonI) * (lat - latI)) / (latJ - latI) + lonI;

    if (crossesEdge) inside = !inside;
  }

  return inside;
}

export function isInsidePAR(lat: number, lon: number): boolean {
  return isPointInsidePolygon(lat, lon, PAR_POLYGON);
}

export function filterTrackToPAR(
  trackPoints: StormTrackPoint[],
): StormTrackPoint[] {
  return trackPoints.filter((point) => isInsidePAR(point.lat, point.lon));
}
