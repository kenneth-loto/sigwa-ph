import { CalendarIcon, ChartColumnIcon, WindIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ACEDistributionBucket } from "@/lib/storm-analytics";
import { formatACE } from "@/lib/utils";
import type { HistoricalMetrics, SeasonSummary } from "@/types/storms";
import { AceDistributionChart } from "./components/ace-distribution-chart";
import { EmptyChart } from "./components/empty-chart";
import { MetricsCard } from "./components/metrics-card";
import { SeasonSummaryChart } from "./components/season-summary-chart";

interface OverviewProps {
  metrics: HistoricalMetrics | null;
  seasonSummaries: SeasonSummary[];
  aceDistribution: ACEDistributionBucket[];
}

export function Overview({
  metrics,
  seasonSummaries,
  aceDistribution,
}: OverviewProps) {
  if (!metrics) return null;

  const {
    allTimeTopStorm,
    mostActiveSeason,
    avgACEPerStorm,
    totalStormsOnRecord,
  } = metrics;

  const hasSeasonSummaries = seasonSummaries.length > 0;
  const hasAceDistribution = aceDistribution.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
        <MetricsCard
          label="Most energetic typhoon in PAR"
          icon={<WindIcon className="h-4 w-4" />}
          value={formatACE(allTimeTopStorm.totalACE)}
          sub={`${allTimeTopStorm.name} · ${allTimeTopStorm.season}`}
        />

        <MetricsCard
          label="Most active season"
          icon={<CalendarIcon className="h-4 w-4" />}
          value={formatACE(mostActiveSeason.totalACE)}
          sub={`${mostActiveSeason.year} · ${mostActiveSeason.stormCount} storm${mostActiveSeason.stormCount === 1 ? "" : "s"} entered PAR`}
        />

        <MetricsCard
          label="Average ACE per typhoon"
          icon={<ChartColumnIcon className="h-4 w-4" />}
          value={formatACE(avgACEPerStorm)}
          sub={`across ${totalStormsOnRecord.toLocaleString()} storms on record`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <Card className="rounded-md border">
          <CardHeader>
            <CardTitle> Total ACE by Season</CardTitle>
            <CardDescription>
              Duration inside PAR matters as much as peak intensity. A
              slow-moving storm can outrank a busier season of weaker systems.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasSeasonSummaries ? (
              <SeasonSummaryChart data={seasonSummaries} />
            ) : (
              <EmptyChart />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-md border">
          <CardHeader>
            <CardTitle>ACE Distribution</CardTitle>
            <CardDescription>
              Most storms cluster in the lower ACE ranges. The few outliers on
              the right represent rare long-duration or high-intensity systems.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasAceDistribution ? (
              <AceDistributionChart data={aceDistribution} />
            ) : (
              <EmptyChart />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
