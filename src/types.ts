export type Person = {
  id: string;
  name: string;
};

export type SettingsTab = "people" | "sources";

export type PurchaseSource = {
  id: string;
  name: string;
};

export type LedgerEntry = {
  id: string;
  amountCents: number;
  source: string;
  note: string;
  personId: string;
  user: string;
  createdAt: Date;
};
