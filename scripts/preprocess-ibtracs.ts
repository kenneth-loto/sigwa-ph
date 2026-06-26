import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { groupRecordsIntoStorms, parseIBTraCSCSV } from "@/lib/ibtracs-parser";

const IBTRACS_WP_CSV_URL =
  "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01/access/csv/ibtracs.WP.list.v04r01.csv";

const OUTPUT_DIR = join(process.cwd(), "data");
const OUTPUT_PATH = join(OUTPUT_DIR, "historical-storms.json");

async function main() {
  console.log("[preprocess-ibtracs] Fetching IBTrACS WP CSV from NOAA...");
  console.log(`[preprocess-ibtracs] URL: ${IBTRACS_WP_CSV_URL}`);

  const startFetch = performance.now();
  const response = await fetch(IBTRACS_WP_CSV_URL);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch IBTrACS CSV: ${response.status} ${response.statusText}`,
    );
  }

  const rawCSV = await response.text();
  const fetchMs = Math.round(performance.now() - startFetch);
  console.log(
    `[preprocess-ibtracs] Fetched ${(rawCSV.length / 1_000_000).toFixed(1)}MB in ${fetchMs}ms`,
  );

  console.log("[preprocess-ibtracs] Parsing CSV...");
  const startParse = performance.now();
  const records = parseIBTraCSCSV(rawCSV);
  const parseMs = Math.round(performance.now() - startParse);
  console.log(
    `[preprocess-ibtracs] Parsed ${records.length} records in ${parseMs}ms`,
  );

  console.log("[preprocess-ibtracs] Grouping into storms + computing ACE...");
  const startGroup = performance.now();
  const storms = groupRecordsIntoStorms(records);
  const groupMs = Math.round(performance.now() - startGroup);
  console.log(
    `[preprocess-ibtracs] Produced ${storms.length} PAR-entering storms in ${groupMs}ms`,
  );

  // Summary for the GitHub Actions log — useful to spot unexpected
  // changes between annual runs (e.g. storm count shifting a lot may
  // indicate a reanalysis changed something significant).
  const seasons = [...new Set(storms.map((s) => s.season))].sort();
  console.log(
    `[preprocess-ibtracs] Season range: ${seasons[0]} – ${seasons[seasons.length - 1]}`,
  );
  console.log(
    `[preprocess-ibtracs] Top storm by ACE: ${
      storms.sort((a, b) => b.totalACE - a.totalACE)[0].name
    } (${storms.sort((a, b) => b.totalACE - a.totalACE)[0].season})`,
  );

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(storms, null, 2));
  console.log(`[preprocess-ibtracs] Written to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error("[preprocess-ibtracs] Fatal error:", error);
  process.exit(1);
});
