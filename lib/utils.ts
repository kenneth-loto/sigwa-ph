import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TyphoonStorm } from "@/types/storms";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatACE(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatACEShort(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;

  return `${value}`;
}

export function formatDuration(parIntervalCount: number): string {
  const hours = parIntervalCount * 6;

  if (hours < 24) return `${hours}h`;

  return `${(hours / 24).toFixed(1)}d`;
}

export function formatACEBar(ace: number, maxAce: number): number {
  return (ace / Math.max(1, maxAce)) * 100;
}

export function getDecadeFilterOptions(storms: TyphoonStorm[]) {
  const decades = [
    ...new Set(
      storms.map((storm) => {
        const start = Math.floor(storm.season / 10) * 10;
        return `${start}s`;
      }),
    ),
  ].sort();

  return decades.map((d) => ({ label: d, value: d }));
}

export function getSeasonFilterOptions(storms: TyphoonStorm[]) {
  const seasons = [...new Set(storms.map((storm) => storm.season))].sort(
    (a, b) => b - a,
  );

  return seasons.map((season) => ({
    label: String(season),
    value: String(season),
  }));
}
