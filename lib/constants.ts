export const THEME_TOGGLE_KEY = "m";

export const PAR_POLYGON: ReadonlyArray<readonly [number, number]> = [
  [5, 115],
  [15, 115],
  [21, 120],
  [25, 120],
  [25, 135],
  [5, 135],
] as const;
export const PAR_BOUNDS = {
  north: 25,
  south: 5,
  east: 135,
  west: 115,
} as const;
