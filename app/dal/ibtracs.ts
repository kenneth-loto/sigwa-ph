import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { TyphoonStorm } from "@/types/storms";

const DATA_PATH = join(process.cwd(), "data", "historical-storms.json");

export async function getHistoricalStorms(): Promise<TyphoonStorm[]> {
  try {
    const raw = await readFile(DATA_PATH, "utf-8");

    return JSON.parse(raw) as TyphoonStorm[];
  } catch (error) {
    console.error(
      "[ibtracs] Failed to read historical-storms.json. " +
        "Run `bun run scripts/preprocess-ibtracs.ts` to generate it.",
      error,
    );
    return [];
  }
}
