import { sourceIdFromName } from "./utils/ledger";

export const ledgerId = (personId: string) =>
  `ledger-${sourceIdFromName(personId) || "default"}`;
