import type { Person, PurchaseSource } from "../types";

export type ValidationResult =
  | { ok: true }
  | { message: string; ok: false; title: string };

export const sanitizeAmountInput = (value: string) => value.replace(/[^0-9.-]/g, "");

export const parseAmountCents = (amount: string) => {
  const parsedAmount = Number.parseFloat(amount);
  return Number.isFinite(parsedAmount) && parsedAmount !== 0
    ? Math.round(parsedAmount * 100)
    : null;
};

export const validateEntryInput = ({
  amount,
  note,
  source,
}: {
  amount: string;
  note: string;
  source: string;
}): ValidationResult => {
  if (parseAmountCents(amount) === null) {
    return {
      ok: false,
      title: "Enter an amount",
      message: "Use a number like 24.50, or -24.50 when you owe money.",
    };
  }

  if (!note.trim()) {
    return {
      ok: false,
      title: "Enter a note",
      message: "Add a short note for this ledger entry.",
    };
  }

  if (!source.trim()) {
    return {
      ok: false,
      title: "Choose a source",
      message: "Select where this entry came from.",
    };
  }

  return { ok: true };
};

export const validatePersonName = (
  name: string,
  people: Person[],
): ValidationResult => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      ok: false,
      title: "Enter a name",
      message: "Enter the person's name.",
    };
  }

  if (people.some((item) => item.name.toLowerCase() === trimmedName.toLowerCase())) {
    return {
      ok: false,
      title: "Person already exists",
      message: `${trimmedName} is already listed.`,
    };
  }

  return { ok: true };
};

export const validateSourceName = (
  name: string,
  sources: PurchaseSource[],
): ValidationResult => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      ok: false,
      title: "Enter a source",
      message: "Use a name like Amazon or Groceries.",
    };
  }

  if (sources.some((item) => item.name.toLowerCase() === trimmedName.toLowerCase())) {
    return {
      ok: false,
      title: "Source already exists",
      message: `${trimmedName} is already listed.`,
    };
  }

  return { ok: true };
};
