import type { Person, Source } from "../types";

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
  const parsedAmount = Number.parseFloat(amount);

  if (!amount.trim()) {
    return {
      ok: false,
      title: "Enter an amount",
      message: "Amount cannot be empty.",
    };
  }

  if (!Number.isFinite(parsedAmount)) {
    return {
      ok: false,
      title: "Enter an amount",
      message: "Amount is not valid.",
    };
  }

  if (Math.round(parsedAmount * 100) === 0) {
    return {
      ok: false,
      title: "Amount cannot be zero",
      message: "Amount cannot be 0.",
    };
  }

  if (!note.trim()) {
    return {
      ok: false,
      title: "Enter a note",
      message: "Note cannot be blank.",
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
  sources: Source[],
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
