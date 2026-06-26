"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { SeasonSummary } from "@/types/storms";

const chartConfig: ChartConfig = {
  count: {
    label: "Season",
    color: "var(--chart-1)",
  },
};

interface SeasonSummaryChartProps {
  data: SeasonSummary[];
}

export function SeasonSummaryChart({ data }: SeasonSummaryChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-65 w-full">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="year"
          width={110}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="totalACE"
          fill="var(--color-count)"
          radius={[0, 4, 4, 0]}
          barSize={20}
        />
      </BarChart>
    </ChartContainer>
  );
}
