import { DataTable } from "@/components/data-table";
import { getSeasonFilterOptions } from "@/lib/utils";
import type { FilterConfig } from "@/types/data-table";
import type { TyphoonStorm } from "@/types/storms";
import { aceRankingColumns } from "./components/columns";

interface AceRankingTableProps {
  storms: TyphoonStorm[];
}

export async function AceRankingTable({ storms }: AceRankingTableProps) {
  const filters: FilterConfig[] = [
    {
      columnId: "season",
      title: "Season",
      options: getSeasonFilterOptions(storms),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h2 className="font-semibold text-xl tracking-tight">ACE Rankings</h2>
        <p className="text-muted-foreground text-sm">
          Every PAR-entering storm ranked by total accumulated cyclone energy.
        </p>
      </div>
      <DataTable
        id="art"
        columns={aceRankingColumns}
        data={storms}
        filters={filters}
      />
    </div>
  );
}
