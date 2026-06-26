import type {
  HistoricalMetrics,
  SeasonSummary,
  TyphoonStorm,
} from "@/types/storms";

export function rankStormsByACE(storms: TyphoonStorm[]): TyphoonStorm[] {
  return [...storms].sort((a, b) => b.totalACE - a.totalACE);
}

export function groupBySeason(storms: TyphoonStorm[]): SeasonSummary[] {
  const byYear = new Map<number, TyphoonStorm[]>();

  for (const storm of storms) {
    const existing = byYear.get(storm.season);
    if (existing) {
      existing.push(storm);
    } else {
      byYear.set(storm.season, [storm]);
    }
  }

  const summaries: SeasonSummary[] = [];

  for (const [year, seasonStorms] of byYear) {
    const totalACE = seasonStorms.reduce((sum, s) => sum + s.totalACE, 0);
    const mostEnergeticStorm = seasonStorms.reduce((top, current) =>
      current.totalACE > top.totalACE ? current : top,
    );

    summaries.push({
      year,
      totalACE,
      stormCount: seasonStorms.length,
      mostEnergeticStorm,
    });
  }

  return summaries.sort((a, b) => a.year - b.year);
}

export function getHistoricalMetrics(
  storms: TyphoonStorm[],
): HistoricalMetrics | null {
  if (storms.length === 0) return null;

  const ranked = rankStormsByACE(storms);
  const allTimeTopStorm = ranked[0];

  const seasons = groupBySeason(storms);
  const mostActiveSeason = seasons.reduce((top, current) =>
    current.totalACE > top.totalACE ? current : top,
  );

  const totalACEAcrossAllStorms = storms.reduce(
    (sum, s) => sum + s.totalACE,
    0,
  );
  const avgACEPerStorm = totalACEAcrossAllStorms / storms.length;

  return {
    allTimeTopStorm,
    mostActiveSeason,
    avgACEPerStorm,
    totalStormsOnRecord: storms.length,
  };
}

export interface ACEDistributionBucket {
  label: string;
  minACE: number;
  maxACE: number | null;
  count: number;
}

const ACE_DISTRIBUTION_BOUNDARIES: ReadonlyArray<{
  label: string;
  minACE: number;
  maxACE: number | null;
}> = [
  { label: "0–1", minACE: 0, maxACE: 1 },
  { label: "1–2.5", minACE: 1, maxACE: 2.5 },
  { label: "2.5–5", minACE: 2.5, maxACE: 5 },
  { label: "5–10", minACE: 5, maxACE: 10 },
  { label: "10+", minACE: 10, maxACE: null },
];

export function getACEDistribution(
  storms: TyphoonStorm[],
): ACEDistributionBucket[] {
  return ACE_DISTRIBUTION_BOUNDARIES.map(({ label, minACE, maxACE }) => {
    const count = storms.filter((storm) => {
      const aboveMin = storm.totalACE >= minACE;
      const belowMax = maxACE === null ? true : storm.totalACE < maxACE;
      return aboveMin && belowMax;
    }).length;

    return { label, minACE, maxACE, count };
  });
}

export function calculateHistoricalPercentile(
  stormACE: number,
  allStorms: TyphoonStorm[],
): number {
  if (allStorms.length === 0) return 0;
  const exceededCount = allStorms.filter((s) => stormACE > s.totalACE).length;

  return Math.round((exceededCount / allStorms.length) * 100 * 10) / 10;
}
