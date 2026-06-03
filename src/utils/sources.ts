import type { PurchaseSource } from "../types";

export const getPreferredSourceName = (sources: PurchaseSource[]) =>
  sources.find((source) => source.name.toLowerCase() === "default")?.name ||
  sources[0]?.name ||
  "";
