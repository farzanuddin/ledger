import { sourceIdFromName } from "./utils/ids";

export const ledgerId = (personId: string) =>
  `ledger-${sourceIdFromName(personId) || "default"}`;
