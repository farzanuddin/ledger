import type { Source } from "../types";

export const sourceIdFromName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getPreferredSourceName = (sources: Source[]) =>
  sources.find((source) => source.name.toLowerCase() === "default")?.name ||
  sources[0]?.name ||
  "";
