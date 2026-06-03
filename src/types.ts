export type Person = {
  id: string;
  name: string;
};

export type SettingsTab = "people" | "sources";

export type Source = {
  id: string;
  name: string;
};

export type Entry = {
  id: string;
  amountCents: number;
  source: string;
  note: string;
  personId: string;
  createdAt: Date;
};
