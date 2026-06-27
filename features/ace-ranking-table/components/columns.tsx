"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ColumnHeader } from "@/components/data-table/components";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDuration } from "@/lib/utils";
import type { TyphoonStorm } from "@/types/storms";

export const aceRankingColumns: ColumnDef<TyphoonStorm>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { enableGlobalFilter: false },
  },
  {
    id: "rowNumber",
    header: () => <span className="text-muted-foreground text-xs">#</span>,
    enableSorting: false,
    enableHiding: false,
    meta: { enableGlobalFilter: false },
  },
  {
    accessorKey: "name",
    header: ({ column }) => <ColumnHeader column={column} title="Storm" />,
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "season",
    header: ({ column }) => <ColumnHeader column={column} title="Season" />,
    cell: ({ row }) => <div className="text-sm">{row.getValue("season")}</div>,
    filterFn: (row, columnId, filterValues: string[]) => {
      const season = row.getValue<number>(columnId);

      return filterValues.map(Number).includes(season);
    },
  },
  {
    accessorKey: "peakWind",
    header: ({ column }) => <ColumnHeader column={column} title="Peak Wind" />,
    cell: ({ row }) => (
      <div className="text-sm">
        {(row.getValue("peakWind") as number).toFixed(2)} kt
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "parIntervalCount",
    header: ({ column }) => (
      <ColumnHeader column={column} title="Duration in PAR" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">
        {formatDuration(row.getValue("parIntervalCount"))}
      </div>
    ),
  },
  {
    accessorKey: "totalACE",
    header: ({ column }) => <ColumnHeader column={column} title="Total ACE" />,
    cell: ({ row, table }) => {
      const ace = row.getValue("totalACE") as number;
      const allRows = table.getCoreRowModel().rows;
      const maxAce = Math.max(
        1,
        ...allRows.map((r) => r.getValue("totalACE") as number),
      );
      const barWidth = (ace / maxAce) * 100;

      return (
        <div className="flex items-center gap-2">
          <span className="w-12 shrink-0 font-mono text-chart-1 text-sm tabular-nums">
            {ace.toFixed(2)}
          </span>
          <span className="h-2 flex-1 overflow-hidden rounded bg-muted">
            <span
              className="block h-full rounded bg-chart-1"
              style={{ width: `${barWidth}%` }}
            />
          </span>
        </div>
      );
    },
  },
];
