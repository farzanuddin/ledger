const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberWords: Record<number, string> = {
  0: "Zero",
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
  10: "Ten",
};

export const formatDecimalAmount = (amount: number) => amountFormatter.format(amount);

export const formatAmount = (amountCents: number) =>
  `${amountCents < 0 ? "(" : ""}AED ${amountFormatter.format(
    Math.abs(amountCents) / 100,
  )}${amountCents < 0 ? ")" : ""}`;

export const formatEntryDate = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const formatPeopleCountLabel = (count: number) => {
  const countLabel = numberWords[count] ?? String(count);
  return `${countLabel}-Person Ledger`;
};
