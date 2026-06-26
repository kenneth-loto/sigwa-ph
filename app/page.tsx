import { getHistoricalStorms } from "@/app/dal/ibtracs";
import { Overview } from "@/features/overview";
import {
  getACEDistribution,
  getHistoricalMetrics,
  groupBySeason,
  rankStormsByACE,
} from "@/lib/storm-analytics";
// import type { LiveAdvisory } from "@/types/storms";

// async function getLiveAdvisory(): Promise<LiveAdvisory | null> {
//   return null;
// }

export default async function HomePage() {
  const [historicalStorms] = await Promise.all([
    getHistoricalStorms(),
    // getLiveAdvisory(),
  ]);

  const rankedStorms = rankStormsByACE(historicalStorms);
  const seasonSummaries = groupBySeason(historicalStorms);
  const historicalMetrics = getHistoricalMetrics(historicalStorms);
  const aceDistribution = getACEDistribution(historicalStorms);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl tracking-tight">Sigwa PH</h1>
          {/*<ModeToggle />*/}
        </div>
        <p className="text-base text-muted-foreground">
          Typhoon energy analytics for the Philippine Area of Responsibility,
          ranked by Accumulated Cyclone Energy (ACE).
        </p>
      </header>

      <Overview
        metrics={historicalMetrics}
        seasonSummaries={seasonSummaries}
        aceDistribution={aceDistribution}
      />
    </div>
  );
}
