export const sourceIdFromName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const ledgerId = (personId: string) =>
  `ledger-${sourceIdFromName(personId) || "default"}`;

