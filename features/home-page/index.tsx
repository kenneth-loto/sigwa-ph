import { connection } from "next/server";
import { getHistoricalStorms } from "@/app/dal/ibtracs";
// import { EnergyTable } from "@/features/energy-table";
import { HomePageTabs } from "@/features/home-page/components/tabs";
// import { IncidentFeedTable } from "@/features/incident-feed-table";
import { Overview } from "@/features/overview";
import {
  getACEDistribution,
  getHistoricalMetrics,
  groupBySeason,
  rankStormsByACE,
} from "@/lib/storm-analytics";
import { AceRankingTable } from "../ace-ranking-table";

export async function HomePageContent() {
  await connection();

  const historicalStorms = await getHistoricalStorms();

  const rankedStorms = rankStormsByACE(historicalStorms);
  const seasonSummaries = groupBySeason(historicalStorms);
  const historicalMetrics = getHistoricalMetrics(historicalStorms);
  const aceDistribution = getACEDistribution(historicalStorms);

  return (
    <HomePageTabs
      overview={
        <Overview
          metrics={historicalMetrics}
          seasonSummaries={seasonSummaries}
          aceDistribution={aceDistribution}
        />
      }
      aceRankingTable={<AceRankingTable storms={rankedStorms} />}
      // incidentFeedTable={
      //   <IncidentFeedTable incidentFeedItems={incidentFeedItems} />
      // }
    />
  );
}
