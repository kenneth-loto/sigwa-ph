"use client";

import { useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { type HomePageTab, homePageSearchParams } from "@/lib/home-page-parser";

interface HomePageTabsProps {
  overview: ReactNode;
  aceRankingTable: ReactNode;
  // incidentFeedTable: ReactNode;
}

export function HomePageTabs({
  overview,
  aceRankingTable,
  // incidentFeedTable,
}: HomePageTabsProps) {
  const isMobile = useIsMobile();
  const [tab, setTab] = useQueryState(
    "tab",
    homePageSearchParams.tab.withOptions({
      shallow: true,
      history: "replace",
    }),
  );

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as HomePageTab)}
      orientation={isMobile ? "vertical" : "horizontal"}
      className="flex w-full flex-col gap-6"
    >
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="ace-ranking-table">ACE Ranking Table</TabsTrigger>
        {/*<TabsTrigger value="incident-feed-table">
          Incident Feed Table
        </TabsTrigger>*/}
      </TabsList>
      <TabsContent value="overview">{overview}</TabsContent>
      <TabsContent value="ace-ranking-table">{aceRankingTable}</TabsContent>
      {/*<TabsContent value="incident-feed-table">{incidentFeedTable}</TabsContent>*/}
    </Tabs>
  );
}
